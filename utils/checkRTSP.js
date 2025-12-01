// utils/checkRTSP.js
const net = require("net");

function checkRTSP(ip, port = 554, timeout = 1500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    socket.setTimeout(timeout);

    socket.connect(port, ip, () => {
      socket.destroy();
      resolve(true); // camera is live
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve(false); // offline
    });

    socket.on("error", () => {
      socket.destroy();
      resolve(false); // offline
    });
  });
}

module.exports = checkRTSP;
