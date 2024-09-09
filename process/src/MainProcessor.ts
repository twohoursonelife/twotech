"use strict";

import { ChangeLogVersion } from "./ChangeLogVersion";
import { GameData } from "./GameData";

class MainProcessor {
  processDir: string;
  doDownload: boolean;
  doSprites: boolean;
  doSounds: boolean;
  constructor(processDir: string) {
    this.processDir = processDir;
  }

  staticDir(edge: boolean): string {
    if (edge && !process.env.ONETECH_MOD_NAME) {
      return this.processDir + "/../public/static-edge";
    }
    return this.processDir + "/../public/static";
  }

  dataDir(): string {
    return process.env.ONETECH_PROCESS_GIT_PATH || (this.processDir + "/OneLifeData7");
  }

  gitUrl(): string {
    return process.env.ONETECH_PROCESS_GIT_URL || "https://github.com/twohoursonelife/OneLifeData7.git";
  }

  processSpecificObjects(ids: string[]): void {
    const gameData = new GameData(this.processDir, this.dataDir(), this.staticDir(false));
    console.time("Processing specific objects took");

    console.log("\nImporting specific objects...");
    console.time("Importing specific objects took");
    gameData.importSpecificObjects(ids);
    console.timeEnd("Importing specific objects took");

    console.log("\nConverting specific sprite images...");
    console.time("Converting specific sprite images took");
    gameData.convertSpecificSpriteImages();
    console.timeEnd("Converting specific sprite images took");

    console.log("\nProcessing specific sprites...");
    console.time("Processing specific sprites took");
    gameData.processSpecificSprites();
    console.timeEnd("Processing specific sprites took");

    console.timeEnd("Processing specific objects took");
  }

  process(version: ChangeLogVersion | null): ChangeLogVersion {
    // double-equals used to cover undefined case too.
    const gameData = new GameData(this.processDir, this.dataDir(), this.staticDir(version == null));
    console.time("Processing took");

    if (this.doDownload) {
      console.log("\nDownloading data...");
      console.time("Downloading data took");
      gameData.download(this.gitUrl());
      console.timeEnd("Downloading data took");
    } else {
      gameData.verifyDownloaded();
    }

    if (version) {
      console.log(`Checking out v${version.id}...`);
      console.time(`Checking out v${version.id} took`);
      gameData.checkoutVersion(version);
      console.timeEnd(`Checking out v${version.id} took`);
    } else {
      gameData.checkoutMaster();
    }

    console.log("\nPreparing directories...");
    console.time("Preparing directories took");
    gameData.prepareStaticDir();
    console.timeEnd("Preparing directories took");

    console.log("\nImporting objects...");
    console.time("Importing objects took");
    gameData.importObjects();
    console.timeEnd("Importing objects took");

    console.log("\nImporting categories...");
    console.time("Importing categories took");
    gameData.importCategories();
    console.timeEnd("Importing categories took");

    console.log("\nImporting transitions...");
    console.time("Importing transitions took");
    gameData.importTransitions();
    console.timeEnd("Importing transitions took");

    console.log("\nImporting biomes...");
    console.time("Importing biomes took");
    gameData.importBiomes();
    console.timeEnd("Importing biomes took");

    console.log("\nPopulating versions...");
    console.time("Populating versions took");
    gameData.populateVersions();
    console.timeEnd("Populating versions took");

    console.log("\nCalculating object depth...");
    console.time("Calculating object depth took");
    gameData.calculateObjectDepth();
    console.timeEnd("Calculating object depth took");

    if (this.doSprites) {
      console.log("\nConverting sprite images...");
      console.time("Converting sprite images took");
      gameData.convertSpriteImages();
      console.timeEnd("Converting sprite images took");

      console.log("\nConverting ground images...");
      console.time("Converting ground images took");
      gameData.convertGroundImages();
      console.timeEnd("Converting ground images took");

      console.log("\nProcessing sprites...");
      console.time("Processing sprites took");
      gameData.processSprites();
      console.timeEnd("Processing sprites took");
    }

    if (this.doSounds) {
      console.log("\nConverting sound files...");
      console.time("Converting sound files took");
      gameData.convertSounds();
      console.timeEnd("Converting sound files took");
    }

    console.log("\nExporting objects...");
    console.time("Exporting objects took");
    gameData.exportObjects();
    console.timeEnd("Exporting objects took");

    // console.log("\nExporting versions...");
    // gameData.exportVersions();

    console.log("\nExporting biomes...");
    console.time("Exporting biomes took");
    gameData.exportBiomes();
    console.timeEnd("Exporting biomes took");

    if (version) {
      console.log("\nGenerating sitemap...");
      console.time("Generating sitemap took");
      gameData.generateSitemap();
      console.timeEnd("Generating sitemap took");
      return null;
    }

    console.timeEnd("Processing took");

    if (process.env.ONETECH_MOD_NAME) {
      return null;
    }

    return gameData.unprocessedVersion(this.staticDir(false), !this.doDownload);
  }
}

export { MainProcessor }
