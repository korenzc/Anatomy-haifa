import type { Course } from '../types';

/**
 * A made-up course for automated tests (vitest and `vite --mode e2e`). Never shipped:
 * src/content/courses/index.ts only includes it in those modes. Plain literals only, so a
 * production build can drop all of it.
 */
const course: Course = {
  id: 'e2e-fixture',
  title: 'קורס בדיקה',
  subtitle: 'תוכן לבדיקות אוטומטיות בלבד',
  icon: '🧪',
  hue: 150,
  lectures: [
    {
      id: 'e2e-facts',
      title: 'הרצאת בדיקה',
      source: 'fixture',
      subtitle: 'שאלות ותשובות',
      icon: '🧫',
      hue: 150,
      facts: [
        { id: 'q1', q: 'שאלת בדיקה מספר אחת', a: 'תשובה אחת', slide: 2 },
        { id: 'q2', q: 'שאלת בדיקה מספר שתיים', a: 'תשובה שתיים', explain: 'הסבר לשאלה שתיים.', slide: 3 },
        { id: 'q3', q: 'שאלת בדיקה מספר שלוש', a: 'תשובה שלוש', slide: 4 },
        { id: 'q4', q: 'שאלת בדיקה מספר ארבע', a: 'תשובה ארבע', explain: 'הסבר לשאלה ארבע.', slide: 5 },
        { id: 'q5', q: 'שאלת בדיקה מספר חמש', a: 'תשובה חמש', slide: 6 },
        { id: 'q6', q: 'שאלת בדיקה מספר שש', a: 'תשובה שש', explain: 'הסבר לשאלה שש.', slide: 7 },
        { id: 'q7', q: 'שאלת בדיקה מספר שבע', a: 'תשובה שבע', slide: 8 },
        { id: 'q8', q: 'שאלת בדיקה מספר שמונה', a: 'תשובה שמונה', explain: 'הסבר לשאלה שמונה.', slide: 9 },
        { id: 'en', q: 'איך אומרים "בדיקה" באנגלית?', a: 'test', wrong: ['exam', 'trial', 'check'], slide: 12 },
      ],
    },
  ],
};

export default course;
