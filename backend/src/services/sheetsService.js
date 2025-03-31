// sheetsService.js
const { google } = require("googleapis");
const keys = require("./credentials.json"); // Ensure correct path

async function readSheetData() {
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
  const spreadsheetId = "14gRmyNseNoOPxRkaBZdFNLnIOTwNNkibOQPjjIF5Nvw"; // Replace with your Spreadsheet ID
  const range = "Sheet1!A1:D"; // Assumes your columns are in A-D (first_name, last_name, email, ig_username)

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  
//   console.log(response.data.values)

  // response.data.values is an array of arrays. The first row should be your headers.
  return response.data.values;
}

module.exports = { readSheetData };
