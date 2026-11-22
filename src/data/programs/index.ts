import { Program } from './types';
import { algebra } from './algebra';
import { satMath } from './sat-math';
import { ieltsWriting } from './ielts-writing';
import { physicsMechanics } from './physics-mechanics';

export * from './types';

/** Add a new program here after writing its file; the screen picks it up automatically. */
export const PROGRAMS: Program[] = [algebra, physicsMechanics, satMath, ieltsWriting];
