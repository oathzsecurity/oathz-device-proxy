import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 8080;

// 🔥 Prevent Express from trusting Railway proxy (stops forced HTTPS)
app.disable("trust proxy");

// 🔍 Debug: log protocol so we know what Railway is doing
app.use((req, res, next) => {
  console.log("🔎 Incoming protocol:", req.headers["x-forwarded-proto"]);
  next();
});

// Parse JSON bodies
app.use(express.json());

// Basic root check
app.get("/", (req, res) => {
  res.json({ ok: false, error: "Not Found" });
});

// Device POST endpoint
app.post("/data", async (req, res) => {
  console.log("📡 Incoming device data:", req.body);

  try {
    const fwd = await fetch("https://api.oathzsecurity.com/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const result = await fwd.json();
    res.json({ ok: true, result });
  } catch (err) {
    console.error("❌ Forwarding error:", err);
    res.status(500).json({ ok: false, error: "Forwarding failed" });
  }
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Device proxy listening on :${PORT}`);
});
