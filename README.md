# cold-chain-ai
An AI-powered real-time cold chain monitoring system designed to prevent the wastage of life-saving medicines. Built with Firebase for live tracking, Google Maps API for smart rerouting, and Gemini 1.5 Pro for emergency decision-making.

## Features
- 🌡️ Real-time temperature monitoring and alerts
- 📍 Live GPS tracking with Google Maps integration
- 🤖 AI-powered emergency decision-making using Gemini 1.5 Pro
- 🚗 Smart rerouting to prevent medicine spoilage
- 📊 Comprehensive dashboard for shipment tracking
- 🔔 Instant notifications for anomalies

## Tech Stack
- **Backend**: Firebase Realtime Database
- **AI/ML**: Google Gemini 1.5 Pro API
- **Mapping**: Google Maps API
- **Frontend**: [Add your frontend framework]
- **Monitoring**: Real-time data streaming

## Getting Started

### Prerequisites
- Firebase account
- Google Cloud API credentials (Maps & Gemini APIs)
- Node.js (v14 or higher)

### Installation
1. Clone the repository
2. Install dependencies
3. Configure API keys in environment variables
4. Run the application

## How It Works
The system continuously monitors temperature sensors on medicine shipments. When anomalies are detected, Gemini 1.5 Pro analyzes the situation and recommends optimal rerouting strategies to preserve medicine integrity while minimizing delays.


# VacciTrack AI - Cold Chain Monitoring System ❄️📦

VacciTrack AI is an end-to-end IoT and AI solution designed to monitor the temperature of vaccines during transport. It uses real-time data from an IoT simulator, stores it in Firebase, and leverages Google Gemini AI to provide emergency advisories (like nearest hospitals) when temperatures exceed safe limits.

---

## 🚀 Getting Started

Follow these steps to set up the project on your local machine.

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **Python** (3.8 or higher)
- **Firebase Account** (Google Cloud Project)
- **Google AI Studio Account** (For Gemini API Key)

### 2. Repository Structure
- `/dashboard`: React + Vite frontend.
- `/simulator`: Python script to simulate real-time IoT data.
- `/functions`: (Optional) Firebase Cloud Functions.

---

## 🛠️ Environment Setup (.env)

Each member needs to create two separate `.env` files. **Do not commit these files to GitHub.**

#### For the Dashboard (`/dashboard/.env`):
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_api_key

For the Simulator (/simulator/.env or inside simulator.py):
Ensure you have your serviceAccountKey.json from Firebase Console (Project Settings > Service Accounts) saved in the /simulator folder.

🏃‍♂️ How to Run

### Step 1: Run the Dashboard

cd dashboard
npm install
npm run dev

### Step 2: Run the IoT Simulator

Open new terminal:
cd simulator

pip install -r requirements.txt
python simulator.py


🧠 AI Emergency Advisory
The system is configured to trigger Gemini AI when the temperature exceeds 8.0°C.

Important: Due to Free Tier rate limits (20 requests/day), the code includes logic to prevent API call loops.

Ensure your Gemini API Key is linked to the correct Google Cloud Project in Google AI Studio.

🛠️ Technologies Used
Frontend: React, Vite, Tailwind CSS

Backend/Database: Firebase Firestore

AI: Google Gemini 1.5 Flash

Maps: Google Maps Platform

IoT Simulation: Python (Firebase Admin SDK)