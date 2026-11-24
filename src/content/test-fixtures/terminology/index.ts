import type { Course } from '../../types';
import intro from './01-intro';
import cardiovascular from './02-cardiovascular';
import radiology from './03-radiology';
import integumentary from './04-integumentary';
import vascular from './05-vascular';
import respiratory from './06-respiratory';

const course: Course = {
  id: 'terminology',
  title: 'שילוב מערכות א׳',
  subtitle: 'סמסטר א׳',
  icon: '🩺',
  hue: 250,
  semester: 1,
  lectures: [intro, cardiovascular, radiology, integumentary, vascular, respiratory],
};

export default course;
