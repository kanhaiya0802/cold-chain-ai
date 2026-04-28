import React, { useState, useRef, useEffect } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import {
  Sparkles, Bot, ChevronDown, ChevronUp, CheckCircle2,
  AlertTriangle, Wrench, FileText, Loader2, X, Play, Zap
} from 'lucide-react';

/* ─── helpers ────────────────────────────────────────── */
const TOOL_META = {
  get_fleet_status:      { icon: '🚛', label: 'Fetching Fleet Status' },
  get_active_alerts:     { icon: '🚨', label: 'Checking Active Alerts' },
  get_shipment_summary:  { icon: '📦', label: 'Summarizing Shipments' },
  calculate_risk_score:  { icon: '⚠️', label: 'Calculating Risk Score' },
  create_system_alert:   { icon: '🔔', label: 'Creating Alert' },
  get_temperature_trend: { icon: '📈', label: 'Analyzing Temp Trend' },
};

function ToolCallCard({ step, expanded, onToggle }) {
  const meta = TOOL_META[step.tool] || { icon: '🔧', label: step.tool };
  const hasResult = !!step.result_summary;

  return (
    <div className="border border-slate-700/60 rounded-xl overflow-hidden bg-slate-800/50">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-700/30 transition-colors"
      >
        <span className="text-lg">{meta.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200">{meta.label}</p>
          {hasResult && (
            <p className="text-xs text-slate-400 truncate mt-0.5">{step.result_summary}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {hasResult ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </div>
      </button>

      {expanded && step.result && (
        <div className="px-4 pb-4 border-t border-slate-700/60 pt-3">
          {step.args && Object.keys(step.args).length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Arguments</p>
              <pre className="text-xs text-blue-300 bg-slate-900/80 rounded-lg px-3 py-2 overflow-x-auto">
                {JSON.stringify(step.args, null, 2)}
              </pre>
            </div>
          )}
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Result</p>
          <pre className="text-xs text-slate-300 bg-slate-900/80 rounded-lg px-3 py-2 overflow-x-auto max-h-48">
            {JSON.stringify(step.result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function ReportView({ report }) {
  // Convert markdown-like text to styled output
  const lines = report.split('\n');
  return (
    <div className="prose prose-invert max-w-none space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith('## ') || line.startsWith('# ')) {
          return (
            <h3 key={i} className="text-base font-bold text-white mt-4 mb-1">
              {line.replace(/^#+\s/, '')}
            </h3>
          );
        }
        if (line.startsWith('### ')) {
          return (
            <h4 key={i} className="text-sm font-semibold text-blue-300 mt-3 mb-1">
              {line.replace(/^###\s/, '')}
            </h4>
          );
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return (
            <p key={i} className="text-sm font-semibold text-slate-100">
              {line.replace(/\*\*/g, '')}
            </p>
          );
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          const text = line.replace(/^[-*]\s/, '');
          const isRisk = text.toLowerCase().includes('critical') || text.toLowerCase().includes('breach');
          const isWarn = text.toLowerCase().includes('warning') || text.toLowerCase().includes('risk');
          return (
            <div key={i} className="flex items-start gap-2 text-sm">
              <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                isRisk ? 'bg-red-400' : isWarn ? 'bg-yellow-400' : 'bg-emerald-400'
              }`} />
              <span className={`${isRisk ? 'text-red-300' : isWarn ? 'text-yellow-300' : 'text-slate-300'}`}>
                {text}
              </span>
            </div>
          );
        }
        if (line.trim() === '') return <div key={i} className="h-1" />;
        return (
          <p key={i} className="text-sm text-slate-300 leading-relaxed">
            {line}
          </p>
        );
      })}
    </div>
  );
}

/* ─── Main AgentPanel Component ─────────────────────── */
const AgentPanel = ({ onClose }) => {
  const { token } = useContext(AuthContext);
  const [status, setStatus] = useState('idle'); // idle | running | done | error
  const [steps, setSteps] = useState([]);       // tool call steps
  const [report, setReport] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [expandedStep, setExpandedStep] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const scrollRef = useRef(null);
  const timerRef = useRef(null);

  // Pending steps (called but not yet returned result)
  const stepsRef = useRef([]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [steps, report]);

  useEffect(() => {
    if (status === 'running') {
      setStartTime(Date.now());
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - Date.now()) / 1000));
      }, 500);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [status]);

  const runAgent = async () => {
    setStatus('running');
    setSteps([]);
    stepsRef.current = [];
    setReport('');
    setErrorMsg('');
    setExpandedStep(null);
    setStartTime(Date.now());

    try {
      const res = await fetch('http://127.0.0.1:8000/agent/run', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep incomplete line in buffer

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const { event, payload } = JSON.parse(line.slice(6));

            if (event === 'tool_call') {
              const newStep = {
                id: `${payload.step}-${payload.tool}`,
                tool: payload.tool,
                args: payload.args,
                result_summary: null,
                result: null,
              };
              stepsRef.current = [...stepsRef.current, newStep];
              setSteps([...stepsRef.current]);
              // Auto-expand the latest step
              setExpandedStep(newStep.id);
            }

            if (event === 'tool_result') {
              stepsRef.current = stepsRef.current.map(s =>
                s.tool === payload.tool && s.result === null
                  ? { ...s, result_summary: payload.result_summary, result: payload.result }
                  : s
              );
              setSteps([...stepsRef.current]);
            }

            if (event === 'final_report') {
              setReport(payload.report);
              setStatus('done');
            }

            if (event === 'error') {
              setErrorMsg(payload.message);
              setStatus('error');
            }
          } catch (parseErr) {
            // Ignore malformed SSE lines
          }
        }
      }
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  const totalTime = startTime ? ((Date.now() - startTime) / 1000).toFixed(1) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/60 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 bg-gradient-to-r from-purple-900/30 to-blue-900/20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg shadow-purple-500/30">
              <Bot className="w-5 h-5 text-white" />
              {status === 'running' && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Cold Chain Command Agent</h2>
              <p className="text-[11px] text-slate-400">Gemini · Function Calling · ReAct Loop</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {status === 'done' && totalTime && (
              <span className="text-[11px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded-full">
                ✓ Done in {totalTime}s
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-5 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">

          {/* Idle state */}
          {status === 'idle' && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/20 flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Ready to Analyze</h3>
              <p className="text-slate-400 text-sm max-w-sm mb-1">
                The agent will autonomously audit your entire fleet using live database tools.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 w-full max-w-sm">
                {Object.values(TOOL_META).map((m, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-800 border border-slate-700/50 rounded-lg px-3 py-2 text-xs text-slate-400">
                    <span>{m.icon}</span> {m.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Running/Done: Tool Steps */}
          {(status === 'running' || status === 'done' || steps.length > 0) && (
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                <Wrench className="w-3 h-3" /> Agent Tool Calls ({steps.length})
              </p>
              {steps.map(step => (
                <ToolCallCard
                  key={step.id}
                  step={step}
                  expanded={expandedStep === step.id}
                  onToggle={() => setExpandedStep(prev => prev === step.id ? null : step.id)}
                />
              ))}
              {status === 'running' && (
                <div className="flex items-center gap-3 px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin flex-shrink-0" />
                  <p className="text-sm text-blue-300">Agent is thinking…</p>
                </div>
              )}
            </div>
          )}

          {/* Final Report */}
          {report && (
            <div className="mt-4">
              <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                <FileText className="w-3 h-3" /> Executive Ops Report
              </p>
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
                <ReportView report={report} />
              </div>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-4">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-300">Agent encountered an error</p>
                <p className="text-xs text-red-400 mt-1">{errorMsg}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-slate-700/60 flex items-center justify-between flex-shrink-0 bg-slate-900">
          <p className="text-[11px] text-slate-500">
            {steps.length > 0 ? `${steps.length} tool call${steps.length !== 1 ? 's' : ''} executed` : 'Powered by Gemini 2.5 Flash'}
          </p>
          <button
            onClick={runAgent}
            disabled={status === 'running'}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg ${
              status === 'running'
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-purple-500/30 hover:shadow-purple-500/50'
            }`}
          >
            {status === 'running' ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</>
            ) : status === 'done' ? (
              <><Play className="w-4 h-4" /> Re-run Agent</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Run Agent</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentPanel;
