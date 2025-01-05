const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Connect to MongoDB (locally hosted)
mongoose.connect("mongodb://localhost:27017/projectOrange");

// Mongoose Schema and Model
const DataSchema = new mongoose.Schema({
  orangeData: String,
  timestamp: { type: Date, default: Date.now },
});
const Data = mongoose.model("Data", DataSchema);

// API to save data
app.post("/save-data", async (req, res) => {
  const rawData = Object.keys(req.body)[0];
  let parsedData;

  try {
    parsedData = JSON.parse(rawData);
    // console.log("🚀 ~ app.post ~ parsedData:", parsedData);
  } catch (error) {
    return res.status(400).json({ error: "Invalid data format" });
  }

  console.log("hey - ", parsedData.orangeData);

  try {
    await Data.create({
      orangeData: parsedData.orangeData,
    });
    res.status(200).json({ message: "Data saved" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// API to get data
app.get("/get-data", async (req, res) => {
  try {
    const allData = await Data.find();
    console.log("🚀 ~ app.get ~ allData:", allData);
    res.status(200).json(allData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
const PORT = 5001;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
