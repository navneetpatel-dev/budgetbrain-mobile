export type CoachReplyBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: Array<{ label?: string; value: string }> };

const META_LINES = [
  /^ask about income, spending/i,
  /^ai replies are richer when/i,
  /^\(ai replies are richer/i,
];

function isMetaLine(line: string): boolean {
  return META_LINES.some((re) => re.test(line.trim()));
}

function isHeading(line: string): boolean {
  const t = line.trim();
  if (!t || t.length > 48) return false;
  if (/^#{1,3}\s+/.test(t)) return true;
  if (/[:：]$/.test(t) && !t.includes('•')) return true;
  return /^(here's|here is|top categories|quick snapshot|this month)/i.test(t);
}

function parseListItem(raw: string): { label?: string; value: string } {
  const text = raw
    .replace(/^#{1,3}\s+/, '')
    .replace(/^[-*•]\s+/, '')
    .trim();
  const match = text.match(/^([^:]{1,32}):\s+(.+)$/);
  if (match) return { label: match[1].trim(), value: match[2].trim() };
  return { value: text };
}

function expandInlineBullets(line: string): string[] {
  if (!line.includes('•')) return [line];
  const parts = line.split(/\s*•\s+/).map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 1) return [line];
  return parts;
}

/**
 * Parse coach reply text into structured blocks for richer UI on web/mobile.
 */
export function parseCoachReply(content: string): CoachReplyBlock[] {
  const normalized = content.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  const roughLines = normalized
    .split('\n')
    .flatMap((line) => expandInlineBullets(line))
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !isMetaLine(l));

  const blocks: CoachReplyBlock[] = [];
  let listItems: Array<{ label?: string; value: string }> = [];

  const flushList = () => {
    if (listItems.length) {
      blocks.push({ type: 'list', items: listItems });
      listItems = [];
    }
  };

  for (const line of roughLines) {
    const bullet = /^[-*•]\s+/.test(line);
    const looksLikeStat =
      (/^(income|expenses?|net|spending)\b/i.test(line) && line.includes(':')) ||
      /^[^:]{1,32}:\s+([A-Z]{3}\s+)?[\d₹$€£,]/.test(line);

    if (bullet || looksLikeStat) {
      listItems.push(
        parseListItem(bullet ? line : `• ${line}`),
      );
      continue;
    }

    flushList();

    if (isHeading(line)) {
      blocks.push({ type: 'heading', text: line.replace(/^#{1,3}\s+/, '').replace(/[:：]$/, '') });
      continue;
    }

    blocks.push({ type: 'paragraph', text: line.replace(/\*\*(.+?)\*\*/g, '$1') });
  }

  flushList();
  return blocks;
}

export function renderInlineEmphasis(text: string): Array<{ text: string; bold?: boolean }> {
  const parts: Array<{ text: string; bold?: boolean }> = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index) });
    parts.push({ text: match[1], bold: true });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts.length ? parts : [{ text }];
}
