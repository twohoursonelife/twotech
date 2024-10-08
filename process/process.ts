

if (!process.env.ONETECH_FOOD_BONUS) {
  process.env.ONETECH_FOOD_BONUS = '0';
}

import { MainProcessor } from './src/MainProcessor';

const processor = new MainProcessor(__dirname);

processor.doDownload = process.argv.includes('download');
processor.doSprites = processor.doDownload || process.argv.includes('sprites');
processor.doSounds = processor.doDownload || process.argv.includes('sounds');

if (process.argv.includes('specific-objects')) {
  let objects_str = process.argv[process.argv.indexOf('specific-objects') + 1];
  if (!objects_str) {
    console.log("Please provide a comma-separated list of object IDs.")
    process.exit(1);
  }
  let objects = objects_str.split(',');
  if (objects.length === 0) {
    console.error("No valid object IDs found.");
    process.exit(1);
  }
  processor.processSpecificObjects(objects);
  process.exit(0);
}

console.log("--- Processing static-edge ---");
const unprocessedVersion = processor.process(null);

if (unprocessedVersion) {
  processor.doDownload = false;
  console.log(`--- Processing static for v${unprocessedVersion.id} ---`);
  processor.process(unprocessedVersion);
}
