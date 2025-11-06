const fs = require("fs");

const generateMediamtxConfig = () => {
  const cams = fs.existsSync("./data/cameras.json")
    ? JSON.parse(fs.readFileSync("./data/cameras.json"))
    : [];

  const cfg = {
    api: "yes",
    apiAddress: ":9997",
    rtspAddress: ":8554",
    webrtc: "yes",
    paths: {},
  };

  for (const cam of cams) {
    cfg.paths[cam.id.toLowerCase()] = {
      source: `rtsp://${cam.username}:${cam.password}@${cam.ip}:554/live`,
      sourceOnDemand: "yes",
    };
  }

  fs.writeFileSync("./mediamtx.yml", toYAML(cfg));
  console.log("🟢 MediaMTX config updated with", cams.length, "cameras.");
};

// Simple YAML serializer
function toYAML(obj, indent = 0) {
  const spaces = " ".repeat(indent);
  if (typeof obj !== "object" || obj === null) return `${obj}`;
  if (Array.isArray(obj))
    return obj.map((v) => `${spaces}- ${toYAML(v, indent + 2)}`).join("\n");
  return Object.entries(obj)
    .map(([k, v]) =>
      typeof v === "object"
        ? `${spaces}${k}:\n${toYAML(v, indent + 2)}`
        : `${spaces}${k}: ${v}`
    )
    .join("\n");
}

module.exports = generateMediamtxConfig;
