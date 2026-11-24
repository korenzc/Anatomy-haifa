import type { WordPart, Term } from './types';
import * as testLex from './test-fixtures/lexicon';

// automated tests run on the old terminology lexicon (test-fixtures/); a production build drops it
const testing = import.meta.env?.MODE === 'test';

/**
 * The anatomy lexicon: every word part and term that appears in the course slides.
 * Lectures list which words and parts they cover (src/content/courses/…); a word or part
 * belongs here only if a lecture uses it. `npm run validate` checks that every term's parts
 * exist and join to the word exactly.
 *
 * Conventions:
 *  - Roots are listed with their combining form: ['cardi', 'cardio'].
 *  - Use the bare root before a suffix that starts with a vowel (cardi + algia), the -o form
 *    before a consonant (cardio + logy) and between two roots (gastro + enter + itis).
 *  - Suffixes are written without a combining vowel: -tomy, -stomy, -rrhea, -logy.
 *  - If two parts share a spelling, write 'form#key' in a term's parts, e.g. ['febr', 'ile#ile_adj'].
 */
export const parts: Record<string, WordPart> = {
  ...(testing ? testLex.parts : {}),
};

export const terms: Term[] = [
  ...(testing ? testLex.terms : []),
];
