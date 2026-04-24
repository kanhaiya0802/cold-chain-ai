# 🚚 Cold Chain AI: Smart Vaccine Logistics Monitoring System 

An innovative AI-powered real-time cold chain monitoring system designed to prevent the spoilage of life-saving vaccines and medicines during transportation. This project combines IoT simulation, real-time data streaming, and advanced AI to ensure vaccine integrity from warehouse to patient.

## 🌟 What Makes This Project Unique

Unlike traditional cold chain systems that rely on manual checks, **Cold Chain AI** uses:
- **Predictive AI**: Gemini-powered emergency response that suggests hospitals and action plans
- **Real-time Optimization**: Dynamic rerouting based on temperature anomalies
- **Integrated Monitoring**: Single dashboard combining temperature, location, and AI insights
- **Scalable Architecture**: Firebase-based backend that can handle multiple trucks simultaneously

## ✨ Key Features

- 🌡️ **Real-time Temperature Monitoring**: Continuous tracking with configurable alerts
- 📍 **Live GPS Tracking**: Google Maps integration with smart rerouting
- 🤖 **AI Emergency Assistant**: Gemini 1.5 Pro generates instant action plans and hospital recommendations
- 🚨 **Intelligent Alerts**: Threshold-based notifications with cooldown to prevent spam
- 📊 **Interactive Dashboard**: Modern React UI with real-time data visualization
- 🔄 **Simulated IoT Data**: Python-based simulator for testing without physical sensors

## 🛠️ Tech Stack

### Frontend
- **React 19** with Vite
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Google Maps** for location visualization

### Backend & Data
- **Firebase Firestore** for real-time database
- **Firebase Admin SDK** for server-side operations

### AI & APIs
- **Google Gemini 1.5 Pro** for natural language processing
- **Google Maps API** for routing and visualization

### Simulation
- **Python 3.x** with Firebase Admin SDK
- **Random data generation** for realistic testing

## 🚀 Getting Started: Local Development Setup

### Prerequisites
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Python 3.8+** - [Download here](https://python.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Firebase Account** - [Sign up here](https://firebase.google.com/)
- **Google Cloud Account** - [Sign up here](https://cloud.google.com/)

### 📁 Project Structure
```
cold-chain-ai/
├── dashboard/          # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   └── Dashboard.jsx
│   │   └── firebase.js
│   ├── package.json
│   └── vite.config.js
├── simulator/          # Python data simulator
│   ├── simulator.py
│   ├── firebase-key.json
│   └── requirements.txt
└── README.md
```

### 🔧 Step-by-Step Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/cold-chain-ai.git
cd cold-chain-ai
```

#### 2. Set Up Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project called "cold-chain-ai"
3. Enable **Firestore Database**
4. Go to **Project Settings > Service Accounts**
5. Generate a new private key (JSON) and download it
6. Rename the file to `firebase-key.json` and place it in the `simulator/` folder

#### 3. Configure APIs

##### Google Maps API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the **Maps JavaScript API**
3. Create an API key
4. Restrict it to your domain for security

##### Google Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key for Gemini
3. Keep it secure (never commit to git)

#### 4. Set Up the Dashboard (React App)

```bash
# Navigate to dashboard directory
cd dashboard

# Install dependencies
npm install

# Create environment file
cp .env.example .env  # Or create .env manually
```

Edit `.env` with your API keys:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=cold-chain-ai.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=cold-chain-ai
VITE_FIREBASE_STORAGE_BUCKET=cold-chain-ai.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_MAPS_API_KEY=your_google_maps_api_key
```

```bash
# Start the development server
npm run dev
```
The dashboard will be available at `http://localhost:5173/`

#### 5. Set Up the Simulator (Python)

```bash
# Navigate to simulator directory
cd ../simulator

# Install Python dependencies
pip install -r requirements.txt

# Ensure firebase-key.json is in this directory
# Run the simulator
python simulator.py
```

The simulator will start generating mock temperature and GPS data every 5 seconds.

#### 6. Test the System

1. **Open the Dashboard**: Visit `http://localhost:5173/` in your browser
2. **Start the Simulator**: Run `python simulator.py` in the simulator folder
3. **Monitor Data**: Watch real-time temperature updates on the dashboard
4. **Trigger AI**: Wait for temperature to exceed 8°C - Gemini will generate an emergency plan
5. **Check Console**: Open browser dev tools (F12) to see logs

## 🎯 How It Works

1. **Data Collection**: Python simulator generates realistic truck sensor data
2. **Real-time Streaming**: Data is pushed to Firebase Firestore
3. **Dashboard Monitoring**: React app listens for updates and displays live metrics
4. **AI Trigger**: When temperature exceeds safe limits (8°C), Gemini API is called
5. **Emergency Response**: AI generates customized action plans and hospital recommendations
6. **Cooldown System**: Prevents API spam with intelligent throttling

## 🔒 Security Best Practices

- **API Keys**: Never commit API keys to version control
- **Environment Variables**: Use `.env` files for local development
- **Firebase Rules**: Configure Firestore security rules for production
- **API Restrictions**: Limit Google API keys to specific domains/IPs

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy the dist/ folder to your hosting platform
```

### Backend (Firebase Functions - Optional)
For production, consider moving AI calls to Firebase Functions to keep API keys server-side.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google** for Gemini AI and Maps APIs
- **Firebase** for real-time database infrastructure
- **Open Source Community** for amazing tools and libraries

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all API keys are correctly set
3. Ensure Firebase and Google Cloud projects are properly configured
4. Open an issue on GitHub with detailed error logs

---

**Built with ❤️ for a healthier world through technology**

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
