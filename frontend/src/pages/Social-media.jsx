import React, { useState, useEffect } from 'react';
import { FiSearch } from "react-icons/fi";
import { HiLightningBolt } from "react-icons/hi";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaPlus, FaInstagram, FaEnvelope, FaEdit, FaTrash } from "react-icons/fa";

function SocialMedia() {
  const [accounts, setAccounts] = useState([]);
  const [sendingAccounts, setSendingAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState('choose'); // 'choose' or 'instagram'
  const [instagramUsername, setInstagramUsername] = useState('');
  const [instagramCookie, setInstagramCookie] = useState('');
  const [instagramAccounts, setInstagramAccounts] = useState([]);
  const allAccounts = [...instagramAccounts, ...sendingAccounts];

  // Retrieve userId and token from localStorage
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token"); // Assuming JWT is stored in localStorage

  const GOOGLE_REDIRECT_URI = "http://localhost:5001/auth/google/callback";

  // Fetch Instagram accounts associated with this user
  useEffect(() => {
    const fetchInstagramAccounts = async () => {
      try {
        // Only fetch if we actually have a userId
        if (!userId) return;
        console.log("USERS ID", userId)
        const response = await fetch(`http://localhost:5000/api/instagramAccounts?userId=${userId}`);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        console.log("Instagram accounts:", data);
        setInstagramAccounts(data);
      } catch (error) {
        console.error("Error fetching Instagram accounts:", error);
      }
    };

    fetchInstagramAccounts();
  }, [userId]);

  useEffect(() => {
    console.log(allAccounts)
  }, [allAccounts])

  // Fetch sending accounts
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
        console.log("Sending accounts:", data);
        setSendingAccounts(data);
      } catch (error) {
        console.error("Error fetching sending accounts:", error);
      }
    };

    if (token) {
      fetchSendingAccounts();
    }
  }, [token]);

  // Modal controls
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

  // Save Instagram account
  const handleInstagramSave = async () => {
    try {
      if (!userId) {
        alert("No user ID found.");
        return;
      }

      const payload = {
        user_id: userId,
        username: instagramUsername,
        cookies: instagramCookie,
      };

      const response = await fetch('http://localhost:5000/api/instagram/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to save Instagram account');

      const data = await response.json();
      // Update local display of accounts if you want
      setAccounts([...accounts, { id: data.id, type: 'Instagram', details: instagramUsername }]);
      closeModal();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // Handle connecting email (Google OAuth)
  const handleEmailConnect = () => {
    window.open(GOOGLE_REDIRECT_URI, '_blank');
    // If you want to track the new account in local state:
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
      <div className="overflow-x-auto w-full">
  <table className="w-full bg-white">
    <thead className="bg-white">
      <tr>
        
        <th className="px-4 py-4 text-left text-black">
        <FaInstagram className=" text-white inline-block mr-1 " />
        Account</th>
        <th className="px-4 py-4 text-left text-black">Platform</th>
        <th className="px-4 py-4 text-left text-black">Identifier</th>
        <th className="px-4 py-4 text-left text-black">Actions</th>
      </tr>
    </thead>
    <tbody>
      {allAccounts.map((account) => {
        // Decide if it's email vs. Instagram vs. unknown
        const isEmail = account.platform === "email";
        // If platform is literally "instagram" OR platform is missing but there's a username, treat it as Instagram
        const isInstagram =
          account.platform === "instagram" || (!account.platform && account.username);

        return (
          <tr key={account.id}>
            {/* 1: Account (Icon + label) */}
            <td className="px-4 py-4">
              {isInstagram ? (
                <>
                  <FaInstagram className=" text-pink-500 inline-block mr-1 " />
                  <span className="text-black">{account.username}</span>
                </>
              ) : isEmail ? (
                <>
                  <FaEnvelope className="text-black inline-block mr-1" />
                  <span className="text-black">{account.account_identifier}</span>
                </>
              ) : (
                <>
                  <span className="text-black mr-1">?</span>
                  <span className="text-black">{account.account_identifier}</span>
                </>
              )}
            </td>

            {/* 2: Platform */}
            <td className="px-4 py-4 text-black">
              {isInstagram ? "Instagram" : isEmail ? "Email" : "Unknown"}
            </td>

            {/* 3: Identifier */}
            <td className="px-4 py-4 text-black">
              {isInstagram ? account.username : account.account_identifier}
            </td>

            {/* 4: Actions */}
            <td className="px-4 py-4">
              <div className="flex space-x-4">
              <button
  className="cursor-pointer text-black hover:text-blue-500 bg-white p-1 rounded"
  title="Edit"
>
  <FaEdit className="h-4 w-4" />
</button>
<button
  className="cursor-pointer text-black hover:text-red-500 bg-white p-1 rounded"
  title="Delete"
>
  <FaTrash className="h-4 w-4" />
</button>

              </div>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
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
                  <button
                    onClick={() => setModalStep('instagram')}
                    className="border border-gray-300 rounded-md px-4 py-2"
                  >
                    Instagram
                  </button>
                  <button
                    onClick={handleEmailConnect}
                    className="border border-gray-300 rounded-md px-4 py-2"
                  >
                    Email
                  </button>
                </div>
              </>
            )}
            {modalStep === 'instagram' && (
              <>
                <h2 className="text-lg font-semibold mb-4">Add Instagram Account</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Paste your Instagram cookie JSON below.
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
