import { useMemo, useState } from "react";
import doodleNotes from "./assets/doodle-notes.svg";
import doodleSpark from "./assets/doodle-spark.svg";

const API_URL = import.meta.env.VITE_API_URL || "";
const SUMMARIZE_ENDPOINT = `${API_URL}/api/summarize`;
const MAX_CHARACTERS = 12000;

function App() {
  const [content, setContent] = useState("");
  const [summaryLength, setSummaryLength] = useState("medium");
  const [summaryFormat, setSummaryFormat] = useState("paragraph");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [toast, setToast] = useState("");

  const wordCount = useMemo(() => {
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  }, [content]);

  const characterCount = content.length;
  const isOverLimit = characterCount > MAX_CHARACTERS;

  async function handleSummarize() {
    setError("");
    setSummary("");

    if (!content.trim()) {
      setError("Please paste some content before summarizing.");
      return;
    }

    if (isOverLimit) {
      setError(`Please keep your input under ${MAX_CHARACTERS.toLocaleString()} characters.`);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(SUMMARIZE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content,
          summaryLength,
          summaryFormat
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong. Please try again.");
      }

      setSummary(data.summary);
    } catch (err) {
      setError(err.message || "Unable to connect to the summarizer server.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopy() {
    if (!summary) return;

    await navigator.clipboard.writeText(summary);
    setToast("Summary copied to clipboard.");
    setTimeout(() => setToast(""), 2200);
  }

  function handleClear() {
    setContent("");
    setSummary("");
    setError("");
    setToast("");
    setSummaryLength("medium");
    setSummaryFormat("paragraph");
  }

  return (
    <main className={isDarkMode ? "dark" : ""}>
      <div className="min-h-screen overflow-hidden bg-gradient-to-br from-pink-100 via-rose-100 to-fuchsia-200 text-slate-950 transition-colors duration-300 dark:from-pink-950 dark:via-slate-950 dark:to-fuchsia-950 dark:text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.32),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.28),transparent_34%)]" />
        <div className="absolute left-6 top-24 hidden rotate-[-10deg] rounded-[2rem] border-4 border-pink-800/20 bg-white/35 p-2 shadow-glow backdrop-blur-md lg:block">
          <img alt="pink sparkle doodle" className="h-36 w-44 object-contain" src={doodleSpark} />
        </div>
        <div className="absolute bottom-8 right-8 hidden rotate-[8deg] rounded-[2rem] border-4 border-pink-800/20 bg-white/35 p-2 shadow-glow backdrop-blur-md xl:block">
          <img alt="summary notes doodle" className="h-40 w-48 object-contain" src={doodleNotes} />
        </div>

        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between rounded-[1.5rem] border-4 border-pink-900/15 bg-white/55 px-4 py-3 shadow-glow backdrop-blur-xl dark:border-pink-200/20 dark:bg-white/10">
            <div>
              <p className="font-display text-2xl font-black tracking-tight text-pink-700 dark:text-pink-200">AI Content Summarizer</p>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-pink-600 dark:text-pink-200">Paste. Choose. Summarize.</p>
            </div>

            <button
              className="rounded-full border-4 border-pink-300 bg-white/80 px-5 py-2 font-display text-sm font-black text-pink-700 shadow-lg shadow-pink-300/30 transition hover:-translate-y-0.5 hover:bg-pink-50 dark:border-pink-300/30 dark:bg-white/10 dark:text-pink-100 dark:hover:bg-white/20"
              onClick={() => setIsDarkMode((value) => !value)}
              type="button"
            >
              {isDarkMode ? "Light" : "Dark"}
            </button>
          </nav>

          <section className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="max-w-xl">
              <img alt="cute notes doodle" className="mb-4 h-28 w-36 rotate-[-7deg] object-contain lg:hidden" src={doodleNotes} />
              <p className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-pink-700 dark:text-pink-200">
                Pretty pink AI tool
              </p>
              <h1 className="font-display text-5xl font-black leading-[0.95] tracking-tight text-pink-900 drop-shadow-sm dark:text-pink-100 sm:text-6xl lg:text-7xl">
                Turn long content into clear summaries.
              </h1>
              <p className="mt-5 text-base font-bold leading-7 text-pink-950/75 dark:text-pink-100/80 sm:text-lg">
                Choose the length and format you need, then let AI create a clean summary you can copy in one click.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {["Fast", "Simple", "Copy-ready"].map((item) => (
                  <span
                    className="rounded-full border-4 border-pink-300 bg-white/70 px-4 py-2 font-display text-sm font-black text-pink-700 shadow-lg shadow-pink-200/30"
                    key={item}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border-4 border-pink-900/15 bg-white/60 p-4 shadow-glow backdrop-blur-2xl dark:border-pink-100/15 dark:bg-white/10 sm:p-6">
              <div className="grid gap-4">
                <label className="grid gap-2">
                  <span className="font-display text-lg font-black text-pink-800 dark:text-pink-100">Your content</span>
                  <textarea
                    className="min-h-64 resize-y rounded-[1.5rem] border-4 border-pink-400 bg-white/90 p-4 text-sm font-bold leading-6 text-slate-900 outline outline-4 outline-pink-200/70 transition placeholder:text-pink-900/35 focus:border-pink-700 focus:outline-pink-300 focus:ring-4 focus:ring-pink-200 dark:border-pink-300/50 dark:bg-slate-950/60 dark:text-white dark:outline-pink-400/20 dark:focus:ring-pink-400/20"
                    maxLength={MAX_CHARACTERS + 1}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="Paste an article, notes, report, email, or any long content here..."
                    value={content}
                  />
                </label>

                <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span className="rounded-full bg-pink-100 px-3 py-1 font-black text-pink-700 dark:bg-pink-500/20 dark:text-pink-100">{wordCount.toLocaleString()} words</span>
                  <span className={isOverLimit ? "text-red-600 dark:text-red-300" : ""}>
                    {characterCount.toLocaleString()} / {MAX_CHARACTERS.toLocaleString()} characters
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="font-display text-base font-black text-pink-800 dark:text-pink-100">Summary length</span>
                    <select
                      className="rounded-2xl border-4 border-pink-300 bg-white/90 px-4 py-3 text-sm font-black text-pink-900 outline-none focus:border-pink-600 dark:border-pink-300/30 dark:bg-slate-950/55 dark:text-white"
                      onChange={(event) => setSummaryLength(event.target.value)}
                      value={summaryLength}
                    >
                      <option value="short">Short</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </label>

                  <label className="grid gap-2">
                    <span className="font-display text-base font-black text-pink-800 dark:text-pink-100">Summary format</span>
                    <select
                      className="rounded-2xl border-4 border-pink-300 bg-white/90 px-4 py-3 text-sm font-black text-pink-900 outline-none focus:border-pink-600 dark:border-pink-300/30 dark:bg-slate-950/55 dark:text-white"
                      onChange={(event) => setSummaryFormat(event.target.value)}
                      value={summaryFormat}
                    >
                      <option value="paragraph">Paragraph</option>
                      <option value="bullet-points">Bullet Points</option>
                      <option value="five-lines">5 Lines</option>
                    </select>
                  </label>
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-400/30 dark:bg-red-950/40 dark:text-red-200">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    className="flex flex-1 items-center justify-center gap-3 rounded-2xl border-4 border-pink-950/10 bg-gradient-to-r from-pink-600 via-rose-500 to-fuchsia-600 px-5 py-3 font-display text-lg font-black text-white shadow-lg shadow-pink-500/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={isLoading}
                    onClick={handleSummarize}
                    type="button"
                  >
                    {isLoading && <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                    {isLoading ? "Summarizing..." : "Summarize"}
                  </button>

                  <button
                    className="rounded-2xl border-4 border-pink-300 bg-white/75 px-5 py-3 font-display font-black text-pink-700 transition hover:-translate-y-0.5 hover:bg-pink-50 dark:border-pink-300/30 dark:bg-white/10 dark:text-pink-100 dark:hover:bg-white/20"
                    onClick={handleClear}
                    type="button"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="mt-5 rounded-[1.5rem] border-4 border-pink-200 bg-white/80 p-4 dark:border-pink-100/15 dark:bg-slate-950/45">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="font-display text-2xl font-black text-pink-800 dark:text-pink-100">Summary</h2>
                  <button
                    className="rounded-full border-4 border-pink-300 px-4 py-2 text-xs font-black text-pink-700 transition hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-pink-300/30 dark:text-pink-100 dark:hover:bg-white/10"
                    disabled={!summary}
                    onClick={handleCopy}
                    type="button"
                  >
                    Copy
                  </button>
                </div>

                <div className="min-h-36 whitespace-pre-wrap rounded-[1rem] border-2 border-dashed border-pink-300 bg-pink-50/80 p-4 text-sm font-bold leading-7 text-pink-950 dark:border-pink-200/20 dark:bg-black/20 dark:text-slate-100">
                  {summary || "Your AI summary will appear here."}
                </div>
              </div>
            </div>
          </section>
        </div>

        {toast && (
          <div className="fixed bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-xl dark:bg-white dark:text-slate-950">
            {toast}
          </div>
        )}
      </div>
    </main>
  );
}

export default App;
