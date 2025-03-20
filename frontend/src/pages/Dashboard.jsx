import { useState } from "react";

function Dashboard() {
  return (
    <div className="w-screen">
      <div className="h-full w-full bg-white p-6 w-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-lg font-semibold text-black">Campaigns</h1>
          {/* <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center">
          Get All Features
        </button> */}
        </div>

        {/* Top Section: Metrics */}
        <div className="grid grid-cols-5 gap-4 mb-6 text-black text-center">
          <StatCard label="Total sent" value="0" color="" />
          <StatCard label="Open rate" value="0%" color="" />
          <StatCard label="Click rate" value="0%" color="" />
          <StatCard label="Reply rate" value="0%" color="" />
          <StatCard label="Opportunities" value="0" currency="$" color="" />
        </div>

        {/* Filter and Share Buttons */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-4">
            <button className="border border-gray-300 rounded-md px-4 py-2">Share</button>
            <button className="border border-gray-300 rounded-md px-4 py-2">Filter</button>
          </div>
          <select className="border border-gray-300 rounded-md px-4 py-2">
            <option>Last 4 weeks</option>
          </select>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-lg p-4 shadow-md">
          <LineChart />
        </div>
      </div>
    </div>

  );
}

// Component for the Metric Cards
const StatCard = ({ label, value, currency, color }) => {
  return (
    <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
      <p className="text-gray-500 text-sm">{label}</p>
      <h2 className={`text-3xl font-bold ${color}`}>
        {value} {currency && <span className="text-green-600">{currency}</span>}
      </h2>
    </div>
  );
};

// Placeholder Line Chart Component (Replace with actual chart implementation)
const LineChart = () => {
  return (
    <div className="h-60 flex items-center justify-center border border-gray-200 rounded-lg">
      <p className="text-gray-400">[Chart Placeholder]</p>
    </div>
  );
};

export default Dashboard;
