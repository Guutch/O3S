// // campaignAPI.js
// export const getCampaignSequences = async (token) => {
//     try {
//       const response = await fetch("http://localhost:5000/api/campaigns/sequences", {
//         headers: { "Authorization": `Bearer ${token}` }
//       });
//       return await response.json();
//     } catch (error) {
//       console.error("Error fetching campaign sequences:", error);
//       throw error;
//     }
//   };

//   export const getCampaignSchedules = async (token) => {
//     try {
//       const response = await fetch("http://localhost:5000/api/campaigns/schedules", {
//         headers: { "Authorization": `Bearer ${token}` }
//       });
//       return await response.json();
//     } catch (error) {
//       console.error("Error fetching campaign schedules:", error);
//       throw error;
//     }
//   };

// campaignAPI.js
export const getCampaignSequences = async (token, campaignId) => {
    try {
      const response = await fetch("http://localhost:5000/api/campaigns/sequences", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      console.log("This is the campaignId", campaignId)
      const data = await response.json();
      // Filter sequences that match the given campaignId
      return data.filter(sequence => sequence.campaign_id == campaignId);
    } catch (error) {
      console.error("Error fetching campaign sequences:", error);
      throw error;
    }
  };
  
  export const getCampaignSchedules = async (token, campaignId) => {
    try {
      const response = await fetch("http://localhost:5000/api/campaigns/schedules", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      // Filter schedules that match the given campaignId
      return data.filter(schedule => schedule.campaign_id == campaignId);
    } catch (error) {
      console.error("Error fetching campaign schedules:", error);
      throw error;
    }
  };
  
