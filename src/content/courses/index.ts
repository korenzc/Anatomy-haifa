/**
 * The anatomy courses (אנטומיה עיונית), in the order they appear in the app.
 * A course with no lectures yet is hidden until its first deck is added.
 * Adding a course: create src/content/courses/<id>/index.ts (a Course) and list it here.
 */
import type { Course } from '../types';
import fixture from './e2e-fixture';
import testTerminology from '../test-fixtures/terminology';
import intro from './intro';
import upperLimb from './upper-limb';
import spineBackSkull from './spine-back-skull';
import headFaceNeck from './head-face-neck';

// The fixture is a made-up course for automated tests only (vite --mode e2e, vitest);
// in a production build the condition is false and it is dropped from the bundle.
const mode = import.meta.env?.MODE;
export const courses: Course[] = [
  // the old terminology course from לדבר רפואית, kept only so the automated tests have real content
  ...(mode === 'test' ? [testTerminology] : []),
  intro,
  upperLimb,
  spineBackSkull,
  headFaceNeck,
  ...(mode === 'e2e' || mode === 'test' ? [fixture] : []),
];
