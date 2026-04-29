"""
Cold Chain Command Agent
========================
A Gemini-powered agentic workflow using Function Calling (ReAct loop).
The agent has access to real tools that query the live database and can
autonomously create alerts, score risks, and generate an ops report.

Uses: google-genai (new SDK) — replaces deprecated google-generativeai
"""

import os
import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from google import genai
from google.genai import types

from core.database import get_db
from models import models
from schemas import schemas
from services import crud

router = APIRouter(tags=["agent"])

# ─────────────────────────────────────────────
# Tool Definitions (exposed to Gemini)
# ─────────────────────────────────────────────

AGENT_TOOLS = types.Tool(
    function_declarations=[
        types.FunctionDeclaration(
            name="get_fleet_status",
            description=(
                "Fetches the latest real-time telemetry for all active trucks including "
                "temperature, humidity, battery level, door status, and GPS coordinates. "
                "Use this to understand the current state of the entire fleet."
            ),
            parameters=types.Schema(type=types.Type.OBJECT, properties={}),
        ),
        types.FunctionDeclaration(
            name="get_active_alerts",
            description=(
                "Fetches all currently active (unresolved) alerts in the system. "
                "Returns alert type, severity, shipment ID, and message."
            ),
            parameters=types.Schema(type=types.Type.OBJECT, properties={}),
        ),
        types.FunctionDeclaration(
            name="get_shipment_summary",
            description=(
                "Returns a summary of all shipments including counts by status "
                "(planned, in_transit, completed, issue), and pending orders count."
            ),
            parameters=types.Schema(type=types.Type.OBJECT, properties={}),
        ),
        types.FunctionDeclaration(
            name="calculate_risk_score",
            description=(
                "Calculates a composite cold-chain risk score (0-100) for a specific truck "
                "based on temperature deviation, battery level, door status, and humidity. "
                "Score > 70 = Critical, 40-70 = Warning, < 40 = Safe."
            ),
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "truck_id": types.Schema(
                        type=types.Type.INTEGER,
                        description="The ID of the truck to score."
                    )
                },
                required=["truck_id"],
            ),
        ),
        types.FunctionDeclaration(
            name="create_system_alert",
            description=(
                "Creates a new alert in the system when the agent identifies a risk "
                "that hasn't been flagged yet. Use this proactively."
            ),
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "shipment_id": types.Schema(
                        type=types.Type.INTEGER,
                        description="The shipment ID associated with this alert."
                    ),
                    "alert_type": types.Schema(
                        type=types.Type.STRING,
                        description="Category of the alert: temperature, battery, door_open, route, or delay."
                    ),
                    "severity": types.Schema(
                        type=types.Type.STRING,
                        description="Severity level: low, medium, high, or critical."
                    ),
                    "message": types.Schema(
                        type=types.Type.STRING,
                        description="Detailed alert message for operators."
                    ),
                },
                required=["shipment_id", "alert_type", "severity", "message"],
            ),
        ),
        types.FunctionDeclaration(
            name="get_temperature_trend",
            description=(
                "Returns the last 10 temperature readings for a specific shipment "
                "to identify warming or cooling trends."
            ),
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "shipment_id": types.Schema(
                        type=types.Type.INTEGER,
                        description="The shipment ID to analyze temperature trends for."
                    )
                },
                required=["shipment_id"],
            ),
        ),
    ]
)

# ─────────────────────────────────────────────
# Tool Executor — maps tool name → real DB query
# ─────────────────────────────────────────────

