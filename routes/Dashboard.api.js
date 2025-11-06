const express = require("express");
const router = express.Router();
// Mock data
const stats = {
  activeCameras: 127,
  totalCameras: 132,
  openIncidents: 3,
  ppeViolationsToday: 12,
  systemHealthPercent: 98,
};
const cameras = Array.from({ length: 12 }).map((_, i) => ({
  id: `CAM-${String(i + 1).padStart(3, "0")}`,
  status: ["online", "offline", "warning"][Math.floor(Math.random() * 3)],
  lastSeen: new Date(Date.now() - Math.random() * 1000 * 60 * 60).toISOString(),
}));
const alerts = [
  {
    id: 1,
    type: "Fire Detection",
    camera: "CAM-002",
    level: "critical",
    time: "2 min ago",
  },
  {
    id: 2,
    type: "No PPE Detected",
    camera: "CAM-006",
    level: "warning",
    time: "5 min ago",
  },
  {
    id: 3,
    type: "Motion Detected",
    camera: "CAM-008",
    level: "info",
    time: "8 min ago",
  },
];
const events = [
  {
    id: 1,
    severity: "critical",
    title: "Fire Alert - Unit B",
    time: "14:32",
    details: "Automatic sprinkler activated",
  },
  {
    id: 2,
    severity: "warning",
    title: "PPE Violation Detected",
    time: "14:28",
    details: "Worker without helmet",
  },
  {
    id: 3,
    severity: "info",
    title: "Motion in Restricted Area",
    time: "14:25",
    details: "Security patrol confirmed",
  },
  {
    id: 4,
    severity: "resolved",
    title: "Equipment Maintenance",
    time: "14:20",
    details: "Camera CAM-015 back online",
  },
];
router.get("/dashboard", (req, res) => {
  res.json({ stats, cameras: cameras.slice(0, 12), alerts, events });
});
router.get("/stats", (req, res) => res.json(stats));
router.get("/cameras", (req, res) => res.json(cameras));
router.get("/alerts", (req, res) => res.json(alerts));
router.get("/events", (req, res) => res.json(events));

module.exports = router;
