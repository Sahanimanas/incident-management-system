const express = require('express');
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    summary: { total: 247, avgResolution: "2.4h", ppeCompliance: 94.2, activeCameras: "47/48" },
    trends: [
      { day: "Mon", critical: 10, major: 7, minor: 4 },
      { day: "Tue", critical: 5, major: 8, minor: 6 },
      { day: "Wed", critical: 12, major: 5, minor: 3 },
    ],
    zones: [
      { zone: "Processing", count: 30 },
      { zone: "Packaging", count: 22 },
      { zone: "Loading", count: 18 },
    ],
    incidents: [
      { id: "INC-001", title: "Fire Alert", severity: "CRITICAL" },
      { id: "INC-002", title: "Unauthorized Access", severity: "MAJOR" },
    ],
    system: { uptime: "99.2%", storage: "2.1TB", cpu: "94%" },
  });
});

module.exports = router