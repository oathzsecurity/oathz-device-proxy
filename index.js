import http from "http";
import fetch from "node-fetch";

const UPSTREAM = process.env.UPSTREAM_URL || "https://api.oathzsecurity.com/data";
const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/data") {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", async () => {
      console.log("📡 Incoming device data:", body);

      try {
        const fwd = await fetch(UPSTREAM, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });

        const responseJson = await fwd.json();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, result: responseJson }));
      } catch (err) {
        console.error("❌ Forwarding error:", err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "Forwarding failed" }));
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: "Not Found" }));
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ RAW HTTP proxy listening on :${PORT}`);
});