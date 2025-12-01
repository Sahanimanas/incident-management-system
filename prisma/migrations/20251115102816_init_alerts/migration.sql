-- CreateTable
CREATE TABLE "Alert" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "severity" TEXT NOT NULL,
    "cameraId" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "probability" REAL NOT NULL,
    "timestamp" TEXT NOT NULL
);
