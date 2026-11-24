import { Program, withUzbek } from './types';
import { algebra } from './algebra';
import { satMath } from './sat-math';
import { ieltsWriting } from './ielts-writing';
import { dtmMath } from './dtm-math';
import { dtmMathUz } from './uz/dtm-math';
import { physicsMechanics } from './physics-mechanics';
import { chemistryBasics } from './chemistry-basics';
import { pythonBasics } from './python-basics';
import { biologyBasics } from './biology-basics';
import { informaticsBasics } from './informatics-basics';
import { historyUzbekistan } from './history-uzbekistan';
import { biologyBasicsUz } from './uz/biology-basics';
import { informaticsBasicsUz } from './uz/informatics-basics';
import { historyUzbekistanUz } from './uz/history-uzbekistan';
import { chemistryBasicsUz } from './uz/chemistry-basics';
import { pythonBasicsUz } from './uz/python-basics';
import { algebraUz } from './uz/algebra';
import { satMathUz } from './uz/sat-math';
import { ieltsWritingUz } from './uz/ielts-writing';
import { physicsMechanicsUz } from './uz/physics-mechanics';

export * from './types';

/** Add a new program here after writing its file; the screen picks it up automatically. */
export const PROGRAMS: Program[] = [
  withUzbek(algebra, algebraUz),
  withUzbek(physicsMechanics, physicsMechanicsUz),
  withUzbek(chemistryBasics, chemistryBasicsUz),
  withUzbek(biologyBasics, biologyBasicsUz),
  withUzbek(pythonBasics, pythonBasicsUz),
  withUzbek(informaticsBasics, informaticsBasicsUz),
  withUzbek(historyUzbekistan, historyUzbekistanUz),
  withUzbek(satMath, satMathUz),
  withUzbek(dtmMath, dtmMathUz),
  withUzbek(ieltsWriting, ieltsWritingUz),
];
