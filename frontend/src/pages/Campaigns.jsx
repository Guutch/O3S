import React, { useState, useEffect, useRef } from "react";
import { FiSearch } from "react-icons/fi";
import { HiLightningBolt } from "react-icons/hi";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaPlus, FaBold, FaItalic, FaPause, FaChevronLeft, FaEllipsisH, FaLink, FaRegImage, FaInstagram, FaEnvelope, FaPlay, FaCode, FaTrash } from "react-icons/fa";
import { timezones } from '../assets/timezones';
import { getCampaignSequences, getCampaignSchedules } from "../components/campaignAPI";
// import { readSheetDataById } from '/@fs/home/simon/Documents/Instantly/backend/src/services/IDTest.js';

function Campaigns() {
  const [showCard, setShowCard] = useState(false);
  const [showGCard, setShowGCard] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [originalSpreadsheetId, setOriginalSpreadsheetId] = useState("");
  const [tempSpreadsheetId, setTempSpreadsheetId] = useState(""); // editable value from the popup
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
  const [savedSequences, setSavedSequences] = useState([]);
  const [editableSchedule, setEditableSchedule] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [cardSelected, setCardSelected] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState("email"); // default platform
  const [currentContent, setCurrentContent] = useState("");
  const [sequences, setSequences] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");
  const [steps, setSteps] = useState([]);

  const [emailSteps, setEmailSteps] = useState([]);
  const [instagramSteps, setInstagramSteps] = useState([]);

  const [isCampaignPaused, setIsCampaignPaused] = useState(false);
  const [fromTime, setFromTime] = useState("09:00");
  const [toTime, setToTime] = useState("18:00");
  const [timezone, setTimezone] = useState("Pacific/Midway");
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const [messageLogs, setMessageLogs] = useState([]);
  const [totalSent, setTotalSent] = useState(0);
  const [subject, setSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [selectedStepIndex, setSelectedStepIndex] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);
  const [days, setDays] = useState({
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false,
    Saturday: false,
    Sunday: false,
  });

  useEffect(() => {
    const stepsForPlatform = selectedPlatform === "email" ? emailSteps : instagramSteps;
    if (selectedStepIndex !== null && stepsForPlatform[selectedStepIndex]) {
      const selectedSequence = stepsForPlatform[selectedStepIndex];
      setMessageBody(selectedSequence.message_body || "");
      setSubject(selectedPlatform === "email" ? selectedSequence.subject || "" : "");
    } else {
      setMessageBody("");
      setSubject("");
    }
  }, [selectedStepIndex, emailSteps, instagramSteps, selectedPlatform]);

  const addStep = () => {
    const newStep = {
      id: null,
      platform: selectedPlatform,
      subject: "",
      messageBody: "",
      delay: 0,
    };

    if (selectedPlatform === "email") {
      setEmailSteps([...emailSteps, newStep]);
      setSelectedStepIndex(emailSteps.length);
    } else {
      setInstagramSteps([...instagramSteps, newStep]);
      setSelectedStepIndex(instagramSteps.length);
    }
  };

  const addStepTwo = (stepData) => {
    console.log("THIS IS STEP 2", stepData);
    const newStep = stepData || {
      id: null,
      platform: selectedPlatform, // defaults to currently selected platform
      subject: "",
      messageBody: "",
      delay: 0,
    };

    if (selectedPlatform === "email") {
      setEmailSteps([...emailSteps, newStep]);
      setSelectedStepIndex(emailSteps.length); // new step gets index of current length
    } else if (selectedPlatform === "instagram") {
      setInstagramSteps([...instagramSteps, newStep]);
      setSelectedStepIndex(instagramSteps.length);
    }
  };

  useEffect(() => {
    if (selectedStep !== null && steps[selectedStep]) {
      const selectedSequence = steps[selectedStep];
      setMessageBody(selectedSequence.message_body || "");
      if (selectedSequence.platform === "email") {
        setSubject(selectedSequence.subject || "");
      } else {
        setSubject("");
      }
    } else {
      // Clear fields if no step is selected
      setMessageBody("");
      setSubject("");
    }
  }, [selectedStep, steps]);


  useEffect(() => {
    if (selectedCampaign && selectedCampaign.id) {
      fetch("http://localhost:5000/api/campaigns/sequences", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
        .then(response => response.json())
        .then(data => {
          // Filter sequences that belong to the selected campaign
          const campaignSequences = data.filter(seq => seq.campaign_id === selectedCampaign.id);
          console.log("Campaign sequences:", campaignSequences);
          // Separate the sequences by platform:
          setEmailSteps(campaignSequences.filter(seq => seq.platform === "email"));
          setInstagramSteps(campaignSequences.filter(seq => seq.platform === "instagram"));
        })
        .catch(error => console.error("Error fetching sequences:", error));
    }
  }, [selectedCampaign, token]);




  useEffect(() => {
    if (selectedCampaign) {
      getCampaignSequences(token, selectedCampaign.id)
        .then(data => console.log("Campaign Sequences:", data))
        .catch(err => console.error(err));

      getCampaignSchedules(token, selectedCampaign.id)
        .then(data => {
          console.log("Campaign Schedules:", data);
          console.log("Number of Schedules:", data.length);
          setSavedSchedules(data);
        })
        .catch(err => console.error(err));
    }
  }, [selectedCampaign]);

  // Toggle a day checkbox
  const handleDayToggle = (day) => {
    setDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const handleSave = async () => {
    if (!selectedCampaign || !selectedCampaign.id) return;

    // Calculate the next step number for the current platform.
    const stepCount = steps.filter((step) => step.platform === selectedPlatform).length;
    const newStepNumber = stepCount + 1;

    const payload = {
      campaign_id: selectedCampaign.id, // The selected campaign ID
      step_number: newStepNumber,         // Dynamic step number based on existing steps for the platform
      platform: selectedPlatform,         // "email" or "instagram"
      subject: subject,                   // e.g., "Welcome!"
      message_body: messageBody,          // e.g., "Hello, welcome to our service!"
      delay: 0,                           // Adjust as needed
    };

    console.log("Saving sequence:", payload);

    try {
      const response = await fetch("http://localhost:5000/api/campaigns/sequences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      addStepTwo(payload);
      // console.log("THIS IS TEHD DATA ", data)
      // if (data.success) {
      //   // On success, add the step using the payload (or response data if available)

      //   addStepTwo(payload);
      // } else {
      //   console.error("Failed to save sequence:", data.error || data);
      // }
    } catch (error) {
      console.error("Error saving sequence:", error);
    }
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

    const userId = localStorage.getItem("userId");

    console.log("THIS IS THE LEADS", leads)
    console.log("THIS IS THE FORMATTEDLEADS", formattedLeads)

    if (isCampaignPaused) {
      // Campaign is paused: resume it.
      try {
        // Update campaign status to active (true)
        const response = await fetch(`http://localhost:5000/api/campaigns/${selectedCampaign.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ is_active: true }),
        });
        if (!response.ok) {
          throw new Error("Failed to update campaign status");
        }
        const updatedCampaign = await response.json();
        console.log("Campaign updated (resumed):", updatedCampaign);
        setIsCampaignPaused(false); // Now active

        // Trigger resume endpoint to start sending messages.
        const resumeResponse = await fetch(`http://localhost:5000/api/campaigns/${selectedCampaign.id}/resume`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ userId, formattedLeads }),
        });
        const resumeData = await resumeResponse.json();
        console.log("Campaign resumed:", resumeData);
        alert("Campaign resumed. Check console for details.");
      } catch (error) {
        console.error(error);
        alert(error.message);
      }
    } else {
      // Campaign is active: pause it.
      try {
        const response = await fetch(`http://localhost:5000/api/campaigns/${selectedCampaign.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ is_active: false }),
        });
        if (!response.ok) {
          throw new Error("Failed to update campaign status");
        }
        const updatedCampaign = await response.json();
        console.log("Campaign updated (paused):", updatedCampaign);
        setIsCampaignPaused(true);
        alert("Campaign paused.");
      } catch (error) {
        console.error(error);
        alert(error.message);
      }
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
      // Filter out steps for the current platform
      const platformSteps = sequences.filter((step) => step.platform === currentPlatform);
      // New step's display index is count of steps for that platform + 1 (starts at 1)
      const newStepNumber = platformSteps.length + 1;

      const newStep = {
        step: newStepNumber,
        platform: currentPlatform,
        content: currentContent,
        // Add additional fields if needed (subject, delay, etc.)
      };

      // Append the new step to sequences
      setSequences([...sequences, newStep]);
      // Reset editable fields
      setCurrentContent("");
      setCurrentPlatform("email");
    }
  };

  // useEffect(() => {
  //   const XX = async () => {
  //     console.log("THIS IS THE STEPS:");
  //     steps.forEach((step, index) => {
  //       console.log(`Step ${index + 1}:`);
  //       console.log("id:", step.id);
  //       console.log("platform:", step.platform);
  //       console.log("subject:", step.subject);
  //       console.log("messageBody:", step.messageBody);
  //       console.log("delay:", step.delay);
  //     });
  //   };
  //   XX();
  // }, [steps]);

  // HANDLES THE CODE THAT SHOWS THE ... CARD OR NOT 
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowCard(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // UPDATE SPREADSHEET ID
  const handleUpdateSpreadsheet = async () => {
    console.log("Updating spreadsheet ID to:", tempSpreadsheetId);
    try {
      // Check connection to the Google Sheet using the new tempSpreadsheetId (via your /check-sheet endpoint or readSheetDataById directly)
      const checkRes = await fetch(`http://localhost:5000/api/campaigns/check-sheet/${tempSpreadsheetId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const checkData = await checkRes.json();
      if (!checkData.success) {
        console.error("Google sheet connection failed or returned no data");
        return;
      }
      // If connection is good, update the backend:
      const res = await fetch(`http://localhost:5000/api/campaigns/${selectedCampaign.id}/spreadsheet`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ spreadsheetId: tempSpreadsheetId })
      });
      const data = await res.json();
      if (data && data.message === "Spreadsheet ID updated successfully") {
        console.log("Spreadsheet connection updated.");
        // Update the main spreadsheetId state with the new value
        setSpreadsheetId(tempSpreadsheetId);
        setOriginalSpreadsheetId(tempSpreadsheetId);
        // Refresh leads after a successful update
        await fetchLeads();
      } else {
        console.error("Failed to update spreadsheet ID:", data.error);
      }
    } catch (error) {
      console.error("Error updating spreadsheet ID:", error);
    } finally {
      setShowGCard(false);
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
    if (!spreadsheetId) {
      console.error("Spreadsheet ID is missing. Aborting fetchLeads.");
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/leads/import-sheets/${selectedCampaign.id}`, {
        method: 'POST', // Trigger the import process
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spreadsheetId })
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
    // Get steps only for the currently selected platform
    const platformSteps = steps.filter((step) => step.platform === selectedPlatform);
    // Get the selected index for the current platform
    const currentIndex = selectedStep?.[selectedPlatform];
    if (currentIndex !== null && currentIndex !== undefined && platformSteps[currentIndex]) {
      const selectedSequence = platformSteps[currentIndex];
      setMessageBody(selectedSequence.message_body || "");
      if (selectedSequence.platform === "email") {
        setSubject(selectedSequence.subject || "");
      } else {
        setSubject("");
      }
    } else {
      setMessageBody("");
      setSubject("");
    }
  }, [selectedStep, steps, selectedPlatform]);


  useEffect(() => {
    if (selectedCampaign && selectedCampaign.id) {
      fetchLeads();
    }
  }, [selectedCampaign, spreadsheetId]);

  useEffect(() => {
    if (selectedCampaign && selectedCampaign.id) {
      fetch(`http://localhost:5000/api/campaigns/${selectedCampaign.id}/spreadsheet`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
        .then(response => response.json())
        .then(data => {
          console.log("Spreadsheet ID:", data.spreadsheetId);
          setSpreadsheetId(data.spreadsheetId);
          setOriginalSpreadsheetId(data.spreadsheetId); // Save the original value
          setTempSpreadsheetId(data.spreadsheetId); // set the editable value to current value
        })
        .catch(error => {
          console.error("Error fetching spreadsheet ID:", error);
        });
    }
  }, [selectedCampaign, token]);

  useEffect(() => {
    // If there's only one step, auto-select it.
    if (steps.length === 1) {
      setSelectedStep(0);
    }
  }, [steps]);

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
          <div
            onClick={() => setSelectedCampaign(null)}
            className="flex items-center space-x-2 bg-white px-2 py-1 rounded cursor-pointer"
          >
            <span className="bg-gray-300 rounded-full p-2 flex items-center justify-center">
              <FaChevronLeft className="text-black" />
            </span>
            {/* <span className="text-blue-600">Back</span> */}
          </div>

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

            <div ref={containerRef} className="relative inline-block">
              <button
                onClick={() => setShowCard(!showCard)}
                className="text-black bg-white border-2 border-gray-500 px-4 py-2 flex items-center justify-center h-10"
              >
                <FaEllipsisH className="text-xl" />
              </button>
              {showCard && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-300 rounded shadow p-4 z-10">
                  <p
                    onClick={() => {
                      /* Delete campaign logic here */
                      setShowCard(false);
                    }}
                    className="cursor-pointer text-sm text-black mb-2 p-2 hover:bg-gray-200 transition"
                  >
                    Delete Campaign
                  </p>
                  <p
                    onClick={() => {
                      /* Rename campaign logic here */
                      setShowCard(false);
                    }}
                    className="cursor-pointer text-sm text-black mb-2 p-2 hover:bg-gray-200 transition"
                  >
                    Rename Campaign
                  </p>
                </div>
              )}
            </div>

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
                <div>
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                    onClick={() => setShowGCard(true)}
                  >
                    Update Spreadsheet ID
                  </button>
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md ml-4"
                    onClick={handleAddLeads}
                  >
                    Refresh Leads
                  </button>

                  {showGCard && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
                      <div className="bg-white p-6 rounded-md shadow-md w-full max-w-lg">
                        <h2 className="text-xl font-bold mb-4">Update Spreadsheet ID</h2>
                        <textarea
                          className="border border-gray-300 rounded p-2 w-full mb-4 bg-white text-black resize-none"
                          value={tempSpreadsheetId}
                          onChange={(e) => setTempSpreadsheetId(e.target.value)}
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            className="bg-blue-500 text-white px-4 py-2 rounded-md"
                            onClick={() => {
                              // Revert changes if user closes the popup
                              setSpreadsheetId(originalSpreadsheetId);
                              setTempSpreadsheetId(originalSpreadsheetId);
                              setShowGCard(false);
                            }}
                          >
                            Close
                          </button>
                          <button
                            className="bg-green-500 text-white px-4 py-2 rounded-md"
                            onClick={handleUpdateSpreadsheet}
                          >
                            Update
                          </button>
                        </div>
                      </div>
                    </div>
                  )}



                </div>
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
            <div className="h-[80vh] w-1/4 mr-4 flex flex-col">
              {/* Scrollable steps container */}
              <div className="flex-1 overflow-y-auto">
                {(selectedPlatform === "email" ? emailSteps : instagramSteps)
                  .map((step, index) => {
                    // If step.id is null, prefix the index with "new-"
                    const uniqueId = step.id !== null ? step.id : `new-${index}`;
                    const key = `step-${selectedPlatform}-${uniqueId}`;
                    console.log("Computed key:", key, "Step:", step);
                    return (
                      <div
                        key={key}
                        onClick={() => setSelectedStepIndex(index)}
                        className={`rounded mb-2 bg-gray-50 border ${selectedStepIndex === index ? "border-blue-800 border-2" : "border-black"
                          }`}
                      >
                        <div className="px-4 py-5 flex justify-between items-center">
                          <span className="font-semibold">Step {index + 1}</span>
                          {selectedPlatform === "instagram" ? (
                            <FaInstagram className="text-pink-500" size={20} />
                          ) : (
                            <FaEnvelope className="text-blue-500" size={20} />
                          )}
                        </div>
                        <hr className="border-gray-300" />
                        <div className="px-4 py-5 flex flex-col items-center space-y-4">
                          <div className="flex items-center space-x-1 py-4">
                            <span className="text-blue-600 font-bold">+</span>
                            <span className="font-bold text-black">Add variant</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}


              </div>


              {/* Fixed bottom container for Add step button */}
              <div className="pt-2">
                <button
                  onClick={addStep}
                  className="bg-white border border-blue-500 text-blue-500 px-2 py-2 rounded w-full"
                >
                  + Add step
                </button>
              </div>
            </div>

            {/* Right side: Subject + Editor */}
            <div className="flex-1 border rounded p-4 bg-white h-[80vh]">
              {/* Header row with subject, formatting options, and platform toggle */}
              <div className="flex justify-between items-center mb-2">
                {/* Left side: Subject (shown only for email), Preview, and Cog */}
                <div className="flex items-center space-x-4">
                  {selectedPlatform === "email" && (
                    <textarea
                      className="border border-gray-300 rounded p-1 text-black bg-white placeholder-gray-400 resize-none w-full mb-2"
                      rows="1"
                      placeholder="Your Subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  )}
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
                    onClick={() => {
                      setSelectedPlatform("instagram");
                      setSelectedStepIndex(null); // Clear selection
                      setSubject("");
                      setMessageBody("");
                    }}
                    className={`px-4 py-2 mr-2 rounded flex items-center ${selectedPlatform === "instagram"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-black"
                      }`}
                  >
                    <FaInstagram />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPlatform("email");
                      setSelectedStepIndex(null);
                      setSubject("");
                      setMessageBody("");
                    }}
                    className={`px-4 py-2 rounded flex items-center ${selectedPlatform === "email"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-black"
                      }`}
                  >
                    <FaEnvelope />
                  </button>
                </div>
              </div>

              {/* Message Body */}
              <textarea
                className="w-full border border-gray-300 rounded h-[60vh] p-2 mb-2 text-black bg-white placeholder-gray-400 resize-none"
                rows="8"
                placeholder="Start typing here..."
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
              />

              <div className="flex items-center space-x-4">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={handleSave}
                >
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
                <button className="bg-white text-black border border-gray-300 rounded px-2 py-1 flex items-center space-x-1">
                  <FaCode />
                  <span>Variables</span>
                </button>
              </div>
            </div>



          </div>
        )}

        {activeTab === "Schedule" && (
          <div className="flex text-black">
            {/* Left Panel: Start/End Settings */}
            <div className="h-[80vh] w-1/4 flex flex-col">

              <div className="px-4 pt-4">
                {/* Start */}
                <div className="flex items-center mb-4 ">
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

                {/* Horizontal line */}
                <hr className="border-t border-gray-300 mx-4 mb-4" />
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto p-4">


                {/* Schedule card */}
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
                  <div className="hover:text-red-500 cursor-pointer">
                    {/* <FaTrash /> */}
                  </div>
                </div>

                {/* Render saved schedule cards */}
                {savedSchedules.map((schedule, index) => (
                  <div
                    key={schedule.id || index}
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
                    <span className="flex-1">
                      {schedule.schedule_name.trim() !== "" ? schedule.schedule_name : "New schedule"}
                    </span>
                    <div className="hover:text-red-500 cursor-pointer">
                      <FaTrash />
                    </div>
                  </div>
                ))}
              </div>

              {/* Fixed bottom button */}
              <div className="p-4">
                <button
                  onClick={handleAddSchedule}
                  className="border border-gray-300 rounded p-1 w-full bg-white text-blue-600"
                >
                  Add schedule
                </button>
              </div>
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
                    {timezones.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
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

            {/* Card: Max number of first DMs an hour */}
            <div className="border border-gray-300 rounded p-4 bg-white">
              <div className="flex justify-between items-center">
                <div>
                  <label className="block font-medium mb-1">
                    Max number of first DMs an hour
                  </label>
                  <p className="text-sm text-gray-500">
                    Select a value between 1 and 10
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <select className="border border-gray-300 rounded px-2 py-1">
                    <option>Select...</option>
                    {[...Array(10)].map((_, i) => (
                      <option key={i} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
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
    <div className="h-screen w-full bg-white p-6 ">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold text-black">Campaigns</h1>
      </div>
      <hr className="border-t border-gray-300 mb-5" />


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
