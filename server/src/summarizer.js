import { GoogleGenerativeAI } from "@google/generative-ai";
import { traceable } from "langsmith/traceable";
import OpenAI from "openai";
import { buildPrompt } from "./prompt.js";

async function summarizeWithOpenAI(prompt) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is missing. Add OPENAI_API_KEY to server/.env.");
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
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
  });

  return response.choices[0]?.message?.content?.trim();
}

async function summarizeWithGemini(prompt) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is missing. Add GEMINI_API_KEY to server/.env.");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash"
  });

  const response = await model.generateContent(prompt);
  return response.response.text().trim();
}

async function summarizeWithGroq(prompt) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Groq API key is missing. Add GROQ_API_KEY to server/.env.");
  }

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

  return data.choices?.[0]?.message?.content?.trim();
}

const summarizeContent = traceable(async function summarizeContent(options) {
  const prompt = buildPrompt(options);
  const provider = (process.env.AI_PROVIDER || "groq").toLowerCase();
  let summary;

  if (provider === "groq") {
    summary = await summarizeWithGroq(prompt);
  } else if (provider === "gemini") {
    summary = await summarizeWithGemini(prompt);
  } else if (provider === "openai") {
    summary = await summarizeWithOpenAI(prompt);
  } else {
    throw new Error("Invalid AI_PROVIDER. Use groq, openai, or gemini.");
  }

  if (!summary) {
    throw new Error("The AI provider returned an empty summary. Please try again.");
  }

  return summary;
}, {
  name: "content-summarise-backend",
  tags: ["content-summarizer", "express"]
});

export default summarizeContent;
