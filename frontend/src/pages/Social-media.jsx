import React, { useState, useEffect } from 'react';
import { FiSearch } from "react-icons/fi";
import { HiLightningBolt } from "react-icons/hi";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaPlus, FaInstagram, FaEnvelope } from "react-icons/fa";

function SocialMedia() {
  const [accounts, setAccounts] = React.useState([]);
  const [sendingAccounts, setSendingAccounts] = useState([]);
  const [showModal, setShowModal] = React.useState(false);
  const [modalStep, setModalStep] = React.useState('choose'); // 'choose' or 'instagram'
  const [instagramUsername, setInstagramUsername] = React.useState('');
  const [instagramCookie, setInstagramCookie] = React.useState('');
  const GOOGLE_REDIRECT_URI = "http://localhost:5001/auth/google/callback";
  const token = localStorage.getItem("token"); // Assuming JWT is stored in localStorage

  useEffect(() => {
    const fetchSendingAccounts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/sending-accounts", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Send JWT for authentication
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch sending accounts");
        }

        const data = await response.json();
        console.log(data)
        setSendingAccounts(data); // Store data in state
      } catch (error) {
        console.error("Error fetching sending accounts:", error);
      }
    };

    fetchSendingAccounts();
  }, [token]); // Runs when token changes

  const openModal = () => {
    setModalStep('choose');
    setShowModal(true);
  };

  const closeModal = () => {
    setModalStep('choose');
    setShowModal(false);
    setInstagramUsername('');
    setInstagramCookie('');
  };

  const handleInstagramSave = async () => {
    const payload = {
      user_id: 1, // Dummy user id for demo
      username: instagramUsername,
      cookies: instagramCookie,
    };

    try {
      const response = await fetch('http://localhost:5000/api/instagram/add', { // Use full backend URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to save Instagram account');
      const data = await response.json();
      setAccounts([...accounts, { id: data.id, type: 'Instagram', details: instagramUsername }]);
      closeModal();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };
  

  const handleEmailConnect = () => {
    window.open(GOOGLE_REDIRECT_URI, '_blank');
    setAccounts([...accounts, { id: Date.now(), type: "Email", details: "Connected" }]);
    closeModal();
  };

  return (
    <div className="h-screen w-full bg-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold text-black">Social Media Accounts</h1>
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
        <button onClick={openModal} className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center">
          <FaPlus className="mr-2" /> Add New
        </button>
      </div>

      {/* Table */}
      <div className="w-full border rounded-md">
  <div className="grid grid-cols-4 bg-gray-100 text-black text-sm font-medium py-2 border-b">
    <div>Account</div>
    <div>Platform</div>
    <div>Email</div>
    <div>Actions</div>
  </div>
  {sendingAccounts.map((account) => (
    <div key={account.id} className="grid grid-cols-4 items-center py-2 border-b">
<div className="flex items-center space-x-2">
  {account.platform === "instagram" ? (
    <FaInstagram className="text-black" />
  ) : (
    <FaEnvelope className="text-black" />
  )}
  <span className="text-black">{account.account_identifier}</span>
</div>

      <div className="text-black">{account.platform}</div>
      <div className="text-black">{account.account_identifier}</div>
      <div>
        <select className="border border-gray-300 rounded-md px-2 py-1">
          <option>Actions</option>
          <option>Edit</option>
          <option>Delete</option>
        </select>
      </div>
    </div>
  ))}
</div>


      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
          onClick={closeModal}
        >
          <div className="bg-white rounded-md p-6 w-96 relative" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-600" onClick={closeModal}>X</button>
            {modalStep === 'choose' && (
              <>
                <h2 className="text-lg font-semibold mb-4">Add Account</h2>
                <div className="flex flex-col space-y-4">
                  <button onClick={() => setModalStep('instagram')} className="border border-gray-300 rounded-md px-4 py-2">
                    Instagram
                  </button>
                  <button onClick={handleEmailConnect} className="border border-gray-300 rounded-md px-4 py-2">
                    Email
                  </button>
                </div>
              </>
            )}
            {modalStep === 'instagram' && (
              <>
                <h2 className="text-lg font-semibold mb-4">Add Instagram Account</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Follow the instructions to get your Instagram cookie.
                </p>
                <input 
                  type="text"
                  value={instagramUsername}
                  onChange={(e) => setInstagramUsername(e.target.value)}
                  placeholder="Instagram Username"
                  className="w-full border border-gray-300 px-4 py-2 rounded-md mb-4"
                />
                <textarea 
                  value={instagramCookie}
                  onChange={(e) => setInstagramCookie(e.target.value)}
                  placeholder="Paste Instagram Cookie JSON here"
                  className="w-full border border-gray-300 px-4 py-2 rounded-md mb-4"
                  rows="4"
                />
                <button 
                  onClick={handleInstagramSave}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md w-full"
                >
                  Save
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


  
  export default SocialMedia;
  