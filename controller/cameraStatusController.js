// controllers/cameraStatusController.js
const fs = require("fs");
const path = require("path");
const checkRTSP = require("../utils/checkRTSP");

const cameras = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/cameras.json"))
);

// Global cache
let cameraStatus = cameras.map((cam) => ({
  ...cam,
  status: "checking",
  lastSeen: null,
}));

async function updateCameraStatus() {
  // console.log("🔍 Checking camera status...");

  const results = await Promise.all(
    cameras.map(async (cam) => {
      const alive = await checkRTSP(cam.ip, 8554); // CAMERA RTSP PORT

      return {
        ...cam,
        status: alive ? "online" : "offline",
        lastSeen: alive ? new Date().toISOString() : null,
      };
    })
  );

  cameraStatus = results;
  // console.log("📡 Status updated");
}

// run every 15 sec
setInterval(updateCameraStatus, 15000);

// run on startup
updateCameraStatus();

function getCameraStatus() {
  const active = cameraStatus.filter((c) => c.status === "online").length;
  const inactive = cameraStatus.filter((c) => c.status === "offline").length;

  return {
    cameras: cameraStatus,
    activeCameras: active,
    inactiveCameras: inactive,
    totalCameras: cameraStatus.length,
  };
}

module.exports = { getCameraStatus };
