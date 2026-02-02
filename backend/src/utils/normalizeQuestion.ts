export function normalizeQuestion(question: string): string {
  return question
    .trim()
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')  // Only keep letters and spaces
    .replace(/\s+/g, ' ')       // Collapse multiple spaces
    .trim();
}
