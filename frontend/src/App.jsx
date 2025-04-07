import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Campaigns from "./pages/Campaigns";
import Leads from "./pages/Leads";
import Crm from "./pages/Crm";
import SocialMedia from "./pages/Social-media";
import Unibox from "./pages/Unibox";
import {jwtDecode} from "jwt-decode";

function App() {
  const [secretKey, setSecretKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          console.log("Token expired.");
          localStorage.removeItem("token");
          setIsAuthenticated(false);
        } else {
          console.log("Token valid.");
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error("Error decoding token:", err);
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      }
    } else if (secretKey) {
      validateKey(secretKey);
    } else {
      setIsAuthenticated(false);
    }
  }, [secretKey]);

  // github lol
  const validateKey = async (key) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/validate-key", { key });
      if (response.data.valid) {
        setIsAuthenticated(true);
        localStorage.setItem("secretKey", key);
        console.log("THIS IS THE USER'S ID", response.data.userId)
        localStorage.setItem("userId", response.data.userId);
        if (response.data.token) {
          console.log("THIS IS THE USER'S ID", response.data.token)
          localStorage.setItem("token", response.data.token);
        }
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem("secretKey");
        localStorage.removeItem("userId");
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Validation error:", error);
      setIsAuthenticated(false);
    }
  };

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("secretKey");
    localStorage.removeItem("userId");
    setIsAuthenticated(false);
  };

  return (
    <Router>
      {isAuthenticated ? (
        <div className="flex h-screen w-screen bg-gray-100">
          <Sidebar onLogout={handleLogout} />
          <div className="flex-1 overflow-auto px-6 bg-white flex items-center justify-center">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/social-media" element={<SocialMedia />} />
              <Route path="/crm" element={<Crm />} />
              <Route path="/unibox" element={<Unibox />} />
            </Routes>
          </div>
        </div>
      ) : (
        <SecretKeyScreen onSubmit={setSecretKey} />
      )}
    </Router>
  );
}

function SecretKeyScreen({ onSubmit }) {
  const [key, setKey] = useState("");

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-2xl font-semibold text-black mb-4">Enter Your Secret Key</h1>
      <input
        type="password"
        className="border border-gray-300 p-2 rounded-md mb-4 w-64"
        placeholder="Enter your secret key"
        value={key}
        onChange={(e) => setKey(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
        onClick={() => onSubmit(key)}
      >
        Submit
      </button>
    </div>
  );
}

export default App;
