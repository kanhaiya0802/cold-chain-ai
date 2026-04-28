# 🚚 Cold Chain AI 2.0: The Logistics Control Tower ❄️

An elite, multi-tenant AI marketplace designed for high-integrity cold chain logistics. This platform orchestrates the end-to-end lifecycle of temperature-sensitive medical supplies—from warehouse procurement to last-mile delivery—using real-time telemetry and Gemini-powered predictive intelligence.

---

## 🌟 The "Control Tower" Advantage

Unlike traditional tracking systems, **Cold Chain AI 2.0** acts as a central nervous system for logistics:

*   **Multi-Role Ecosystem**: Dedicated, secure portals for **Senders** (Warehouses), **Receivers** (Hospitals), and **Drivers** (Tactical Map).
*   **Gemini Tactical AI**: An autonomous agent that audits the entire fleet, predicts risk scores, and generates actionable emergency protocols.
*   **Mission Control Interface**: A high-end, dark-mode terminal for drivers with live GPS telemetry, door-status monitoring, and AI co-pilot advice.
*   **Inventory Procurement**: A real-time marketplace where hospitals can procure vaccines directly from verified pharmaceutical hubs.

---

## ✨ Key Features

### 🏢 Sender Portal (Logistics Hub)
*   **Fleet Commander View**: Real-time Google Maps visualization of the entire truck fleet.
*   **Inventory Management**: Track batches, expiry dates, and real-time stock levels.
*   **Dispatch Intelligence**: Linked shipment flows connecting specific orders to assigned trucks and drivers.

### 🏥 Receiver Portal (Hospital Hub)
*   **Procurement Engine**: Live marketplace to order vaccines from verified warehouses.
*   **Order Pipeline**: Real-time tracking of orders from "Planned" to "In Transit" to "Delivered."
*   **Verification System**: Visual trust badges for verified medical suppliers.

### 🚛 Driver Portal (Mission Control)
*   **Tactical GPS Map**: Live tracking of the assigned route with sub-second telemetry updates.
*   **Integrity Monitoring**: Real-time humidity, temperature, and battery health reporting.
*   **AI Co-Pilot**: Context-aware advice (e.g., traffic alerts, temperature breach warnings).

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Tailwind CSS, Lucide Icons, Framer Motion |
| **Backend** | FastAPI (Python), WebSockets (Real-time Streaming) |
| **Database** | SQLite + SQLAlchemy (Multi-tenant Architecture) |
| **AI Engine** | Google Gemini 1.5 Flash (Function Calling & Risk Scoring) |
| **Maps** | Google Maps JavaScript API (Advanced Markers) |
| **Simulator** | Python-based IoT Telemetry Generator |

---

## 🚀 Getting Started

### 1. Prerequisites
*   Node.js (v18+)
*   Python (3.10+)
*   Google Gemini API Key
*   Google Maps API Key

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
VITE_MAPS_API_KEY=your_maps_key
VITE_GEMINI_API_KEY=your_gemini_key
SECRET_KEY=your_jwt_secret
```

### 3. Installation
```bash
# Install Backend Dependencies
cd api_server
pip install -r requirements.txt

# Install Frontend Dependencies
cd ../client_web_app
npm install
```

### 4. Running the System
1.  **Initialize Database**: `cd api_server && python seed.py`
2.  **Start Backend**: `uvicorn main:app --reload`
3.  **Start Frontend**: `npm run dev`
4.  **Start Simulator**: `cd data_simulator && python simulator.py`

---

## 🎯 Sample Credentials (Seeded Data)
| Role | Username | Password |
| :--- | :--- | :--- |
| **Sender** | `sender_1` | `password123` |
| **Receiver** | `receiver_1` | `password123` |
| **Driver** | `driver_1` | `password123` |

---

## 📝 License
This project is licensed under the MIT License.

**Built with ❤️ for global health security.**