def execute_tool(tool_name: str, args: dict, db: Session) -> dict:
    """Execute a tool call and return structured results."""

    if tool_name == "get_fleet_status":
        logs = crud.get_latest_truck_logs(db)
        if not logs:
            return {"status": "no_data", "trucks": [], "count": 0}
        return {
            "count": len(logs),
            "trucks": [
                {
                    "truck_id": l.truck_id,
                    "temperature": round(l.temperature, 2),
                    "humidity": round(l.humidity, 2),
                    "battery_level": round(l.battery_level, 2),
                    "door_status": l.door_status,
                    "latitude": l.latitude,
                    "longitude": l.longitude,
                    "shipment_id": l.shipment_id,
                    "recorded_at": l.recorded_at.isoformat() if l.recorded_at else None,
                    "temp_ok": 2.0 <= l.temperature <= 8.0
                }
                for l in logs
            ]
        }

    elif tool_name == "get_active_alerts":
        alerts = crud.get_active_alerts(db, limit=20)
        return {
            "count": len(alerts),
            "alerts": [
                {
                    "alert_id": a.alert_id,
                    "alert_type": a.alert_type.value,
                    "severity": a.severity.value,
                    "shipment_id": a.shipment_id,
                    "message": a.message,
                    "created_at": a.created_at.isoformat() if a.created_at else None
                }
                for a in alerts
            ]
        }

    elif tool_name == "get_shipment_summary":
        shipments = crud.get_shipments(db, limit=200)
        status_counts = {}
        for s in shipments:
            key = s.shipment_status.value
            status_counts[key] = status_counts.get(key, 0) + 1
        orders = db.query(models.Order).all()
        order_counts = {}
        for o in orders:
            key = o.status.value
            order_counts[key] = order_counts.get(key, 0) + 1
        return {
            "total_shipments": len(shipments),
            "by_status": status_counts,
            "total_orders": len(orders),
            "orders_by_status": order_counts
        }

    elif tool_name == "calculate_risk_score":
        truck_id = int(args.get("truck_id", 0))
        logs = crud.get_latest_truck_logs(db)
        truck_log = next((l for l in logs if l.truck_id == truck_id), None)
        if not truck_log:
            return {"error": f"No data found for truck_id {truck_id}"}

        score = 0
        breakdown = []

        # Temperature risk (0–40 pts)
        temp = truck_log.temperature
        if temp > 10.0:
            score += 40; breakdown.append("CRITICAL: Temperature >10°C (+40)")
        elif temp > 8.0:
            score += 30; breakdown.append(f"HIGH: Temperature {temp}°C exceeds 8°C limit (+30)")
        elif temp > 7.5:
            score += 15; breakdown.append(f"WARNING: Temperature {temp}°C approaching limit (+15)")
        else:
            breakdown.append(f"OK: Temperature {temp}°C within range (+0)")

        # Battery risk (0–25 pts)
        bat = truck_log.battery_level
        if bat < 10:
            score += 25; breakdown.append(f"CRITICAL: Battery {bat}% critically low (+25)")
        elif bat < 20:
            score += 15; breakdown.append(f"HIGH: Battery {bat}% low (+15)")
        elif bat < 30:
            score += 5; breakdown.append(f"WARN: Battery {bat}% moderate (+5)")
        else:
            breakdown.append(f"OK: Battery {bat}% adequate (+0)")

        # Door status (0–20 pts)
        if truck_log.door_status == "open":
            score += 20; breakdown.append("CRITICAL: Door is OPEN — cold air escaping (+20)")
        else:
            breakdown.append("OK: Door closed (+0)")

        # Humidity risk (0–15 pts)
        hum = truck_log.humidity
        if hum > 80:
            score += 15; breakdown.append(f"HIGH: Humidity {hum}% — condensation risk (+15)")
        elif hum > 70:
            score += 8; breakdown.append(f"WARN: Humidity {hum}% elevated (+8)")
        else:
            breakdown.append(f"OK: Humidity {hum}% normal (+0)")

        level = "CRITICAL" if score >= 70 else ("WARNING" if score >= 40 else "SAFE")
        return {
            "truck_id": truck_id,
            "risk_score": score,
            "risk_level": level,
            "breakdown": breakdown,
            "temperature": temp,
            "battery": bat,
            "door": truck_log.door_status,
            "humidity": hum
        }

    elif tool_name == "create_system_alert":
        alert_data = schemas.AlertCreate(
            shipment_id=int(args.get("shipment_id", 0)),
            alert_type=args["alert_type"],
            severity=args["severity"],
            message=args["message"]
        )
        db_alert = crud.create_alert(db, alert_data)
        return {
            "success": True,
            "alert_id": db_alert.alert_id,
            "message": f"Alert #{db_alert.alert_id} created successfully."
        }

    elif tool_name == "get_temperature_trend":
        shipment_id = int(args.get("shipment_id", 0))
        logs = crud.get_recent_sensor_logs(db, shipment_id=shipment_id, limit=10)
        if not logs:
            return {"error": f"No logs found for shipment {shipment_id}"}
        temps = [{"time": l.recorded_at.isoformat(), "temp": round(l.temperature, 2)} for l in logs]
        avg = sum(l.temperature for l in logs) / len(logs)
        trend = "rising" if logs[0].temperature > logs[-1].temperature else "stable/falling"
        return {
            "shipment_id": shipment_id,
            "readings": temps,
            "average_temp": round(avg, 2),
            "trend": trend,
            "latest_temp": round(logs[0].temperature, 2) if logs else None
        }

    return {"error": f"Unknown tool: {tool_name}"}


# ─────────────────────────────────────────────
# Agent Endpoint — Streaming SSE
# ─────────────────────────────────────────────

@router.post("/agent/run")
async def run_agent(db: Session = Depends(get_db)):
    """
    Runs the Cold Chain Command Agent using Gemini function calling.
    Returns a Server-Sent Events (SSE) stream of the agent's steps.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key or api_key in ("YOUR_ACTUAL_GEMINI_API_KEY_HERE", "put_your_real_gemini_key_here", "your-gemini-api-key-here"):
        raise HTTPException(
            status_code=503,
            detail="GEMINI_API_KEY is not set. Please add it to your api_server/.env file."
        )

    async def event_stream():
        def send(event_type: str, data: dict):
            return f"data: {json.dumps({'event': event_type, 'payload': data})}\n\n"

        try:
            client = genai.Client(api_key=api_key)

            system_prompt = f"""You are the Cold Chain Command Agent for a vaccine logistics platform.
