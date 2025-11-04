import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const TARGET_URL = process.env.TARGET_URL;
if (!TARGET_URL) {
  console.error("❌ Missing TARGET_URL env var");
  process.exit(1);
}

console.log(`✅ Device proxy forwarding to -> ${TARGET_URL}`);

// ---- ACCEPT POST /data WITHOUT REDIRECT ----
app.post("/data", async (req, res) => {
  console.log("📡 Incoming POST from device:", req.body);

  try {
    const upstream = await fetch(TARGET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });

    const result = await upstream.text();
    console.log("⬆️  Upstream response:", result);

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("🔥 Error forwarding:", err);
    res.status(500).json({ ok: false, error: "Upstream error" });
  }
});

// ---- CATCH-ALL 404 FOR EVERYTHING ELSE ----
app.all("*", (req, res) => {
  res.status(404).json({ ok: false, error: "Not Found" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Device proxy listening on :${PORT}`);
});
