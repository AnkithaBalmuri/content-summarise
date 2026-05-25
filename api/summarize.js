import { traceable } from "langsmith/traceable";
import { buildPrompt } from "../server/src/prompt.js";

const MAX_CHARACTERS = 12000;
const allowedLengths = ["short", "medium", "large"];
const allowedFormats = ["paragraph", "bullet-points", "five-lines"];

async function summarizeWithGroq({ content, summaryLength, summaryFormat }) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Groq API key is missing. Add GROQ_API_KEY in Vercel Environment Variables.");
  }

  const prompt = buildPrompt({ content, summaryLength, summaryFormat });

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You summarize user content clearly and accurately."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Groq could not create a summary.");
  }

  const summary = data.choices?.[0]?.message?.content?.trim();

  if (!summary) {
    throw new Error("Groq returned an empty summary. Please try again.");
  }

  return summary;
}

const tracedSummarizeWithGroq = traceable(summarizeWithGroq, {
  name: "content-summarise-vercel-api",
  tags: ["content-summarizer", "vercel", "groq"]
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests are allowed." });
  }

  try {
    const { content, summaryLength, summaryFormat } = req.body || {};

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ message: "Content is required." });
    }

    if (content.length > MAX_CHARACTERS) {
      return res.status(400).json({
        message: `Content is too long. Please keep it under ${MAX_CHARACTERS} characters.`
      });
    }

    if (!allowedLengths.includes(summaryLength)) {
      return res.status(400).json({ message: "Invalid summary length." });
    }

    if (!allowedFormats.includes(summaryFormat)) {
      return res.status(400).json({ message: "Invalid summary format." });
    }

    const summary = await tracedSummarizeWithGroq({ content, summaryLength, summaryFormat });
    return res.status(200).json({ summary });
  } catch (error) {
    console.error("Vercel summarize error:", error.message);

    return res.status(500).json({
      message: error.message || "The server could not create a summary."
    });
  }
}
