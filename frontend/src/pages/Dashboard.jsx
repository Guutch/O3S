import React, { useState, useEffect } from "react";
import { FaInfoCircle } from "react-icons/fa";
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function Dashboard() {
  const [messageLogs, setMessageLogs] = useState([]);
  const [totalSent, setTotalSent] = useState(0);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (userId && token) {
      fetch(`http://localhost:5000/api/message-logs/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.messageLogs) {
            setMessageLogs(data.messageLogs);
            setTotalSent(data.messageLogs.length);
          }
        })
        .catch((err) => console.error("Error fetching message logs:", err));
    }
  }, []);

  return (
    <div className="h-screen w-full bg-white p-6 flex flex-col">
      {/* Top Section */}
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-black">Analytics</h1>
      </div>
      <hr className="border-t border-gray-300 mb-5" />

      {/* Bottom Section */}
      <div className="flex-1 flex flex-col">
        {/* Stats Row */}
        <div className="grid grid-cols-5 gap-4 mb-6 text-black text-center">
          <StatCard label="Total sent" value={totalSent} />
          <StatCard label="Open rate" value="0%" />
          <StatCard label="Click rate" value="0%" />
          <StatCard label="Reply rate" value="0%" />
          <StatCard label="Opportunities" value="0" currency="$" />
        </div>

        {/* Time Filter */}
        <div className="flex justify-end items-center mb-4">
          <select className="border border-gray-300 rounded-md px-4 py-2">
            <option>Last 4 weeks</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
          </select>
        </div>

        {/* Chart Section */}
        <div className="flex-1 bg-white rounded-lg p-4 shadow-md">
          <LineChart messageLogs={messageLogs} />
        </div>
      </div>
    </div>
  );
}

// StatCard component with bullet, centered text, and fixed size
const StatCard = ({ label, value, currency }) => {
  const bulletColors = {
    "Total sent": "bg-blue-500",
    "Open rate": "bg-green-500",
    "Click rate": "bg-purple-500",
    "Reply rate": "bg-pink-500",
    "Opportunities": "bg-yellow-500",
  };

  const bulletColor = bulletColors[label] || "bg-gray-400";

  return (
    <div className="flex flex-col border border-gray-200 rounded-lg shadow-sm bg-white h-32 w-64 p-3">
      <div className="flex items-center justify-center w-full relative h-6">
        <span className={`absolute left-0 top-1/2 -translate-y-1/2 inline-block w-3 h-2 rounded-sm ${bulletColor}`} />
        <p className="text-gray-600 text-sm font-medium">{label}</p>
        <FaInfoCircle className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
      </div>
      <div className="flex-grow flex items-center justify-center">
        <h2 className="text-4xl font-bold text-black">
          {value} {currency && <span className="text-green-600">{currency}</span>}
        </h2>
      </div>
    </div>
  );
};

// LineChart component using Recharts to display total sent messages by day
const LineChart = ({ messageLogs }) => {
  // Aggregate message logs by day (using sent_at)
  const dataMap = {};
  messageLogs.forEach((log) => {
    const day = new Date(log.sent_at).toLocaleDateString();
    dataMap[day] = (dataMap[day] || 0) + 1;
  });

  // Convert the aggregation map into an array and sort by date
  const data = Object.keys(dataMap)
    .map((day) => ({
      day,
      totalSent: dataMap[day],
    }))
    .sort((a, b) => new Date(a.day) - new Date(b.day));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="day"
          label={{ value: "Days", position: "insideBottom", offset: -5 }}
        />
        <YAxis
          label={{ value: "Total Sent", angle: -90, position: "insideLeft" }}
        />
        <Tooltip />
        <Line type="monotone" dataKey="totalSent" stroke="#3B82F6" strokeWidth={2} />
      </RechartsLineChart>
    </ResponsiveContainer>

  );
};

export default Dashboard;
