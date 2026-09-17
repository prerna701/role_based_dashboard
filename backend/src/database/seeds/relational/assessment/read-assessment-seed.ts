import fs from 'fs';
import path from 'path';
import { AssessmentSeed } from './assessment-seed.types';

export function readAssessmentSeed(): AssessmentSeed {
  const candidates = [
    path.join(__dirname, 'data.json'),
    path.join(
      process.cwd(),
      'src',
      'database',
      'seeds',
      'relational',
      'assessment',
      'data.json',
    ),
  ];

  const seedPath = candidates.find((candidate) => fs.existsSync(candidate));

  if (!seedPath) {
    throw new Error(`Assessment seed data not found: ${candidates.join(', ')}`);
  }

  return JSON.parse(fs.readFileSync(seedPath, 'utf8')) as AssessmentSeed;
}
