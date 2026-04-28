import React, { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/auth/Login'
import LandingPage from './components/landing/LandingPage'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import { AuthContext } from './context/AuthContext'

import SenderPortal from './components/dashboard/SenderPortal'
import SenderLayout from './components/dashboard/SenderLayout'
import OrdersPage from './components/dashboard/sender/OrdersPage'
import PackingPage from './components/dashboard/sender/PackingPage'
import ShipmentsPage from './components/dashboard/sender/ShipmentsPage'
import InventoryPage from './components/dashboard/sender/InventoryPage'
import BatchesPage from './components/dashboard/sender/BatchesPage'
import TrackingPage from './components/dashboard/sender/TrackingPage'
import AlertsPage from './components/dashboard/sender/AlertsPage'
import ReportsPage from './components/dashboard/sender/ReportsPage'

import ReceiverLayout from './components/dashboard/receiver/ReceiverLayout'
import ReceiverHome from './components/dashboard/receiver/ReceiverHome'
import PlaceOrderPage from './components/dashboard/receiver/PlaceOrderPage'
import MyOrdersPage from './components/dashboard/receiver/MyOrdersPage'
import ReceiverTrackingPage from './components/dashboard/receiver/ReceiverTrackingPage'
import DeliveryHistoryPage from './components/dashboard/receiver/DeliveryHistoryPage'
import CertificatesPage from './components/dashboard/receiver/CertificatesPage'
import SupportPage from './components/dashboard/receiver/SupportPage'
import ReceiverNotifications from './components/dashboard/receiver/ReceiverNotifications'
import ReceiverSettings from './components/dashboard/receiver/ReceiverSettings'

import DriverLayout from './components/dashboard/driver/DriverLayout'
import DriverHome from './components/dashboard/driver/DriverHome'
import MyShipments from './components/dashboard/driver/MyShipments'
import RouteStops from './components/dashboard/driver/RouteStops'
import LiveMonitoring from './components/dashboard/driver/LiveMonitoring'
import DriverAlerts from './components/dashboard/driver/DriverAlerts'
import DriverAIAssistant from './components/dashboard/driver/DriverAIAssistant'
import DeliveryProof from './components/dashboard/driver/DeliveryProof'
import ReportIssue from './components/dashboard/driver/ReportIssue'
import DriverProfile from './components/dashboard/driver/DriverProfile'

// Layout wrapper for authenticated pages
const ProtectedLayout = ({ children }) => (
  <div className="min-h-screen bg-slate-950 font-sans text-slate-200 flex flex-col">
    <Navbar />
    <main className="w-full flex-grow">
      <div className="max-w-[1600px] mx-auto py-8 px-4">
        {children}
      </div>
    </main>
    <Footer />
  </div>
);

function App() {
  const { token, user, isLoading } = useContext(AuthContext);

  // Show loading screen while restoring session from localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="font-bold text-white text-2xl">V</span>
          </div>
          <p className="text-slate-400">Loading your session...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={token && user ? <Navigate to={`/${user.role}`} /> : <LandingPage />} />
      <Route path="/login" element={!token ? <Login /> : <Navigate to={user ? `/${user.role}` : "/"} />} />
      
      {/* Protected Role-Based Routes */}
      {/* Sender Routes */}
      <Route path="/sender" element={
        token && user?.role === 'sender' ? (
          <ProtectedLayout><SenderLayout /></ProtectedLayout>
        ) : <Navigate to="/login" />
      }>
        <Route index element={<SenderPortal />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="batches" element={<BatchesPage />} />
        <Route path="packing" element={<PackingPage />} />
        <Route path="shipments" element={<ShipmentsPage />} />
        <Route path="tracking" element={<TrackingPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<div className="text-slate-400 p-8">Settings coming soon</div>} />
      </Route>
      
      {/* Receiver Routes */}
      <Route path="/receiver" element={
        token && user?.role === 'receiver' ? (
          <ReceiverLayout />
        ) : <Navigate to="/login" />
      }>
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<ReceiverHome />} />
        <Route path="place-order" element={<PlaceOrderPage />} />
        <Route path="my-orders" element={<MyOrdersPage />} />
        <Route path="track" element={<ReceiverTrackingPage />} />
        <Route path="history" element={<DeliveryHistoryPage />} />
        <Route path="certificates" element={<CertificatesPage />} />
        <Route path="complaints" element={<SupportPage />} />
        <Route path="notifications" element={<ReceiverNotifications />} />
        <Route path="settings" element={<ReceiverSettings />} />
      </Route>
      
      {/* Driver Routes (Mobile First Layout) */}
      <Route path="/driver" element={
        token && user?.role === 'driver' ? (
          <DriverLayout />
        ) : <Navigate to="/login" />
      }>
        <Route index element={<DriverHome />} />
        <Route path="shipments" element={<MyShipments />} />
        <Route path="route" element={<RouteStops />} />
        <Route path="monitoring" element={<LiveMonitoring />} />
        <Route path="alerts" element={<DriverAlerts />} />
        <Route path="ai" element={<DriverAIAssistant />} />
        <Route path="proof" element={<DeliveryProof />} />
        <Route path="report" element={<ReportIssue />} />
        <Route path="profile" element={<DriverProfile />} />
      </Route>

      {/* Fallback */}
      <Route path="/dashboard" element={<Navigate to={user ? `/${user.role}` : "/login"} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
