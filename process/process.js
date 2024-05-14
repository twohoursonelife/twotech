if (!process.env.ONETECH_FOOD_BONUS) {
  process.env.ONETECH_FOOD_BONUS = 0;
}

const MainProcessor = require('./src/MainProcessor');

const processor = new MainProcessor(__dirname);

processor.doDownload = process.argv.includes('download')

processor.doSlim = process.argv.includes('slim');
processor.selectedObjects = processor.doSlim ? process.argv.slice(process.argv.indexOf('slim') + 1) : [];

processor.doSprites = processor.doDownload || processor.doSlim || process.argv.includes('sprites');
processor.doSounds = processor.doDownload || processor.doSlim || process.argv.includes('sounds');

console.log(`--- Processing ${processor.doSlim ? "slim " : ""}static-edge ---`);
console.time("Processing time")
const unprocessedVersion = processor.process(null);
console.timeEnd("Processing time")

if (unprocessedVersion) {
  processor.doDownload = false;
  console.log(`--- Processing ${processor.doSlim ? "slim " : ""}static for v${unprocessedVersion.id} ---`);
  processor.process(unprocessedVersion);
}
