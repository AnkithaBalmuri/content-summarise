import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import summarizeContent from "./src/summarizer.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5000;
const MAX_CHARACTERS = 12000;
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Tools like Postman do not send an origin header, so they are allowed.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    }
  })
);

// This allows Express to read JSON data sent by the React app.
app.use(express.json({ limit: "150kb" }));

app.get("/api/health", (req, res) => {
  res.json({
    message: "AI Content Summarizer API is running."
  });
});

async function summarizeHandler(req, res) {
  try {
    const { content, summaryLength, summaryFormat } = req.body || {};

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        message: "Content is required."
      });
    }

    if (content.length > MAX_CHARACTERS) {
      return res.status(400).json({
        message: `Content is too long. Please keep it under ${MAX_CHARACTERS} characters.`
      });
    }

    const allowedLengths = ["short", "medium", "large"];
    const allowedFormats = ["paragraph", "bullet-points", "five-lines"];

    if (!allowedLengths.includes(summaryLength)) {
      return res.status(400).json({
        message: "Invalid summary length."
      });
    }

    if (!allowedFormats.includes(summaryFormat)) {
      return res.status(400).json({
        message: "Invalid summary format."
      });
    }

    const summary = await summarizeContent({
      content,
      summaryLength,
      summaryFormat
    });

    return res.json({ summary });
  } catch (error) {
    console.error("Summarize error:", error.message);

    return res.status(500).json({
      message: error.message || "The server could not create a summary."
    });
  }
}

app.post("/api/summarize", summarizeHandler);
app.post("/summarize", summarizeHandler);

// This catches broken JSON or payloads that are too large.
app.use((error, req, res, next) => {
  if (error) {
    return res.status(400).json({
      message: "Invalid request data."
    });
  }

  return next();
});

// In production, Express can serve the built React app from the same URL.
const clientDistPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientDistPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
