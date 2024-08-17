

if (!process.env.ONETECH_FOOD_BONUS) {
  process.env.ONETECH_FOOD_BONUS = '0';
}

import { GitVersionData } from './src/GameData';
import {MainProcessor} from './src/MainProcessor';

const processor = new MainProcessor(__dirname);

processor.doDownload = process.argv.includes('download');
processor.doSprites = processor.doDownload || process.argv.includes('sprites');
processor.doSounds = processor.doDownload || process.argv.includes('sounds');
processor.doEdge = process.argv.includes('edge');
processor.doLastRelease = process.argv.includes('release');
// If neither edge or last release were selected by user, do default, which is to do both
if (!processor.doEdge && !processor.doLastRelease) {
  processor.doEdge = true;
  processor.doLastRelease = true;
}

let lastReleasedVersion: GitVersionData;
if (processor.doEdge) {
  console.log("--- Processing static-edge ---");
  lastReleasedVersion = processor.process(null);
  processor.doDownload = false;
} else {
  lastReleasedVersion = processor.lastReleasedVersion();
}
if (processor.doLastRelease) {
  console.log(`--- Processing static for v${lastReleasedVersion.id} ---`);
  processor.process(lastReleasedVersion);
}
