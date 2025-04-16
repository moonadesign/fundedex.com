const fs = require("fs/promises");
const { google } = require("googleapis");

const spreadsheetId = "1KbmafM5nml7XftMKcqMQ5cfHPtrOAwuGV8oMGf_KhRk";
const range = "Tier 1 Founders!B2:I202";

const auth = new google.auth.GoogleAuth({
  keyFile: "./credentials.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const run = async () => {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const [header, ...rows] = data.values;
  const json = rows.map((row) =>
    Object.fromEntries(header.map((h, i) => [h, row[i] || ""]))
  );

  await fs.writeFile("./companies.json", JSON.stringify(json, null, 2));
  console.log("✅ companies.json created");
};

run().catch(console.error);
