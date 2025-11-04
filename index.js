import express from "express";
import cors from "cors";
import morgan from "morgan";
import axios from "axios";

const app = express();

const PORT = process.env.PORT || 3000;
const TARGET_URL = process.env.TARGET_URL || "https://api.oathzsecurity.com/data";
const SHARED_KEY = process.env.SHARED_KEY || "";

app.set("trust proxy", true);
app.use(cors());
app.use(express.json({ limit: "256kb" }));
app.use(morgan("tiny"));

app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

app.post("/data", async (req, res) => {
  const receivedAt = new Date().toISOString();

  const meta = {
    receivedAt,
    ip: req.ip,
    ua: req.get("user-agent") || "unknown",
  };

  const payload = {
    ...req.body,
    _proxy: meta,
  };

  try {
    await axios.post(
      TARGET_URL,
      payload,
      {
        timeout: 8000,
        headers: {
          "Content-Type": "application/json",
        }
      }
    );
  } catch (err) {
    console.error("Forwarding error:", err?.response?.status || err.message);
  }

  res.status(200).json({ ok: true });
});

app.use((_req, res) => res.status(404).json({ ok: false, error: "Not Found" }));

app.listen(PORT, () => {
  console.log(`Device proxy listening on :${PORT} -> ${TARGET_URL}`);
});
