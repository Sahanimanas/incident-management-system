const express = require("express");
const router = express.Router();
const fs = require("fs");
const axios = require("axios");
const generateMediamtxConfig = require("../utils/generateMediamtx.js");
const checkRTSP = require("../utils/checkRTSP.js");

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

// GET single camera by ID
router.get("/:id", (req, res) => {
  const cameras = loadCameras();
  const camera = cameras.find((c) => c.id === req.params.id);
  if (!camera) {
    return res.status(404).json({ error: "Camera not found" });
  }
  res.json(camera);
});

// TEST camera connection (RTSP reachability check)
router.post("/test", async (req, res) => {
  const { ip, port = 554 } = req.body;

  if (!ip) {
    return res.status(400).json({ error: "IP address is required" });
  }

  try {
    const isOnline = await checkRTSP(ip, port);
    res.json({ 
      online: isOnline, 
      ip, 
      port,
      message: isOnline ? "Camera is reachable" : "Camera is not responding"
    });
  } catch (error) {
    res.json({ 
      online: false, 
      ip, 
      port, 
      message: "Connection test failed",
      error: error.message 
    });
  }
});

// ADD new camera
router.post("/", async (req, res) => {
  const { id, name, ip, username, password, rtspUrl } = req.body;

  // Validation
  if (!id || !ip) {
    return res.status(400).json({ error: "Camera ID and IP address are required" });
  }

  // Sanitize camera ID (lowercase, no special chars except hyphen)
  const sanitizedId = id.toLowerCase().replace(/[^a-z0-9-]/g, '-');

  const cameras = loadCameras();

  // Check for duplicate
  if (cameras.find((c) => c.ip === sanitizedId)) {
    return res.status(400).json({ error: "Camera with this ID already exists" });
  }

  // Create camera object
  const newCamera = {
    id: sanitizedId,
    name: name || sanitizedId,
    ip,
    username: username || '',
    password: password || '',
    rtspUrl: rtspUrl || '',
    createdAt: new Date().toISOString(),
    status: 'pending'
  };

  cameras.push(newCamera);
  saveCameras(cameras);

  // Regenerate MediaMTX configuration
  generateMediamtxConfig();

  // Reload MediaMTX configuration
  try {
    await axios.post("http://localhost:9997/v3/config/reload");
    newCamera.status = 'active';
  } catch (e) {
    console.log("⚠️ Could not reload MediaMTX automatically:", e.message);
    newCamera.status = 'pending_reload';
  }

  res.status(201).json({ 
    success: true, 
    camera: newCamera,
    message: "Camera added successfully"
  });
});

// UPDATE camera
router.put("/:id", async (req, res) => {
  const { name, ip, username, password } = req.body;
  const cameras = loadCameras();
  const index = cameras.findIndex((c) => c.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Camera not found" });
  }

  // Update fields
  if (name) cameras[index].name = name;
  if (ip) cameras[index].ip = ip;
  if (username !== undefined) cameras[index].username = username;
  if (password !== undefined) cameras[index].password = password;
  cameras[index].updatedAt = new Date().toISOString();

  saveCameras(cameras);
  generateMediamtxConfig();

  try {
    await axios.post("http://localhost:9997/v3/config/reload");
  } catch (e) {
    console.log("⚠️ MediaMTX reload failed:", e.message);
  }

  res.json({ success: true, camera: cameras[index] });
});

// DELETE camera
router.delete("/:id", async (req, res) => {
  const cameras = loadCameras();
  const camera = cameras.find((c) => c.id === req.params.id);

  if (!camera) {
    return res.status(404).json({ error: "Camera not found" });
  }

  const updated = cameras.filter((c) => c.id !== req.params.id);
  saveCameras(updated);
  generateMediamtxConfig();

  try {
    await axios.post("http://localhost:9997/v3/config/reload");
  } catch (e) {
    console.log("⚠️ MediaMTX reload failed:", e.message);
  }

  res.json({ success: true, message: "Camera deleted successfully" });
});

// GET camera stream status from MediaMTX
router.get("/:id/status", async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:9997/v3/paths/${req.params.id}`);
    res.json({
      online: true,
      ...response.data
    });
  } catch (error) {
    res.json({
      online: false,
      error: "Stream not available"
    });
  }
});

module.exports = router;