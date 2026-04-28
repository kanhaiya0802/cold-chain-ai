import React from 'react';

const PlaceholderPage = ({ title, description }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl text-center">
    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
      <span className="text-3xl">🚧</span>
    </div>
    <h1 className="text-3xl font-bold text-white mb-3">{title}</h1>
    <p className="text-slate-400 max-w-md">{description}</p>
    <div className="mt-8 px-4 py-2 bg-slate-800 rounded-lg border border-slate-700 text-sm text-slate-300 font-mono">
      Coming in MVP Phase 2
    </div>
  </div>
);

export const OrdersPage = () => <PlaceholderPage title="Incoming Orders" description="Manage incoming receiver orders, approve requests, and split orders based on FEFO availability." />;
export const InventoryPage = () => <PlaceholderPage title="Warehouse Inventory" description="Track product levels, set temperature bounds, and manage low-stock alerts." />;
export const BatchesPage = () => <PlaceholderPage title="Batch Management" description="Enforce FEFO (First Expiry, First Out) rules. Track expiry dates and reserve specific batches." />;
export const PackingPage = () => <PlaceholderPage title="Packing Queue" description="Scan items, verify quantities, and generate QR codes for dispatch." />;
export const ShipmentsPage = () => <PlaceholderPage title="Shipment Management" description="Create multi-stop shipments, assign drivers and trucks, and dispatch fleets." />;
export const TrackingPage = () => <PlaceholderPage title="Live Fleet Tracking" description="Full-screen live map with predictive risk scoring, ETA, and current stops." />;
export const AlertsPage = () => <PlaceholderPage title="System Alerts" description="Central hub for resolving temperature breaches, delays, and inventory issues." />;
export const ReportsPage = () => <PlaceholderPage title="Analytics & Reports" description="Generate automated compliance, wastage, and delivery performance reports." />;
