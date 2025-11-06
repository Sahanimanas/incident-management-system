const express = require("express");

const router = express.Router();
const fs = require("fs");
const axios = require("axios");
const generateMediamtxConfig= require("../utils/generateMediamtx.js");

const CAMERA_FILE = "./data/cameras.json";

// Helper functions
function loadCameras() {
  if (!fs.existsSync(CAMERA_FILE)) return [];
  return JSON.parse(fs.readFileSync(CAMERA_FILE));
}
function saveCameras(data) {
  fs.writeFileSync(CAMERA_FILE, JSON.stringify(data, null, 2));
}

// GET all cameras
router.get("/", (req, res) => {
  res.json(loadCameras());
});

// ADD new camera
router.post("/", async (req, res) => {
  const { id, name, ip, username, password } = req.body;
  if (!id || !ip) return res.status(400).json({ error: "Missing ID or IP" });

  const cams = loadCameras();
  if (cams.find((c) => c.id === id))
    return res.status(400).json({ error: "Camera already exists" });

  cams.push({ id, name, ip, username, password });
  saveCameras(cams);
  generateMediamtxConfig();

  // Ask MediaMTX to reload configuration (if API enabled)
  try {
    await axios.post("http://localhost:9997/v3/config/reload");
  } catch (e) {
    console.log("⚠️ Could not reload MediaMTX automatically.");
  }

  res.json({ success: true });
});

// DELETE camera
router.delete("/:id", async (req, res) => {
  const updated = loadCameras().filter((c) => c.id !== req.params.id);
  saveCameras(updated);
  generateMediamtxConfig();
  try {
    await axios.post("http://localhost:9997/v3/config/reload");
  } catch (e) {
    console.log("⚠️ MediaMTX reload failed.");
  }
  res.json({ success: true });
});

module.exports = router;
