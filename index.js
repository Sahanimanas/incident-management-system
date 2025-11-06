const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const fs = require('fs')
const cameraRoutes =require("./routes/Cameras.js");
const generateMediamtxConfig =require("./utils/generateMediamtx");
app.use(cors());
app.use(express.json());

app.use("/api/cameras", cameraRoutes);

// Initial YAML generation
if (!fs.existsSync("./data/cameras.json")) fs.writeFileSync("./data/cameras.json", "[]");
generateMediamtxConfig();
app.use('/api',  require('./routes/Dashboard.api'));
app.use('/api/incidents',require('./routes/Incidents.route'))
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`RefineVMS API listening on ${PORT}`));
