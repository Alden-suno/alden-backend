const pool = require("./db");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ TEST ROUTE (CHECK IF SERVER IS RUNNING)
app.get("/", (req, res) => {
  res.send("Alden backend is live 🚀");
});

// ✅ BUSINESS DATA (TEMP — CAN REPLACE WITH DB LATER)
const businesses = [
  {
    id: 1,
    name: "Alden HQ",
    category: "Technology",
    address: "Lagos, Nigeria",
    lat: 6.5244,
    lng: 3.3792,
    verified: true
  },
  {
    id: 2,
    name: "Gold Fashion House",
    category: "Fashion",
    address: "Ikeja, Lagos",
    lat: 6.6018,
    lng: 3.3515,
    verified: false
  }
];

// ✅ THIS IS WHAT THE MAP USES
app.get("/businesses", (req, res) => {
  res.json(businesses);
});
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log("Server running");
});
// ✅ REQUIRED FOR RENDER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Alden backend running on port ${PORT}`);
  app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
});



