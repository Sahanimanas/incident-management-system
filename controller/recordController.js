const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// Load cameras from JSON
const cameras = require("../data/cameras.json");

let activeRecordings = {};

// -------------------------------------------------------
// Build the RTSP URL from camera info
// -------------------------------------------------------
function buildRTSP(cam) {
  if (!cam.ip || !cam.username || !cam.password) {
    console.log(`❌ Missing RTSP credentials for ${cam.id}`);
    return null;
  }

  // DEFAULT RTSP PATH (most generic)
  return `rtsp://${cam.username}:${cam.password}@${cam.ip}:8554/live`;
  // If needed, I will modify this per camera brand.
}

// -------------------------------------------------------
// Start recording all cameras
// -------------------------------------------------------
function startAllRecordings() {
  if (Object.keys(activeRecordings).length > 0) {
    console.log("Recording already active. Skipping start.");
    return;
  }

  const dir = path.join(__dirname, "recordings");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  cameras.forEach((cam) => {
    const rtspUrl = buildRTSP(cam);

    if (!rtspUrl) {
      console.log(`❌ Skipping ${cam.id} — no RTSP URL`);
      return;
    }

    const output = path.join(dir, `${cam.id}_${Date.now()}.mp4`);

    console.log(`🎥 Recording started: ${cam.id}`);
    console.log(`➡️  RTSP: ${rtspUrl}`);

    const ff = spawn("ffmpeg", [
      "-rtsp_transport", "tcp",
      "-i", rtspUrl,
      "-vcodec", "copy",
      "-an",
      "-f", "mp4",
      output
    ]);

    activeRecordings[cam.id] = ff;

    ff.stderr.on("data", (data) => {
      console.log(`FFmpeg (${cam.id}): ${data}`);
    });

    ff.on("close", () => {
      console.log(`FFmpeg process ended for ${cam.id}`);
    });
  });
}

// -------------------------------------------------------
// Stop all recordings
// -------------------------------------------------------
function stopAllRecordings() {
  for (const camId in activeRecordings) {
    try {
      activeRecordings[camId].kill("SIGINT");
      console.log(`🛑 Recording stopped: ${camId}`);
    } catch (err) {
      console.log(`❌ Failed to stop ${camId}:`, err);
    }
  }

  activeRecordings = {};
}

module.exports = {
  startAllRecordings,
  stopAllRecordings
};
