"use strict";

import * as Canvas from 'canvas';
import { GameObject } from './GameObject';
import { Sprite } from './Sprite';
const fs = require('fs');

interface SpriteBounds {
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
}

interface SpritePoint {
  x: number,
  y: number,
}

class SpriteProcessor {
  spritesDir: string;
  pngDir: string;
  canvas: Canvas.Canvas;
  context: Canvas.CanvasRenderingContext2D;

  constructor(spritesDir: string, pngDir: string) {
    this.spritesDir = spritesDir;
    this.pngDir = pngDir;
    this.canvas = Canvas.createCanvas(512, 1024);
    this.context = this.canvas.getContext('2d');
  }

  process(objects: Record<string, GameObject>): void {
    for (let id in objects) {
      this.processObject(objects[id]);
    }
  }

  processObject(object: GameObject): void {
    this.renderSprites(this.visibleSprites(object), object.id);

    // Draw only the last sprite
    if (object.data.numUses > 1) {
      this.renderSprites(this.lastSprites(object), object.id + "_last");
    }
  }

  visibleSprites(object: GameObject): Sprite[] {
    // Draw sprites as if they were 20 years old
    let sprites = object.sprites.filter(sprite => !sprite.beyondAge(20));

    // Remove multiple use sprites
    if (object.data.useVanishIndex == -1 && object.data.numUses > 1) {
      sprites = sprites.filter((_s,i) => !object.data.useAppearIndex.includes(i));
    }

    // Remove clothing sprites that aren't worn
    if (object.isClothing()) {
      sprites = sprites.filter(sprite => sprite.invisWorn != 1)
    }

    return sprites;
  }

  lastSprites(object: GameObject): Sprite[] {
    if (object.data.useVanishIndex != -1 && Array.isArray(object.data.useVanishIndex)) {
      const hideIndexes = object.data.useVanishIndex.slice(0);
      hideIndexes.shift(); // still draw the first sprite
      return this.visibleSprites(object).filter((s,i) => !hideIndexes.includes(i));
    }
    if (object.data.useAppearIndex != -1 && Array.isArray(object.data.useAppearIndex)) {
      const indexes = object.data.useAppearIndex.filter((_, i) => i+1 < object.data.numUses);
      const useSprites = object.sprites.filter((s,i) => indexes.includes(i));
      const sprites = this.visibleSprites(object);
      // Insert the use sprites after the last index
      // add 2 to work around goose pond rendering
      sprites.splice(indexes.pop() - useSprites.length + 2, 0, ...useSprites);
      return sprites;
    }
    return object.sprites;
  }

  renderSprites(sprites: Sprite[], name: string): void {
    this.context.setTransform(new Canvas.DOMMatrix([1, 0, 0, 1, 0, 0]));
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (var sprite of sprites) {
      this.parseSpriteFile(sprite);
      this.drawSprite(sprite);
    }

    const bounds = this.spritesBounds(sprites);
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;

    const newCanvas = Canvas.createCanvas(width, height);
    const newContext = newCanvas.getContext('2d');

    newContext.setTransform(new Canvas.DOMMatrix([1, 0, 0, 1, 0, 0]));

    newContext.drawImage(
      this.canvas,
      bounds.minX + this.canvas.width / 2,
      -bounds.maxY + this.canvas.height / 2,
      width,
      height,
      (newCanvas.width - width) / 2,
      (newCanvas.height - height) / 2,
      width,
      height
    );

    fs.writeFileSync(`${this.pngDir}/obj_${name}.png`, newCanvas.toBuffer());
  }

  parseSpriteFile(sprite: Sprite): void {
    const path = `${this.spritesDir}/${sprite.id}.txt`
    const data = fs.readFileSync(path, "utf8").split(' ');
    sprite.parseExtraData(data);
  }

  drawSprite(sprite: Sprite): void {
    if (sprite.additiveBlend()) {
      this.drawSpriteWithOperation(sprite, "screen");
    } else {
      this.drawSpriteDirectly(sprite, this.context);
    }
  }

  drawSpriteWithOperation(sprite: Sprite, operation: Canvas.GlobalCompositeOperation): void {
    const newCanvas = Canvas.createCanvas(this.canvas.width, this.canvas.height);
    const newContext = newCanvas.getContext('2d');

    this.drawSpriteDirectly(sprite, newContext);
    this.overlayCanvas(newCanvas, this.context, operation);
  }

  drawSpriteDirectly(sprite: Sprite, context: Canvas.CanvasRenderingContext2D): void {
    this.drawSpriteImage(sprite, context);

    if (sprite.color.find(c => c < 1.0) !== undefined) {
      this.overlayColor(sprite, context)
    }
  }

  drawSpriteImage(sprite: Sprite, context: Canvas.CanvasRenderingContext2D): void {
    const img = new Canvas.Image;
    img.src = fs.readFileSync(`${this.pngDir}/sprite_${sprite.id}.png`);
    sprite.width = img.width;
    sprite.height = img.height;

    const angleRads = sprite.rotation * Math.PI * 2;
    const x = sprite.x;
    const y = sprite.y;

    context.setTransform(new Canvas.DOMMatrix([1, 0, 0, 1, 0, 0]));
    context.translate(x + context.canvas.width / 2, -y + context.canvas.height / 2);
    context.rotate(angleRads);
    if (sprite.hFlip == 1) context.scale(-1, 1);

    context.drawImage(
      img,
      -img.width / 2 - sprite.centerAnchorXOffset,
      -img.height / 2 - sprite.centerAnchorYOffset,
      img.width,
      img.height
    );
  }

