import type { Course } from '../../types';
import eyeOrbit from './01-eye-orbit';

const course: Course = {
  id: 'head-face-neck',
  title: 'ראש, פנים וצוואר',
  subtitle: 'שרירים, עצבים וכלי דם',
  icon: '🧠',
  hue: 300,
  lectures: [
    eyeOrbit,
  ],
};

export default course;
