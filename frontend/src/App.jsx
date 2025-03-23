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
import {jwtDecode} from 'jwt-decode';

function App() {
  const [secretKey, setSecretKey] = useState("");
  // const [secretKey, setSecretKey] = useState(localStorage.getItem("secretKey") || "");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // console.log("okay mate")

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (token) {
  //     // JWT exists so auto log in
  //     setIsAuthenticated(true);
  //     // Optionally, decode token to set user details
  //   } else if (secretKey) {
  //     // No JWT, so validate using the secret key
  //     validateKey(secretKey);
  //   }
  // }, [secretKey]);

  useEffect(() => {
    console.log("useEffect triggered. secretKey:", secretKey);
    const token = localStorage.getItem("token");
    console.log("Token from localStorage:", token);
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded);
        if (decoded.exp * 1000 < Date.now()) {
          console.log("Token expired. Removing token.");
          localStorage.removeItem("token");
          setIsAuthenticated(false);
        } else {
          console.log("Token is valid. Setting isAuthenticated to true.");
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error("Error decoding token:", err);
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      }
    } else if (secretKey) {
      console.log("No token found. Calling validateKey with secretKey.");
      validateKey(secretKey);
    } else {
      console.log("No token or secretKey provided. User not authenticated.");
      setIsAuthenticated(false);
    }
  }, [secretKey]);
  

  const validateKey = async (key) => {
    console.log("validateKey called with key:", key);
    try {
      const response = await axios.post("http://localhost:5000/api/auth/validate-key", { key });
      console.log("validateKey response data:", response.data);
      if (response.data.valid) {
        console.log("Secret key valid. Setting isAuthenticated to true.");
        setIsAuthenticated(true);
        localStorage.setItem("secretKey", key);
        localStorage.setItem("userId", response.data.userId);
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          console.log("Stored JWT:", response.data.token);
        }
      } else {
        console.log("Secret key invalid. Clearing authentication.");
        setIsAuthenticated(false);
        localStorage.removeItem("secretKey");
        localStorage.removeItem("userId");
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Validation error in validateKey:", error);
      setIsAuthenticated(false);
    }
  };
  


  return (
    <Router>
      {isAuthenticated ? (
        <div className="flex h-screen w-screen bg-gray-100">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <div className="flex-1 overflow-auto p-6 bg-white flex items-center justify-center">
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
        // onClick={() => console.log("key")}
        onClick={() => onSubmit(key)}
      >
        Submit
      </button>
    </div>
  );
}

export default App;
