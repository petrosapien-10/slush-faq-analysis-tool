export function normalizeQuestion(question: string): string {
  return question
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s?]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
