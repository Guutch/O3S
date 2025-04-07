// sheetsService.js
const { google } = require("googleapis");
// const keys = require("./credentials.json"); // Ensure correct path
require('dotenv').config();
const keys = JSON.parse(process.env.GOOGLE_CREDENTIALS);

async function readSheetDataById(spreadsheetId) {
  // Create a JWT client using your service account credentials
  const client = new google.auth.JWT(
    keys.client_email,
    null,
    keys.private_key,
    ["https://www.googleapis.com/auth/spreadsheets.readonly"]
  );

  // Authorize the client
  await client.authorize();

  const sheets = google.sheets({ version: "v4", auth: client });
  const range = "Sheet1!A1:D"; // Assumes your columns are in A-D (first_name, last_name, email, ig_username)

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  return response.data.values;
}

async function readSheetData(spreadsheetId) {
  // Create a JWT client using your service account credentials
  const client = new google.auth.JWT(
    keys.client_email,
    null,
    keys.private_key,
    ["https://www.googleapis.com/auth/spreadsheets.readonly"]
  );

  // Authorize the client
  await client.authorize();

  const sheets = google.sheets({ version: "v4", auth: client });
  const range = "Sheet1!A1:D"; // Assumes columns A-D (first_name, last_name, email, ig_username)

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  // response.data.values is an array of arrays; first row should be headers
  return response.data.values;
}




module.exports = { readSheetData, readSheetDataById };
