// utils/alertService.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function saveAlert(alert) {
  return prisma.alert.create({
    data: {
      severity: alert.severity,
      cameraId: alert.cameraId,
      location: alert.location,
      message: alert.message,
      probability: Number(alert.probability),
      timestamp: alert.timestamp || new Date().toISOString()
    }
  });
}

async function getLatestAlert() {
  return prisma.alert.findFirst({
    orderBy: { id: "desc" }
  });
}

async function getAllAlerts() {
  return prisma.alert.findMany({
    orderBy: { id: "desc" }
  });
}

module.exports = {
  saveAlert,
  getLatestAlert,
  getAllAlerts
};
