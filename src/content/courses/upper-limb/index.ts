import type { Course } from '../../types';
import bonesShoulderArm from './01-bones-shoulder-arm';
import bonesForearmHand from './02-bones-forearm-hand';
import jointsShoulderElbow from './03-joints-shoulder-elbow';
import jointsForearmHand from './04-joints-forearm-hand';
import musclesShoulderArm from './05-muscles-shoulder-arm';
import musclesForearm from './06-muscles-forearm';
import musclesHand from './07-muscles-hand';
import brachialPlexus from './08-brachial-plexus';
import nervesArmForearm from './09-nerves-arm-forearm';
import nervesWristHand from './10-nerves-wrist-hand';
import vessels from './11-vessels';

const course: Course = {
  id: 'upper-limb',
  title: 'גפה עליונה',
  subtitle: 'זרוע, אמה וכף יד',
  icon: '💪',
  hue: 20,
  lectures: [
    bonesShoulderArm,
    bonesForearmHand,
    jointsShoulderElbow,
    jointsForearmHand,
    musclesShoulderArm,
    musclesForearm,
    musclesHand,
    brachialPlexus,
    nervesArmForearm,
    nervesWristHand,
    vessels,
  ],
};

export default course;
