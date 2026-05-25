# AI Content Summarizer

A beginner-friendly full-stack web app that summarizes pasted content with AI.

## Tech Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express for local development
- Vercel API Route: `/api/summarize` for one-URL deployment
- AI: Groq, OpenAI, or Gemini API
- Database: None

## Folder Structure

```text
ai-content-summarizer/
  api/
  client/
  server/
  vercel.json
  .env.example
  README.md
  package.json
  .gitignore
```

## 1. Install Node.js

Install Node.js LTS from <https://nodejs.org/>.

Check it is installed:

```bash
node -v
npm -v
```

## 2. Install Dependencies

From the project root:

```bash
npm install
npm run install:all
```

## 3. Add Environment Variables

Copy the backend example file:

```bash
cd server
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Then add one API key to `server/.env`.

For OpenAI:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key_here
```

For Gemini:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
```

For Groq, use this:

```env
AI_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
```

## 4. Run the App

From the project root:

```bash
npm run dev
```

Open only this one local website URL:

```text
http://localhost:5173
```

The app will call the API through the same visible URL:

```text
http://localhost:5173/api/summarize
```

You do not need to open a separate backend link.

For a production-style local preview after building:

```bash
npm run build
npm start
```

Then open:

```text
http://localhost:5000
```

## Useful Scripts

Root scripts:

```bash
npm run install:all
npm run dev
npm run build
npm start
```

Client scripts:

```bash
cd client
npm run dev
npm run build
```

Server scripts:

```bash
cd server
npm run dev
npm start
```

## Deploy the Full App on Vercel as One URL

This project includes `vercel.json` and an API route at `api/summarize.js`, so Vercel can host the frontend and backend under one URL.

Example final URL:

```text
https://your-project-name.vercel.app
```

Steps:

1. Push this project to GitHub.
2. Go to <https://vercel.com/>.
3. Click `Add New` then `Project`.
4. Import your GitHub repository.
5. Keep the root directory as the project root. Do not choose only `client`.
6. Add these Environment Variables in Vercel:

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
```

7. Deploy.

After deployment, the React app and API will both work from the same Vercel URL.

## Optional Separate Backend Deployment

You can still deploy the Express backend separately on Render or Railway if you want.

Use the `server` folder as the backend root.

Build command:

```bash
npm install
```

Start command:

```bash
npm start
```

Add environment variables for Groq:

```env
PORT=5000
CLIENT_URL=https://your-vercel-app.vercel.app
AI_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
```

For multiple frontend URLs, separate them with commas:

```env
CLIENT_URL=http://localhost:5173,https://your-vercel-app.vercel.app
```

## Notes for Beginners

- The frontend sends pasted text, summary length, and summary format to the backend.
- The backend validates the request before calling AI.
- Extremely large input is rejected safely.
- API keys stay on the backend or Vercel Environment Variables only. Never put API keys in React code.
- If no API key is configured, the backend returns a clear error instead of crashing.

## LangSmith Tracing

This app wraps the summarizer function with the LangSmith JavaScript SDK, so successful summarize requests can appear in your LangSmith project when tracing is enabled.

Add these values locally in `server/.env` and in Vercel Environment Variables:

```env
LANGSMITH_TRACING=true
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_API_KEY=your_langsmith_api_key_here
LANGSMITH_PROJECT=content-summarise
GOOGLE_API_KEY=your_google_api_key_here
```

Keep real API keys out of GitHub. The local `server/.env` file is ignored by `.gitignore`.
