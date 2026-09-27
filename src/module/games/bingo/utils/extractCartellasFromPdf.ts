import * as pdfjs from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { IBingoCard } from '../model/IBingoCard';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const CARD_BOUNDARY_REGEX = /\bCARD\b[^0-9]{0,10}\d+/gi;
const LABELLED_NUMBER_PATTERNS = [
  /\b\w+\s*:\s*\d+\b/g,
  /\b\w+\s*[.#]\s*\d+\b/g,
];

function parsePageCards(pageText: string): IBingoCard[] {
  const sections = pageText
    .split(CARD_BOUNDARY_REGEX)
    .map((section) => section.trim())
    .filter(Boolean);
  const cards: IBingoCard[] = [];

  for (const section of sections.length > 0 ? sections : [pageText]) {
    const cleanedText = LABELLED_NUMBER_PATTERNS.reduce(
      (text, pattern) => text.replace(pattern, ' '),
      section,
    );
    const tokens = cleanedText.match(/\b\d+\b|\bFREE\b/gi) ?? [];
    const card: IBingoCard = { B: [], I: [], N: [], G: [], O: [] };
    for (const token of tokens) {
      if (token.toUpperCase() === 'FREE') {
        card.N.push('FREE');
        continue;
      }
      const value = Number(token);
      if (value >= 1 && value <= 15) card.B.push(value);
      else if (value >= 16 && value <= 30) card.I.push(value);
      else if (value >= 31 && value <= 45) card.N.push(value);
      else if (value >= 46 && value <= 60) card.G.push(value);
      else if (value >= 61 && value <= 75) card.O.push(value);
    }

    if (card.N.length === 4 && !card.N.includes('FREE')) {
      card.N.splice(2, 0, 'FREE');
    }
    if ((['B', 'I', 'N', 'G', 'O'] as const).every((column) => card[column].length === 5)) {
      cards.push(card);
    }
  }
  return cards;
}

/** Follows the admin OnlineCartellaPage parser: text extraction, CARD NO. sections, then BINGO columns. */
export async function extractCartellasFromPdf(file: File): Promise<IBingoCard[]> {
  if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
    throw new Error('Choose a PDF file to upload.');
  }

  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const cards: IBingoCard[] = [];
  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const pageText = content.items
        .filter((item): item is typeof item & { str: string } => 'str' in item)
        .map((item) => item.str)
        .join(' ');
      cards.push(...parsePageCards(pageText));
    }
  } finally {
    await pdf.destroy();
  }
  if (cards.length === 0) throw new Error('No cartellas were found in this PDF.');
  return cards;
}
