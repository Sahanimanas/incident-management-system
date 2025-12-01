const express = require("express");
const router = express.Router();

const { getCameraStatus } = require("../controller/cameraStatusController");

router.get("/dashboard", (req, res) => {
  const camData = getCameraStatus();

  const stats = {
    activeCameras: camData.activeCameras,
    totalCameras: camData.totalCameras,
    inactiveCameras: camData.inactiveCameras,
    openIncidents: 0,       // replace if you have a real DB
    ppeViolationsToday: 0,  // replace later
    systemHealthPercent: Math.round((camData.activeCameras / camData.totalCameras) * 100)
  };

  res.json({
    stats,
    cameras: camData.cameras.slice(0, 12),
    alerts: [],
    events: []
  });
});

router.get("/camera", (req, res) => {
  const camData = getCameraStatus();
  res.json(camData);
});

router.get("/stats", (req, res) => {
  const camData = getCameraStatus();
  const stats = {
    activeCameras: camData.activeCameras,
    inactiveCameras: camData.inactiveCameras,
    totalCameras: camData.totalCameras
  };
  res.json(stats);
});

module.exports = router;