  overlayColor(sprite: Sprite, targetContext: Canvas.CanvasRenderingContext2D): void {
    const newCanvas = Canvas.createCanvas(this.canvas.width, this.canvas.height);
    const newContext = newCanvas.getContext('2d');

    this.drawSpriteImage(sprite, newContext)

    const color = sprite.color.map(c => Math.round(c*255)).join(", ");

    newContext.globalCompositeOperation = "source-in";
    newContext.setTransform(new Canvas.DOMMatrix([1, 0, 0, 1, 0, 0]));
    newContext.fillStyle = "rgb(" + color + ")";
    newContext.fillRect(0, 0, newCanvas.width, newCanvas.height);

    this.overlayCanvas(newCanvas, targetContext, "multiply")
  }

  overlayCanvas(sourceCanvas: Canvas.Canvas, targetContext: Canvas.CanvasRenderingContext2D, operation: Canvas.GlobalCompositeOperation): void {
    const previousOperation = targetContext.globalCompositeOperation;
    targetContext.globalCompositeOperation = operation;

    targetContext.setTransform(new Canvas.DOMMatrix([1, 0, 0, 1, 0, 0]));
    targetContext.drawImage(
      sourceCanvas,
      0,
      0,
      sourceCanvas.width,
      sourceCanvas.height
    );

    targetContext.globalCompositeOperation = previousOperation;
  }

  spritesBounds(sprites: Sprite[]): SpriteBounds {
    let maxX = 0;
    let maxY = 0;
    let minX = 0;
    let minY = 0;

    for (const sprite of sprites) {
      for (const point of this.spritePoints(sprite)) {
        if (point.x > maxX) maxX = point.x + 2;
        if (point.x < minX) minX = point.x - 2;
        if (point.y > maxY) maxY = point.y + 2;
        if (point.y < minY) minY = point.y - 2;
      }
    }

    // Trim transparent pixels off
    const padding = 15;
    const threshold = 3*255;
    const image = this.context.getImageData(
      minX + this.canvas.width / 2,
      -maxY + this.canvas.height / 2,
      maxX - minX,
      maxY - minY
    );
    minX += this.leftTrim(image, threshold) - padding;
    maxX -= this.rightTrim(image, threshold) - padding;
    maxY -= this.topTrim(image, threshold) - padding;
    minY += this.bottomTrim(image, threshold) - padding;

    return {minX, minY, maxX, maxY};
  }

  leftTrim(image: Canvas.ImageData, threshold: number): number {
    for (let col=0; col < image.width; col++) {
      let opacity = 0;
      for (let row=0; row < image.height; row++) {
        opacity += image.data[(row*image.width+col)*4+3]; // Alpha pixel
        if (opacity > threshold) return col;
      }
    }
    return 0;
    // throw "Unable to find opaque pixels in image";
  }

  rightTrim(image: Canvas.ImageData, threshold: number): number {
    for (let col=image.width-1; col >= 0; col--) {
      let opacity = 0;
      for (let row=image.height-1; row >= 0; row--) {
        opacity += image.data[(row*image.width+col)*4+3]; // Alpha pixel
        if (opacity > threshold) return image.width-1-col;
      }
    }
    return 0;
    // throw "Unable to find opaque pixels in image";
  }

  topTrim(image: Canvas.ImageData, threshold: number): number {
    for (let row=0; row < image.height; row++) {
      let opacity = 0;
      for (let col=0; col < image.width; col++) {
        opacity += image.data[(row*image.width+col)*4+3]; // Alpha pixel
        if (opacity > threshold) return row;
      }
    }
    return 0;
    // throw "Unable to find opaque pixels in image";
  }

  bottomTrim(image: Canvas.ImageData, threshold: number): number {
    for (let row=image.height-1; row >= 0; row--) {
      let opacity = 0;
      for (let col=image.width-1; col >= 0; col--) {
        opacity += image.data[(row*image.width+col)*4+3]; // Alpha pixel
        if (opacity > threshold) return image.height-1-row;
      }
    }
    return 0;
    // throw "Unable to find opaque pixels in image";
  }

  spritePoints(sprite: Sprite): SpritePoint[] {
    if (!sprite.width || !sprite.height) {
      return [];
    }

    const x = sprite.x;
    const y = sprite.y;

    const points: SpritePoint[] = [
      {x: -sprite.width/2, y: -sprite.height/2},
      {x: sprite.width/2, y: -sprite.height/2},
      {x: sprite.width/2, y: sprite.height/2},
      {x: -sprite.width/2, y: sprite.height/2},
    ]

    const angleRads = sprite.rotation * Math.PI * 2;
    const cosA = Math.cos(angleRads);
    const sinA = Math.sin(angleRads);

    for (const point of points) {
      point.x -= sprite.centerAnchorXOffset;
      point.y += sprite.centerAnchorYOffset;
      point.x = point.x * cosA - point.y * sinA;
      point.y = point.y * cosA + point.x * sinA;
      point.x += x;
      point.y += y;
    }
    return points;
  }
}

export { SpriteProcessor }
