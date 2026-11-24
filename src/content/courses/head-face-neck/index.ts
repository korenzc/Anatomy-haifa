import type { Course } from '../../types';
import eyeOrbit from './01-eye-orbit';
import faceInnervation from './02-face-innervation';
import facialNerve from './07-facial-nerve';
import infratemporalFossa from './03-infratemporal-fossa';
import pterygopalatineFossa from './04-pterygopalatine-fossa';
import oralCavity from './05-oral-cavity';
import tongue from './06-tongue';

const course: Course = {
  id: 'head-face-neck',
  title: 'ראש, פנים וצוואר',
  subtitle: 'העין, עצבוב הפנים, הפה והלשון',
  icon: '🧠',
  hue: 300,
  lectures: [
    eyeOrbit,
    faceInnervation,
    facialNerve,
    infratemporalFossa,
    pterygopalatineFossa,
    oralCavity,
    tongue,
  ],
};

export default course;
