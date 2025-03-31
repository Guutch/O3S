import { useState, useEffect, useRef } from "react";
import { FiSearch } from "react-icons/fi";
import { HiLightningBolt } from "react-icons/hi";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaPlus, FaBold, FaItalic, FaPause, FaChevronLeft, FaEllipsisH, FaLink, FaRegImage, FaInstagram, FaEnvelope, FaPlay } from "react-icons/fa";

function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const tabs = ["Analytics", "Leads", "Sequences", "Schedule", "Options"];
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const buttonRefs = useRef([]);
  const [campaignLeads, setCampaignLeads] = useState([]);
  const [leads, setLeads] = useState([]);
  const [showLeadsPopup, setShowLeadsPopup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formattedLeads, setFormattedLeads] = useState([]);
  const [scheduleName, setScheduleName] = useState("");
  const [startIsNow, setStartIsNow] = useState(true);
  const [endIsNoEnd, setEndIsNoEnd] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [savedSchedules, setSavedSchedules] = useState([]);
  const [editableSchedule, setEditableSchedule] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [cardSelected, setCardSelected] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState("email"); // default platform
  const [currentContent, setCurrentContent] = useState("");
  const [sequences, setSequences] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");
  const [steps, setSteps] = useState([1]);
  const [isCampaignPaused, setIsCampaignPaused] = useState(false);
  const [fromTime, setFromTime] = useState("09:00");
  const [toTime, setToTime] = useState("18:00");
  const [timezone, setTimezone] = useState("Pacific/Midway");
  const userId = localStorage.getItem("userId");
  const [days, setDays] = useState({
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false,
    Saturday: false,
    Sunday: false,
  });

  const addStep = () => {
    setSteps([...steps, steps.length + 1]);
  };

  // Toggle a day checkbox
  const handleDayToggle = (day) => {
    setDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  // Save schedule to backend
  const handleSaveSchedule = async () => {
    // Create an array of selected days
    const selectedDays = Object.keys(days).filter((day) => days[day]);

    // Prepare payload (adjust field names as per your backend schema)
    const payload = {
      campaignId, // If applicable
      scheduleName,
      fromTime,
      toTime,
      timezone,
      days: selectedDays,
    };

    try {
      const response = await fetch("http://localhost:5000/api/campaigns/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("Failed to save schedule");
      }
      const data = await response.json();
      console.log("Schedule saved:", data);
      // Optionally, show a success message or update state here
    } catch (error) {
      console.error("Error saving schedule:", error);
    }
  };

// In your resume campaign button component
const handleClick = async () => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId"); // Get the user's ID from localStorage
  const newStatus = isCampaignPaused ? true : false;

  try {
    // Update the campaign status
    const response = await fetch(`http://localhost:5000/api/campaigns/${selectedCampaign.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ is_active: newStatus }),
    });

    if (!response.ok) {
      throw new Error("Failed to update campaign status");
    }
    const updatedCampaign = await response.json();
    console.log("Campaign updated:", updatedCampaign);
    setIsCampaignPaused(!isCampaignPaused);
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === selectedCampaign.id
          ? { ...c, is_active: updatedCampaign.is_active }
          : c
      )
    );
    
    // Pass the user's ID in the body when resuming the campaign
    const resumeResponse = await fetch(`http://localhost:5000/api/campaigns/${selectedCampaign.id}/resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }),
    });
    const resumeData = await resumeResponse.json();
    console.log("Campaign resumed:", resumeData);
    alert("Campaign resumed. Check console for details.");
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};





  const handleAddSchedule = () => {
    // Use the entered schedule name (or default to "New schedule")
    const newSchedule = scheduleName.trim() !== "" ? scheduleName : "New schedule";
    // Prepend the new schedule card so the editable card stays on top
    setSavedSchedules([newSchedule, ...savedSchedules]);
    // Clear the schedule name input after saving
    setScheduleName("");
  };

  useEffect(() => {
    if (!tabs || tabs.length === 0) return; // Ensure tabs is defined and not empty
    const activeIndex = tabs.indexOf(activeTab);
    const btn = buttonRefs.current[activeIndex];
    if (!btn) return;
    const newStyle = { left: btn.offsetLeft, width: btn.offsetWidth };

    // Only update if the computed style has changed
    setIndicatorStyle((prevStyle) => {
      if (prevStyle.left === newStyle.left && prevStyle.width === newStyle.width) {
        return prevStyle;
      }
      return newStyle;
    });
  }, [activeTab, tabs]);


  const handleAddStep = () => {
    if (currentContent.trim() !== "") {
      const newStep = {
        step: sequences.length + 1,
        platform: currentPlatform,
        content: currentContent,
      };
      setSequences([newStep, ...sequences]);
      // Reset editable card
      setCurrentContent("");
      setCurrentPlatform("email");
    }
  };

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

  const fetchLeads = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/leads/import-sheets/${selectedCampaign.id}`, {
        method: 'POST', // Trigger the import process
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      console.log("THIS IS THE DATA", data.campaignLeads);
      if (data.success) {
        setLeads(data.campaignLeads);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };

  useEffect(() => {
    if (selectedCampaign && selectedCampaign.id) {
      fetchLeads();
    }
  }, [selectedCampaign]);

  useEffect(() => {
    // Transform the leads array into an array of objects, skipping the first row
    const transformed = leads.slice(1).map(lead => ({
      first_name: lead[0],
      last_name: lead[1],
      email: lead[2],
      ig_username: lead[3]
    }));

    setFormattedLeads(transformed);
  }, [leads]);

  useEffect(() => {
    console.log("###")
    // Console log the entire leads variable
    console.log('Entire leads variable:', leads);

    // Console log the type of leads
    console.log('Type of leads:', typeof leads);

    // If leads is an array, log its length and first item
    if (Array.isArray(leads)) {
      console.log('Leads length:', leads.length);
      console.log('First lead item:', leads[0]);

      // Log the keys of the first item if it's an object
      if (leads.length > 0 && typeof leads[0] === 'object') {
        console.log('Keys in first lead:', Object.keys(leads[0]));
      }
      console.log("###")
    }
  }, [leads]);

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

  // Handler for the "Add Leads" button that calls the import endpoint
  const handleAddLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/leads/import-sheets/${selectedCampaign.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const result = await res.json();
      console.log("Import result:", result);
      // Re-fetch leads to update the UI after import
      await fetchLeads();
    } catch (error) {
      console.error("Error importing leads:", error);
    } finally {
      setLoading(false);
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
      <div className="h-screen w-full bg-white p-5">
        {/* Top Bar */}
        <div className="flex items-center mb-4">
          <button
            onClick={() => setSelectedCampaign(null)}
            className="flex items-center space-x-2 bg-white"
          >
            <span className="bg-gray-300 rounded-full p-2 flex items-center justify-center">
              <FaChevronLeft className="text-black" />
            </span>
            {/* <span className="text-blue-600">Back</span> */}
          </button>
          <h1 className="text-lg font-semibold text-black">{selectedCampaign.name}</h1>

        </div>
        <div className="flex items-center justify-between mb-4 bg-white">
          <div className="relative">
            <div className="flex space-x-6">
              {tabs.map((tab, idx) => (
                <div
                  key={tab}
                  ref={(el) => (buttonRefs.current[idx] = el)}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 cursor-pointer transition-colors duration-200 ${activeTab === tab ? "text-blue-500" : "text-black"
                    }`}
                >
                  {tab}
                </div>
              ))}
            </div>
            <div
              className="absolute bottom-0 h-0.5 bg-blue-500 transition-all duration-200"
              style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
            />
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={handleClick}
              className="text-black bg-white border-2 border-gray-500 px-4 py-2 flex items-center space-x-2 h-10"
            >
              {isCampaignPaused ? (
                <FaPlay className="text-xl text-green-500" />
              ) : (
                <FaPause className="text-xl text-green-500" />
              )}
              <span>{isCampaignPaused ? "Resume Campaign" : "Pause Campaign"}</span>
            </button>
            <button
              onClick={() => setSelectedCampaign(null)}
              className="text-black bg-white border-2 border-gray-500 px-4 py-2 flex items-center justify-center h-10"
            >
              <FaEllipsisH className="text-xl" />
            </button>
          </div>
        </div>




        {/* Tab Content (simple placeholders) */}
        {activeTab === "Analytics" && (
          <div className="text-gray-700">[Analytics content goes here]</div>
        )}
        {activeTab === "Leads" && (
          <div className="text-gray-700 w-full">
            <div className="p-2 text-black w-full">
              {/* Top row with search, summary, and Add Leads button */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Search leads"
                    className="border bg-white p-1 rounded"
                  />
                  <div>
                    <span className="mr-2">{leads.length - 1} Total</span>
                    <span>
                      {formattedLeads.filter((lead) => lead.contacted).length} Contacted
                    </span>
                  </div>
                </div>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-md"
                  onClick={handleAddLeads}
                >
                  Add Leads
                </button>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full bg-white">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-4 py-2 text-left">
                        <input type="checkbox" className="custom-checkbox" />
                      </th>
                      <th className="px-4 py-4 text-left">Email</th>
                      <th className="px-4 py-4 text-left">Status</th>
                      <th className="px-4 py-4 text-left">Contact</th>
                      <th className="px-4 py-4 text-left">Instagram</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formattedLeads.map((lead, index) => (
                      <tr key={index}>
                        <td className="px-4 py-4">
                          <input type="checkbox" className="custom-checkbox" />
                        </td>
                        <td className="px-4 py-4">{lead.email}</td>
                        <td className="px-4 py-4">
                          {lead.contacted ? "Contacted" : "Not Yet Contacted"}
                        </td>
                        <td className="px-4 py-4">
                          {lead.first_name} {lead.last_name}
                        </td>
                        <td className="px-4 py-4">{lead.ig_username}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <style jsx>{`
      .custom-checkbox {
        appearance: none;
        width: 1rem;
        height: 1rem;
        border: 1px solid #d1d5db;
        background: white;
        position: relative;
        cursor: pointer;
      }
      .custom-checkbox:checked {
        border-color: #3b82f6;
      }
      .custom-checkbox:checked::after {
        content: "✕";
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #3b82f6;
        font-size: 0.75rem;
        font-weight: bold;
      }
    `}</style>
          </div>
        )}






        {activeTab === "Sequences" && (
          <div className="flex text-black">
            {/* Left side: Steps */}
            <div className="w-1/4 mr-4 flex flex-col">
              {steps.map((step, index) => (
                <div key={index} className="border border-blue-800 rounded mb-2 bg-gray-50">
                  {/* Top with Step number and Platform Icon */}
                  <div className="px-4 py-5 flex justify-between items-center">
                    <span className="font-semibold">Step {index + 1}</span>
                    {selectedPlatform === "instagram" ? (
                      <FaInstagram className="text-pink-500" size={20} />
                    ) : (
                      <FaEnvelope className="text-blue-500" size={20} />
                    )}
                  </div>

                  {/* Horizontal line */}
                  <hr className="border-gray-300" />

                  {/* Bottom */}
                  <div className="px-4 py-5 flex flex-col items-center space-y-4">
                    {/* Subject box */}
                    <div className="w-full border border-gray-300 rounded px-3 py-4">
                      <span className="text-black">&lt;Empty subject&gt;</span>
                    </div>

                    {/* Add variant */}
                    <div className="flex items-center space-x-1 py-4">
                      <span className="text-blue-600 font-bold">+</span>
                      <span className="font-bold text-black">Add variant</span>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addStep}
                className="bg-white border border-blue-500 text-blue-500 px-2 py-2 rounded w-full"
              >
                + Add step
              </button>
            </div>

            {/* Right side: Subject + Editor */}
            <div className="flex-1 border rounded p-4 bg-white">
              {/* Header row with subject, formatting options, and platform toggle */}
              <div className="flex justify-between items-center mb-2">
                {/* Left side: Preview and Cog */}
                <div className="flex items-center space-x-4">
                  <span>Subject: Your subject</span>
                  <button className="bg-white text-black border border-gray-300 rounded px-2 py-1">
                    Preview
                  </button>
                  <button className="bg-white text-black border border-gray-300 rounded px-2 py-1">
                    ⚙
                  </button>
                </div>

                {/* Right side: Platform Toggle */}
                <div className="mb-0 flex items-center">
                  <button
                    onClick={() => setSelectedPlatform("instagram")}
                    className={`px-4 py-2 mr-2 rounded flex items-center ${selectedPlatform === "instagram"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-black"
                      }`}
                  >
                    <FaInstagram className="mr" />

                  </button>
                  <button
                    onClick={() => setSelectedPlatform("email")}
                    className={`px-4 py-2 rounded flex items-center ${selectedPlatform === "email"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-black"
                      }`}
                  >
                    <FaEnvelope className="mr" />
                  </button>
                </div>
              </div>

              <textarea
                className="w-full border border-gray-300 rounded p-2 mb-2 text-black bg-white placeholder-gray-400"
                rows="8"
                placeholder="Start typing here..."
              />
              <div className="flex items-center space-x-4">
                <button className="bg-blue-500 text-white px-4 py-2 rounded">
                  Save
                </button>
                <button className="bg-white text-black border border-gray-300 rounded px-2 py-1">
                  <FaBold />
                </button>
                <button className="bg-white text-black border border-gray-300 rounded px-2 py-1">
                  <FaItalic />
                </button>
                <button className="bg-white text-black border border-gray-300 rounded px-2 py-1">
                  <FaLink />
                </button>
                <button className="bg-white text-black border border-gray-300 rounded px-2 py-1">
                  <FaRegImage />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Schedule" && (
          <div className="flex text-black">
            {/* Left Panel: Start/End Settings */}
            <div className="p-4 w-1/4">
              {/* Start */}
              <div className="flex items-center mb-4">
                <div className="w-16">
                  <h3 className="font-semibold">Start</h3>
                </div>
                <span className="mx-2">|</span>
                {startIsNow ? (
                  <span
                    className="text-blue-600 cursor-pointer"
                    onClick={() => setStartIsNow(false)}
                  >
                    Now
                  </span>
                ) : (
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    onBlur={() => {
                      if (!startDate) setStartIsNow(true);
                    }}
                    className="border border-gray-300 rounded p-1 text-blue-600"
                  />
                )}
              </div>

              {/* End */}
              <div className="flex items-center mb-4">
                <div className="w-16">
                  <h3 className="font-semibold">End</h3>
                </div>
                <span className="mx-2">|</span>
                {endIsNoEnd ? (
                  <span
                    className="text-blue-600 cursor-pointer"
                    onClick={() => setEndIsNoEnd(false)}
                  >
                    No end date
                  </span>
                ) : (
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    onBlur={() => {
                      if (!endDate) setEndIsNoEnd(true);
                    }}
                    className="border border-gray-300 rounded p-1 text-blue-600"
                  />
                )}
              </div>

              {/* Horizontal line with side margins */}
              <hr className="border-t border-gray-300 mx-4 mb-4" />

              {/* Display Schedule Card (non-editable) using the scheduleName state */}
              <div className="border border-gray-300 rounded p-2 flex items-center mb-4 bg-white">
                {/* Calendar icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-600 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3M3 11h18M3 19h18M5 15h.01M8 15h.01M11 15h.01M14 15h.01M17 15h.01"
                  />
                </svg>
                <span className="flex-1 text-gray-700">
                  {scheduleName.trim() !== "" ? scheduleName : "New schedule"}
                </span>
              </div>

              {/* Render saved schedule cards (freshest first) */}
              {savedSchedules.map((schedule, index) => (
                <div
                  key={index}
                  className="border border-gray-300 rounded p-2 flex items-center mb-2 bg-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-600 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3M3 11h18M3 19h18M5 15h.01M8 15h.01M11 15h.01M14 15h.01M17 15h.01"
                    />
                  </svg>
                  <span className="flex-1">{schedule}</span>
                </div>
              ))}

              {/* Add schedule button styled like a card */}
              <button
                onClick={handleAddSchedule}
                className="border border-gray-300 rounded p-1 w-full bg-white text-blue-600"
              >
                Add schedule
              </button>
            </div>

            {/* Right Panel: Schedule Details */}
            <div className="flex-1 border rounded p-4">
              {/* Schedule Name */}
              <div className="mb-6">
                <label className="block font-semibold mb-1" htmlFor="scheduleName">
                  Schedule Name
                </label>
                <input
                  type="text"
                  id="scheduleName"
                  placeholder="New schedule"
                  value={scheduleName}
                  onChange={(e) => setScheduleName(e.target.value)}
                  className="border border-black bg-white rounded w-full p-2"
                />
              </div>

              {/* For the icons */}
              <style jsx>{`
        input[type="time"]::-webkit-calendar-picker-indicator {
          filter: brightness(0);
        }
      `}</style>

              {/* Time & Timezone Section */}
              <div className="flex space-x-4 mb-6">
                <div className="w-1/3">
                  <label className="block font-semibold mb-1" htmlFor="fromTime">
                    From
                  </label>
                  <input
                    type="time"
                    id="fromTime"
                    value={fromTime}
                    onChange={(e) => setFromTime(e.target.value)}
                    className="border border-black bg-white rounded w-full p-2"
                  />
                </div>
                <div className="w-1/3">
                  <label className="block font-semibold mb-1" htmlFor="toTime">
                    To
                  </label>
                  <input
                    type="time"
                    id="toTime"
                    value={toTime}
                    onChange={(e) => setToTime(e.target.value)}
                    className="border border-black bg-white rounded w-full p-2"
                  />
                </div>
                <div className="w-1/3">
                  <label className="block font-semibold mb-1" htmlFor="timezone">
                    Timezone
                  </label>
                  <select
                    id="timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="border border-black bg-white rounded w-full p-2"
                  >
                    {/* Paste all your timezone options here */}
                    <option value="Pacific/Midway">(GMT-11:00) Midway Island, Samoa</option>
                    <option value="America/Adak">(GMT-10:00) Hawaii-Aleutian</option>
                    <option value="Etc/GMT+10">(GMT-10:00) Hawaii</option>
                    {/* ... rest of your options ... */}
                    <option value="Pacific/Tongatapu">(GMT+13:00) Nuku'alofa</option>
                  </select>
                </div>
              </div>

              {/* Days Section */}
              <div>
                <span className="font-semibold">Days</span>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                    (day) => (
                      <label key={day} className="flex items-center">
                        <input
                          type="checkbox"
                          className="custom-checkbox"
                          checked={days[day]}
                          onChange={() => handleDayToggle(day)}
                        />
                        {day}
                      </label>
                    )
                  )}
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-6">
                <button
                  onClick={handleSaveSchedule}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Save Schedule
                </button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
        .custom-checkbox {
          appearance: none;
          -webkit-appearance: none;
          width: 1rem;
          height: 1rem;
          border: 1px solid black;
          background-color: white;
          margin-right: 0.5rem;
          position: relative;
        }
        .custom-checkbox:checked::after {
          content: "X";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: blue;
          font-size: 1rem;
        }
      `}</style>

        {activeTab === "Options" && (
          <div className="space-y-4 text-gray-700">
            {/* Card: Accounts to use */}
            <div className="border border-gray-300 rounded p-4 bg-white">
              <div className="flex justify-between items-center">
                <div>
                  <label className="block font-medium mb-1">Accounts to use</label>
                  <p className="text-sm text-gray-500">Select one or more accounts to send emails from</p>
                </div>
                <div className="flex items-center space-x-2">
                  <select className="border border-gray-300 rounded px-2 py-1">
                    <option>Select...</option>
                    {/* other accounts */}
                  </select>
                  <a href="#" className="text-blue-600 text-sm">Connect new email account</a>
                </div>
              </div>
            </div>

            {/* Card: Stop sending on reply */}
            <div className="border border-gray-300 rounded p-4 bg-white flex justify-between items-center">
              <span className="font-medium">Stop sending emails on reply</span>
              <div className="space-x-2">
                <button className="border border-gray-300 rounded px-4 py-1">Disable</button>
                <button className="bg-blue-500 text-white rounded px-4 py-1">Enable</button>
              </div>
            </div>

            {/* Card: Open tracking */}
            <div className="border border-gray-300 rounded p-4 bg-white">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Open Tracking</span>
                <div className="space-x-2">
                  <button className="border border-gray-300 rounded px-4 py-1">Disable</button>
                  <button className="bg-blue-500 text-white rounded px-4 py-1">Enable</button>
                </div>
              </div>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="h-4 w-4" />
                <span>Link tracking</span>
              </label>
            </div>

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
              className={`inline-block px-2 py-1 text-sm rounded ${c.is_active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
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
