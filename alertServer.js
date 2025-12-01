const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const TARGET_URL = "http://localhost:3000/api/receive-alert";  // Your API

const SEVERITY = ["CRITICAL", "MAJOR", "MINOR", "INFO"];

function generateRandomAlert() {
  const severity = SEVERITY[Math.floor(Math.random() * SEVERITY.length)];
  return {
    id: Date.now(),
    severity,
    message: `${severity} alert triggered`,
    timestamp: new Date().toISOString(),
    cameraId: "cam-" + Math.floor(Math.random() * 10 + 1),
    location: ["Entrance", "Parking", "Hall-A", "Server Room"][Math.floor(Math.random() * 4)],
    probability: (Math.random() * (1 - 0.4) + 0.4).toFixed(2)
  };
}

setInterval(async () => {
  const alert = generateRandomAlert();
  console.log("Sending:", alert);

  try {
    await axios.post(TARGET_URL, alert);
  } catch (err) {
    console.error("Failed to send alert:", err.message);
  }
}, 50000);

app.listen(5001, () => console.log("Alert generator running on 5001"));
