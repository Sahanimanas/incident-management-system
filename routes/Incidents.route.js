const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


const incidents = [
  {
    id: "INC-2024-001",
    title: "Fire Detection in Processing Unit B",
    severity: "CRITICAL",
    status: "Under Review",
    assigned: "Safety Team",
    time: "2024-11-01 14:32",
    description:
      "Automatic fire detection system triggered in Processing Unit B. Sprinkler system activated.",
    camera: "CAM-002",
    zone: "Processing Unit B",
    comments: [
      {
        user: "Safety Team Alpha",
        time: "14:35",
        text: "Emergency response team on site. Fire suppression working effectively.",
      },
      {
        user: "Control Room",
        time: "14:32",
        text: "Incident detected automatically by AI detection system.",
      },
    ],
    attachments: [
      { type: "image", name: "fire_detection_snapshot.jpg" },
      { type: "video", name: "incident_video_14-32.mp4" },
    ],
  },
  {
    id: "INC-2024-002",
    title: "PPE Violation - No Hard Hat Detected",
    severity: "MAJOR",
    status: "Open",
    assigned: "J. Martinez",
    time: "2024-11-01 14:28",
    description: "Worker entered the zone without proper head protection.",
    camera: "CAM-005",
    zone: "Main Floor",
    comments: [
      {
        user: "Control Room",
        time: "14:29",
        text: "PPE violation logged and alert sent to site manager.",
      },
    ],
    attachments: [{ type: "image", name: "ppe_violation_frame.jpg" }],
  },
  {
    id: "INC-2024-003",
    title: "Unauthorized Access to Restricted Zone",
    severity: "CRITICAL",
    status: "Resolved",
    assigned: "Security Team",
    time: "2024-11-01 14:25",
    description: "Unauthorized entry detected in Zone D by motion sensors.",
    camera: "CAM-008",
    zone: "Restricted Zone D",
    comments: [
      {
        user: "Security Team",
        time: "14:30",
        text: "Individual identified and escorted out of restricted area.",
      },
    ],
    attachments: [{ type: "video", name: "restricted_zone_motion.mp4" }],
  },
  {
    description:
      "Thermal sensors detected high temperature in conveyor unit 4.",
    camera: "CAM-010",
    zone: "Maintenance Bay",
    comments: [
      {
        user: "Maintenance Team",
        time: "14:18",
        text: "Cooling fans manually activated. Monitoring temperature levels.",
      },
    ],
    attachments: [{ type: "image", name: "thermal_reading_unit4.png" }],
  },
  {
    id: "INC-2024-005",
    title: "Missing Safety Vest Detection",
    severity: "MINOR",
    status: "Open",
    assigned: "A. Johnson",
    time: "2024-11-01 14:10",
    description: "Worker identified without safety vest in storage area.",
    camera: "CAM-006",
    zone: "Storage Zone A",
    comments: [
      {
        user: "Control Room",
        time: "14:12",
        text: "Notification sent to worker supervisor.",
      },
    ],
    attachments: [{ type: "image", name: "missing_vest_snapshot.jpg" }],
  },
  {
    id: "INC-2024-006",
    title: "Smoke Detection - False Alarm",
    severity: "CRITICAL",
    status: "Closed",
    assigned: "Fire Safety Team",
    time: "2024-11-01 13:45",
    description: "Smoke detector triggered by maintenance smoke testing.",
    camera: "CAM-011",
    zone: "Unit C",
    comments: [
      {
        user: "Fire Safety Team",
        time: "13:50",
        text: "False alarm verified, testing completed successfully.",
      },
    ],
    attachments: [{ type: "image", name: "smoke_test_snapshot.jpg" }],
  },
];

// Summary Function
async function getSummary() {
  const critical = await prisma.alert.count({
    where: { severity: "CRITICAL" },
  });

  const major = await prisma.alert.count({
    where: { severity: "MAJOR" },
  });

  const minor = await prisma.alert.count({
    where: { severity: "MINOR" },
  });

  const info = await prisma.alert.count({
    where: { severity: "INFO" },
  });

  return {
    critical,
    major,
    minor,
    resolved: info,   // you named INFO as resolved
  };
}

// GET summary (LIVE)
router.get("/", async (req, res) => {
  try {
    const summary = await getSummary();
    res.json({ summary,incidents });
  } catch (err) {
    console.error("Summary Error:", err);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});

// Get alert by ID (from database)
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const alert = await prisma.alert.findUnique({
      where: { id },
    });

    if (!alert) {
      return res.status(404).json({ error: "Alert not found" });
    }

    res.json(alert);
  } catch (err) {
    console.error("Get by ID Error:", err);
    res.status(500).json({ error: "Failed to fetch incident" });
  }
});

module.exports = router;
