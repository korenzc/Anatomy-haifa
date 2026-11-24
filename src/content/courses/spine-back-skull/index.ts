import type { Course } from '../../types';
import spine from './01-spine';
import skull from './02-skull';

const course: Course = {
  id: 'spine-back-skull',
  title: 'עמוד שדרה, גב וגולגולת',
  subtitle: 'חוליות, שרירי הגב והגולגולת',
  icon: '💀',
  hue: 150,
  lectures: [
    spine,
    skull,
  ],
};

export default course;
