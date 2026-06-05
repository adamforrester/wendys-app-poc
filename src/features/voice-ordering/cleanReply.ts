/**
 * Strip markdown formatting from an assistant reply so it reads naturally
 * via TTS and displays without stray punctuation in the UI.
 *
 * The system prompt asks the model to return plain prose, but Claude still
 * occasionally emits `**bold**`, `*italic*`, `__under__`, or backtick code
 * spans — and ElevenLabs reads each marker character aloud ("asterisk
 * asterisk Tenders asterisk asterisk"). Stripping at the message-write
 * boundary keeps display text and spoken text identical, so word-level
 * highlighting stays aligned with audio.
 *
 * What we strip:
 *   - **bold**, __bold__, *italic*, _italic_  → contents
 *   - `code`                                  → contents
 *   - [link text](url)                        → 'link text'
 *
 * What we leave alone:
 *   - dashes, em-dashes, ellipses, smart quotes — these are intentional
 *     and TTS handles them fine
 */
export function cleanReplyForDisplay(text: string): string {
  if (!text) return text;
  let cleaned = text;

  // Markdown links: [label](url) → label.
  cleaned = cleaned.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');

  // Bold/italic with **, __, *, _. Greedy enough to handle nested ranges
  // by running the doubled markers first.
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  cleaned = cleaned.replace(/__([^_]+)__/g, '$1');
  cleaned = cleaned.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1$2');
  cleaned = cleaned.replace(/(^|[^_])_([^_\n]+)_(?!_)/g, '$1$2');

  // Inline code spans.
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');

  // Collapse any whitespace runs introduced by the substitutions.
  cleaned = cleaned.replace(/[ \t]+/g, ' ');

  return cleaned.trim();
}
