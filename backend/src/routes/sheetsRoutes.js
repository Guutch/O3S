// sheetsRoutes.js
const express = require("express");
const router = express.Router();
const { readSheetData } = require("../services/sheetsService"); // Adjust path as needed

// GET /api/leads/import-sheets
router.get("/import-sheets", async (req, res) => {
console.log("Inside /import-sheets route. Headers:", req.headers);

  try {
    const values = await readSheetData();
    // Log the raw data for debugging
    console.log("Google Sheets data:", values);
    
    // Optionally, parse the data into objects using the first row as headers.
    if (!values || values.length < 2) {
      return res.status(400).json({ success: false, message: "No data found" });
    }
    
    const headers = values[0].map(header => header.trim().toLowerCase().replace(/\s/g, '_'));
    const rows = values.slice(1);
    const leads = rows.map(row => {
      const lead = {};
      headers.forEach((header, index) => {
        lead[header] = row[index];
      });
      return lead;
    });
    
    res.json({ success: true, leads });
  } catch (error) {
    console.error("Error reading Google Sheets data:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

// Mission:
// i'm confused. so, let's take a step back. when i press the 'add leads' button, i should then see a popup. that popup should then allow me to to enter in the spreadsheet ID. once that has been entered, the code needs to be triggered. once that happens, let's just have the leads show up in the frontend. once we can get the leads to show up in the frontend, we can then work on the middle bit, which would be to have the leads entered into the database before being shown on the front end.

// create the step by step plan that needs to be followed. once we have established that, let's go through one step at a time. 

// ###
