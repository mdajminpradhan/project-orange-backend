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
  treeId: { type: String, required: false },
  timestamp: { type: Date, default: Date.now },
});
const Data = mongoose.model("Data", DataSchema);

// Add this code after your existing mongoose connection
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", UserSchema);

// API to save data
app.post("/save-data", async (req, res) => {
  console.log("Request body:", req.body);

  // Get the first key from the request body which contains our data
  const rawData = Object.keys(req.body)[0];
  let parsedData;
  let treeId;

  try {
    // Parse the outer JSON structure
    const outerData = JSON.parse(rawData);

    // Extract tree ID
    treeId = outerData["Tree ID"];

    // Parse the disease data from the 'link' property
    if (outerData.link) {
      parsedData = JSON.parse(outerData.link);
    } else {
      return res.status(400).json({ error: "Invalid data format" });
    }
  } catch (error) {
    console.error("Parsing error:", error);
    return res.status(400).json({ error: "Invalid data format" });
  }

  console.log("Data to be saved:", parsedData);
  console.log("Tree ID:", treeId);

  try {
    const newData = {
      orangeData: JSON.stringify(parsedData), // Store the disease data
      treeId: treeId, // Store the tree ID from the request
    };

    await Data.create(newData);
    res.status(200).json({ message: "Data saved" });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: err.message });
  }
});

// API to get data
app.get("/get-data", async (req, res) => {
  try {
    const allData = await Data.find().sort({ timestamp: -1 });
    // console.log("Data sent:", allData);
    res.status(200).json(allData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API to register a new user
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const newUser = new User({ email, password });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "User registration failed" });
  }
});

// API to login a user
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Start the server
const PORT = 5500;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