Your job is to run a full operational audit of the fleet RIGHT NOW and produce an actionable intelligence report.

Today's date/time: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}

You MUST follow this exact workflow — do not skip steps:
1. Call get_fleet_status to understand ALL trucks currently active
2. Call get_active_alerts to check what the system has already flagged
3. Call get_shipment_summary for a logistics overview
4. For each truck with suspicious readings (temp > 7°C, battery < 25%, door open), call calculate_risk_score
5. For any truck with a risk score > 60 that has NO existing alert, call create_system_alert
6. For the highest-risk shipment, call get_temperature_trend to analyze the trend
7. After all tool calls, write a concise Executive Ops Report with:
   - Fleet health summary
   - Top 3 risks ranked by severity
   - Driver action items
   - Recommended next steps for the ops team

CRITICAL INSTRUCTION: Do NOT output your final report in JSON format. Your final report MUST be written in beautiful, highly readable Markdown format with proper headings (##), bullet points, and bold text for emphasis. Be decisive. Create alerts proactively. Your job is to catch issues before they cause vaccine spoilage."""

            yield send("start", {"message": "🤖 Cold Chain Command Agent initializing...", "timestamp": datetime.now(timezone.utc).isoformat()})

            # Build conversation history
            contents = [types.Content(role="user", parts=[types.Part(text=system_prompt)])]

            step = 0
            MAX_STEPS = 15

            while step < MAX_STEPS:
                step += 1

                response = client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=contents,
                    config=types.GenerateContentConfig(
                        tools=[AGENT_TOOLS],
                        tool_config=types.ToolConfig(
                            function_calling_config=types.FunctionCallingConfig(
                                mode=types.FunctionCallingConfigMode.AUTO
                            )
                        ),
                    ),
                )

                # Add assistant response to history
                contents.append(response.candidates[0].content)

                # Collect function calls from all parts
                fn_calls = []
                for part in response.candidates[0].content.parts:
                    if part.function_call:
                        fn_calls.append(part.function_call)

                if not fn_calls:
                    # No tool calls — agent is done, extract final text
                    final_text = ""
                    for part in response.candidates[0].content.parts:
                        if hasattr(part, "text") and part.text:
                            final_text += part.text
                    yield send("final_report", {"report": final_text})
                    break

                # Execute each function call and collect responses
                tool_response_parts = []
                for fn_call in fn_calls:
                    tool_name = fn_call.name
                    tool_args = dict(fn_call.args) if fn_call.args else {}

                    yield send("tool_call", {
                        "step": step,
                        "tool": tool_name,
                        "args": tool_args,
                        "message": f"🔧 Calling tool: `{tool_name}`"
                    })

                    result = execute_tool(tool_name, tool_args, db)

                    yield send("tool_result", {
                        "step": step,
                        "tool": tool_name,
                        "result_summary": _summarize_result(tool_name, result),
                        "result": result
                    })

                    tool_response_parts.append(
                        types.Part.from_function_response(
                            name=tool_name,
                            response={"result": result}
                        )
                    )

                # Add all tool results back into the conversation
                contents.append(
                    types.Content(role="user", parts=tool_response_parts)
                )

            yield send("done", {"message": "✅ Agent workflow complete."})

        except Exception as e:
            yield send("error", {"message": f"Agent error: {str(e)}"})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )


def _summarize_result(tool_name: str, result: dict) -> str:
    """Create a short human-readable summary of a tool result."""
    try:
        if tool_name == "get_fleet_status":
            count = result.get("count", 0)
            breached = sum(1 for t in result.get("trucks", []) if not t.get("temp_ok"))
            return f"Found {count} trucks. {breached} with temperature outside safe range."
        elif tool_name == "get_active_alerts":
            return f"Found {result.get('count', 0)} active alerts."
        elif tool_name == "get_shipment_summary":
            in_transit = result.get("by_status", {}).get("in_transit", 0)
            return f"{result.get('total_shipments', 0)} shipments total, {in_transit} in transit."
        elif tool_name == "calculate_risk_score":
            return f"Truck {result.get('truck_id')} risk: {result.get('risk_score')}/100 ({result.get('risk_level')})"
        elif tool_name == "create_system_alert":
            return f"Alert created: #{result.get('alert_id')}"
        elif tool_name == "get_temperature_trend":
            return f"Shipment {result.get('shipment_id')}: avg {result.get('average_temp')}°C, trend: {result.get('trend')}"
        return str(result)[:120]
    except Exception:
        return str(result)[:120]
