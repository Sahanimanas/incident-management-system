const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const fs = require('fs')
const cameraRoutes =require("./routes/Cameras.js");
const generateMediamtxConfig =require("./utils/generateMediamtx");
app.use(cors());
app.use(express.json());
const { getCameraStatus } = require("./controller/cameraStatusController");
const { saveAlert, getLatestAlert, getAllAlerts } = require("./utils/alertService");
const { startAllRecordings, stopAllRecordings } =require("./controller/recordController.js")
app.post("/api/record/start", (req, res) => {
  startAllRecordings();
  res.json({ status: "recording_started" });
});

app.post("/api/record/stop", (req, res) => {
  stopAllRecordings();
  res.json({ status: "recording_stopped" });
});
app.use("/api/cameras", cameraRoutes);

// Initial YAML generation
if (!fs.existsSync("./data/cameras.json")) fs.writeFileSync("./data/cameras.json", "[]");
generateMediamtxConfig();
app.use('/api',  require('./routes/Dashboard.api'));
app.get("/api/camera-status", (req, res) => {
  res.json(getCameraStatus());
});
app.use('/api/incidents',require('./routes/Incidents.route'))
app.use('/api/analytics', require('./routes/analytics.js'))

// Receive alert and store in Prisma + SQLite
app.post("/api/receive-alert", async (req, res) => {
  try {
    const saved = await saveAlert(req.body);
    console.log("Saved alert:", saved);
    res.json({ status: "OK", saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save alert" });
  }
});

// Latest alert for frontend polling
app.get("/api/latest-alert", async (req, res) => {
  const alert = await getLatestAlert();
  res.json(alert || { message: "No alerts yet" });
});

// All alerts history
app.get("/api/alerts", async (req, res) => {
  const alerts = await getAllAlerts();
  res.json(alerts);
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`RefineVMS API listening on ${PORT}`));
