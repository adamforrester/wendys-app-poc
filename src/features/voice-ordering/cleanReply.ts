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
 * What we expand for TTS:
 *   - Address abbreviations like "N.W.", "NW", "St", "Blvd" → spoken form.
 *     ElevenLabs reads them letter-by-letter otherwise ("N. W." → "en
 *     double-you"). Done as a second pass; see expandSpokenAbbreviations.
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

  // Expand address abbreviations into their spoken form.
  cleaned = expandSpokenAbbreviations(cleaned);

  // Collapse any whitespace runs introduced by the substitutions.
  cleaned = cleaned.replace(/[ \t]+/g, ' ');

  return cleaned.trim();
}

/**
 * Replace address abbreviations with their spoken form. Conservative:
 * only matches when the abbreviation is bounded by whitespace, comma, or
 * line edges — so we don't mangle words like "Nw" inside a brand name or
 * "St" inside "States". Operates on display + spoken text together so
 * word-by-word TTS highlighting stays in sync.
 *
 * Order matters: longer/more-specific patterns run first. Two-letter
 * directionals (NW/NE/SW/SE) are matched both with and without periods,
 * but only when they sit between an address fragment and the rest of the
 * line (preceded by space or digit, followed by space or comma).
 */
export function expandSpokenAbbreviations(input: string): string {
  let s = input;

  // Two-letter compound directionals — match both spaced ("N.W.") and
  // tight ("NW", "Nw") forms. Case-insensitive because the data contains
  // mixed cases ("6420 Nw Barry Road"). Must be flanked by whitespace,
  // digit, or punctuation on both sides to avoid clobbering "NW" inside
  // a longer token.
  const compoundDirectionals: Array<[RegExp, string]> = [
    [/(^|[\s,(])N\.?\s?W\.?(?=[\s,)]|$)/gi, '$1Northwest'],
    [/(^|[\s,(])N\.?\s?E\.?(?=[\s,)]|$)/gi, '$1Northeast'],
    [/(^|[\s,(])S\.?\s?W\.?(?=[\s,)]|$)/gi, '$1Southwest'],
    [/(^|[\s,(])S\.?\s?E\.?(?=[\s,)]|$)/gi, '$1Southeast'],
  ];
  for (const [pat, sub] of compoundDirectionals) s = s.replace(pat, sub);

  // Single-letter cardinal directionals — only when they look like they
  // belong to an address (preceded by digit/space and followed by a
  // capitalized street name like "N Main", "123 W Broad"). The lookbehind
  // avoids names like "John N. Adams".
  const cardinalDirectionals: Array<[RegExp, string]> = [
    [/(\d+\s|\s)N\.?(?=\s[A-Z])/g, '$1North '],
    [/(\d+\s|\s)S\.?(?=\s[A-Z])/g, '$1South '],
    [/(\d+\s|\s)E\.?(?=\s[A-Z])/g, '$1East '],
    [/(\d+\s|\s)W\.?(?=\s[A-Z])/g, '$1West '],
  ];
  for (const [pat, sub] of cardinalDirectionals) s = s.replace(pat, sub);

  // Common street-suffix abbreviations. Matches end-of-line, comma, or
  // whitespace boundaries so we don't expand inside other words.
  const streetSuffixes: Array<[RegExp, string]> = [
    [/(\s)St\.?(?=[\s,)]|$)/g, '$1Street'],
    [/(\s)Ave\.?(?=[\s,)]|$)/g, '$1Avenue'],
    [/(\s)Blvd\.?(?=[\s,)]|$)/g, '$1Boulevard'],
    [/(\s)Rd\.?(?=[\s,)]|$)/g, '$1Road'],
    [/(\s)Dr\.?(?=[\s,)]|$)/g, '$1Drive'],
    [/(\s)Ln\.?(?=[\s,)]|$)/g, '$1Lane'],
    [/(\s)Ct\.?(?=[\s,)]|$)/g, '$1Court'],
    [/(\s)Pkwy\.?(?=[\s,)]|$)/g, '$1Parkway'],
    [/(\s)Hwy\.?(?=[\s,)]|$)/g, '$1Highway'],
    [/(\s)Pl\.?(?=[\s,)]|$)/g, '$1Place'],
  ];
  for (const [pat, sub] of streetSuffixes) s = s.replace(pat, sub);

  return s;
}
