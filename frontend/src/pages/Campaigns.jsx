import { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { HiLightningBolt } from "react-icons/hi";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaPlus } from "react-icons/fa";

function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [activeTab, setActiveTab] = useState("Analytics");
  const [campaignLeads, setCampaignLeads] = useState([]);

  const [showLeadsPopup, setShowLeadsPopup] = useState(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("TOKEN HERE IN CAMPAIGNS")
        console.log(token)
        if (!token) return;
        const res = await fetch("http://localhost:5000/api/campaigns", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch campaigns");
        const data = await res.json();
        setCampaigns(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCampaigns();
  }, []);

  // Fetch campaign leads for the selected campaign
  useEffect(() => {
    if (selectedCampaign) {
      const fetchCampaignLeads = async () => {
        const token = localStorage.getItem("token");
        console.log("Fetching campaign leads for campaign ID:", selectedCampaign.id);
        console.log("Token:", token);
        try {
          const res = await fetch(`http://localhost:5000/api/campaign-leads/${selectedCampaign.id}`, {
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          });
          console.log("Response status:", res.status);
          if (!res.ok) {
            const errorText = await res.text();
            console.error("Response error text:", errorText);
            throw new Error(`Failed to fetch campaign leads (status: ${res.status})`);
          }
          const data = await res.json();
          console.log("Fetched campaign leads:", data);
        } catch (error) {
          console.error("Error fetching campaign leads:", error);
        }
      };
      fetchCampaignLeads();
    }
  }, [selectedCampaign]);
  
  // Dummy button to send an email test to the lead.
  const handleEmailTest = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        leadId: 1, // Dummy lead id for testing
        senderEmail: "simonhutch1611@gmail.com",  // Replace with a real sender email from your DB
        subject: "Test Email Subject",
        body: "This is a test email body sent from the Email Test button."
      };

      const response = await fetch("http://localhost:5000/api/leads/email-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to send test email");
      }
      const data = await response.json();
      console.log("Email test result:", data);
      alert("Email sent: " + data.message);
    } catch (error) {
      console.error("Error sending email test:", error);
      alert(error.message);
    }
  };
  
  // Step 1: When the test button is pressed, add lead (dummy lead id: 1) to the selected campaign's CampaignLeads.
  const handleTestButton = async () => {
    if (!selectedCampaign) {
      console.error("No campaign selected");
      return;
    }
    const payload = {
      campaign_id: selectedCampaign.id,
      lead_id: 1, // For testing, we use lead with id 1
    };

    console.log(payload)

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/campaign-leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("Failed to add lead to campaign");
      }
      const data = await response.json();
      console.log("Campaign lead added:", data);
      // You can update local state if needed here
    } catch (error) {
      console.error("Error adding lead to campaign:", error);
    }
  };
  
  // Popup handlers
  const handleAddNew = () => setShowPopup(true);
  const handleCancel = () => {
    setShowPopup(false);
    setCampaignName("");
  };

  const handleContinue = async () => {
    // Construct payload (you can adjust fields as needed)
    const payload = {
      name: campaignName,
      channel: "email",       // or "instagram", "sms", etc.
      is_active: true,
      daily_limit: 25,
      slow_ramp_enabled: false,
      random_delay_min: 30,
      random_delay_max: 90,
    };

    try {
      // Retrieve token (wherever you store it)
      const token = localStorage.getItem("token");
      console.log(token)
      if (!token) {
        alert("No token found. Please log in first.");
        return;
      }

      // Make the request
      const response = await fetch("http://localhost:5000/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // pass token for authentication
        },
        body: JSON.stringify(payload),
      });

      console.log(response)

      if (!response.ok) {
        throw new Error("Failed to create campaigNN");
      }

      const newCampaign = await response.json();
      // Update local campaign list
      setCampaigns([...campaigns, newCampaign]);

      // Reset UI
      setShowPopup(false);
      setCampaignName("");
    } catch (error) {
      console.error("Error creating campaign:", error);
      alert(error.message);
    }
  };


  // Clicking a campaign transitions to the "detail view"
  const handleCampaignClick = (campaign) => {
    setSelectedCampaign(campaign);
    setActiveTab("Analytics");
  };

  // Main layout toggles between campaign list and campaign detail
  if (selectedCampaign) {
    return (
      <div className="h-screen w-full bg-white p-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold">{selectedCampaign.name}</h1>
          <button
            onClick={() => setSelectedCampaign(null)}
            className="text-blue-600"
          >
            &larr; Back
          </button>
        </div>

        {/* Sub Navigation */}
        <div className="flex space-x-6 border-b border-gray-200 mb-4">
          {["Analytics", "Leads", "Sequences", "Schedule", "Options"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 ${activeTab === tab ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content (simple placeholders) */}
        {activeTab === "Analytics" && (
          <div className="text-gray-700">[Analytics content goes here]</div>
        )}
        {activeTab === "Leads" && (
          <div className="text-gray-700 flex flex-col items-center">
            <p className="mb-4">Add some leads to get started</p>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
              Add Leads
            </button>
            <button 
            className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4" 
            onClick={handleTestButton}
          >
            Test fs
          </button>
          <button 
          className="bg-green-500 text-white px-4 py-2 rounded-md"
          onClick={handleEmailTest}
        >
          Send Email Test
        </button>
          </div>
        )}
        {activeTab === "Sequences" && (
          <div className="flex text-black">
            {/* Left side: Steps */}
            <div className="w-1/4 mr-4 border rounded p-4">
              <div className="mb-2 font-semibold">Step 1</div>
              <div className="mb-4">&lt;empty subject&gt;</div>
              <button className="text-blue-600 mb-4">+ Add variant</button>
              <button className="border border-blue-500 text-blue-500 px-2 py-1 rounded">
                + Add step
              </button>
            </div>

            {/* Right side: Subject + Editor */}
            <div className="flex-1 border rounded p-4">
              <div className="flex items-center justify-between mb-2">
                <span>Subject: Your subject</span>
                <div>
                  <button className="border border-gray-300 rounded px-2 py-1 mr-2">
                    Preview
                  </button>
                  <button className="border border-gray-300 rounded px-2 py-1">
                    ⚙
                  </button>
                </div>
              </div>
              <textarea
                className="w-full border border-gray-300 rounded p-2 mb-2 text-black"
                rows="8"
                placeholder="Start typing here..."
              />
              <div className="flex justify-between">
                <button className="bg-blue-500 text-white px-4 py-2 rounded">
                  Save
                </button>
                <div className="flex space-x-2">
                  <button className="border border-gray-300 rounded px-2 py-1">
                    B
                  </button>
                  <button className="border border-gray-300 rounded px-2 py-1">
                    I
                  </button>
                  <button className="border border-gray-300 rounded px-2 py-1">
                    Link
                  </button>
                  <button className="border border-gray-300 rounded px-2 py-1">
                    Img
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === "Schedule" && (
          <div className="flex text-black">
            {/* Left Panel: Start/End Settings */}
            <div className="w-1/4 mr-4 border rounded p-4">
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Start</h3>
                <div className="flex items-center mb-2">
                  <input type="radio" name="start" value="now" id="startNow" />
                  <label htmlFor="startNow" className="ml-2">Now</label>
                </div>
                <div className="flex items-center">
                  <input type="radio" name="start" value="end" id="startEnd" />
                  <label htmlFor="startEnd" className="ml-2">End</label>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold mb-2">End</h3>
                <div className="flex items-center mb-2">
                  <input type="radio" name="end" value="noEnd" id="noEnd" />
                  <label htmlFor="noEnd" className="ml-2">No end date</label>
                </div>
                <div className="flex items-center">
                  <input type="radio" name="end" value="specificDate" id="specificDate" />
                  <label htmlFor="specificDate" className="ml-2">End on a specific date</label>
                </div>
              </div>

              <button className="text-blue-600">Add schedule</button>
            </div>

            {/* Right Panel: Schedule Details */}
            <div className="flex-1 border rounded p-4">
              <div className="mb-6">
                <label className="block font-semibold mb-1" htmlFor="scheduleName">Schedule Name</label>
                <input
                  type="text"
                  id="scheduleName"
                  placeholder="New schedule"
                  className="border border-gray-300 rounded w-full p-2"
                />
              </div>

              <div className="flex space-x-4 mb-6">
                <div className="w-1/3">
                  <label className="block font-semibold mb-1" htmlFor="fromTime">From</label>
                  <input
                    type="time"
                    id="fromTime"
                    defaultValue="09:00"
                    className="border border-gray-300 rounded w-full p-2"
                  />
                </div>
                <div className="w-1/3">
                  <label className="block font-semibold mb-1" htmlFor="toTime">To</label>
                  <input
                    type="time"
                    id="toTime"
                    defaultValue="18:00"
                    className="border border-gray-300 rounded w-full p-2"
                  />
                </div>
                <div className="w-1/3">
                  <label className="block font-semibold mb-1" htmlFor="timezone">Timezone</label>
                  <select
                    id="timezone"
                    className="border border-gray-300 rounded w-full p-2"
                  >
                    <option>Eastern Time (US & Canada)</option>
                    <option>Pacific Time (US & Canada)</option>
                    <option>Central Time (US & Canada)</option>
                  </select>
                </div>
              </div>

              <div>
                <span className="font-semibold">Days</span>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                    <label key={day} className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      {day}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Options" && (
          <div className="text-gray-700">
            [Options UI: Accounts to use, tracking toggles, etc.]
          </div>
        )}
      </div>
    );
  }

  // If no campaign selected, show main campaign list
  return (
    <div className="h-screen w-full bg-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold text-black">Campaigns</h1>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-72">
          <input
            type="text"
            placeholder="Search..."
            className="w-full border border-gray-300 px-4 py-2 rounded-md pl-10 bg-white"
          />
          <FiSearch className="absolute left-3 top-3 text-gray-500" />
        </div>
        <div className="flex space-x-4">
          <button className="border border-gray-300 rounded-md px-4 py-2 flex items-center">
            <HiLightningBolt className="text-gray-600 mr-2" /> All statuses
            <IoMdArrowDropdown className="ml-2" />
          </button>
          <button className="border border-gray-300 rounded-md px-4 py-2 flex items-center">
            Newest first <IoMdArrowDropdown className="ml-2" />
          </button>
          <button
            onClick={handleAddNew}
            className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FaPlus className="mr-2" /> Add new
          </button>
        </div>
      </div>

      {/* Campaign Cards */}
      {campaigns.map((c) => (
  <div
    key={c.id}
    onClick={() => handleCampaignClick(c)}
    className="border rounded p-4 mb-4 flex items-center justify-between cursor-pointer hover:shadow-sm transition"
  >
    <div>
      <h2 className="font-semibold text-black">{c.name}</h2>
      <span
        className={`inline-block px-2 py-1 text-sm rounded ${
          c.is_active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
        }`}
      >
        {c.is_active ? "Active" : "Inactive"}
      </span>
    </div>
    <div className="flex space-x-4 text-sm text-gray-700">
      <p>Sent: {c.metrics?.sent ?? 0}</p>
      <p>Clicks: {c.metrics?.clicks ?? 0}</p>
      <p>Replied: {c.metrics?.replied ?? 0}</p>
      <p>Opps: {c.metrics?.opportunities ?? 0}</p>
    </div>
  </div>
))}

      {campaigns.length === 0 && (
        <div className="text-center text-gray-400 py-10">
          No campaigns yet. Click "Add new" to create one.
        </div>
      )}

      {/* Fullscreen Popup for creating new campaign */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded p-6 w-96">
            <h2 className="text-2xl font-semibold mb-2">
              Let’s create a new campaign
            </h2>
            <p className="text-sm mb-4">What would you like to name it?</p>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4"
            />
            <div className="flex justify-between">
              <button
                onClick={handleCancel}
                className="bg-gray-300 text-black px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleContinue}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Campaigns;
