import { Program, withUzbek } from './types';
import { algebra } from './algebra';
import { satMath } from './sat-math';
import { ieltsWriting } from './ielts-writing';
import { physicsMechanics } from './physics-mechanics';
import { algebraUz } from './uz/algebra';
import { satMathUz } from './uz/sat-math';
import { ieltsWritingUz } from './uz/ielts-writing';
import { physicsMechanicsUz } from './uz/physics-mechanics';

export * from './types';

/** Add a new program here after writing its file; the screen picks it up automatically. */
export const PROGRAMS: Program[] = [
  withUzbek(algebra, algebraUz),
  withUzbek(physicsMechanics, physicsMechanicsUz),
  withUzbek(satMath, satMathUz),
  withUzbek(ieltsWriting, ieltsWritingUz),
];
