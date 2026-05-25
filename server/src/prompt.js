export function buildPrompt({ content, summaryLength, summaryFormat }) {
  const lengthInstructions = {
    short: "Create a concise summary with only the most important points.",
    medium: "Create a medium detailed summary that keeps the key context.",
    large: "Create a detailed summary that covers the main ideas and useful details."
  };

  const formatInstructions = {
    paragraph: "Write the summary as a clean paragraph.",
    "bullet-points": "Write the summary as bullet points.",
    "five-lines": "Write exactly 5 summarized lines. Each line must be useful and distinct."
  };

  return `
You are a helpful AI writing assistant.

Task:
${lengthInstructions[summaryLength]}
${formatInstructions[summaryFormat]}

Rules:
- Keep the meaning accurate.
- Do not add facts that are not in the original content.
- Use simple, clear language.
- If the format is exactly 5 lines, return exactly 5 lines and no extra heading.

Content to summarize:
${content}
`;
}
