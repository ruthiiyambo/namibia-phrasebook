const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const ROOT = process.cwd();
const ASSETS_DIR = path.join(ROOT, 'assets');
const SOURCE_PATH = path.join(ASSETS_DIR, 'namibia-phrasebook-badge-source.png');

const OUTPUTS = {
  icon: path.join(ASSETS_DIR, 'icon.png'),
  splash: path.join(ASSETS_DIR, 'splash-icon.png'),
  favicon: path.join(ASSETS_DIR, 'favicon.png'),
  androidBackground: path.join(ASSETS_DIR, 'android-icon-background.png'),
  androidForeground: path.join(ASSETS_DIR, 'android-icon-foreground.png'),
  androidMonochrome: path.join(ASSETS_DIR, 'android-icon-monochrome.png'),
};

function readPng(filePath) {
  return PNG.sync.read(fs.readFileSync(filePath));
}

function writePng(filePath, png) {
  fs.writeFileSync(filePath, PNG.sync.write(png));
}

function getIndex(width, x, y) {
  return (width * y + x) << 2;
}

function getPixel(png, x, y) {
  const index = getIndex(png.width, x, y);
  return {
    r: png.data[index],
    g: png.data[index + 1],
    b: png.data[index + 2],
    a: png.data[index + 3],
  };
}

function setPixel(png, x, y, pixel) {
  const index = getIndex(png.width, x, y);
  png.data[index] = pixel.r;
  png.data[index + 1] = pixel.g;
  png.data[index + 2] = pixel.b;
  png.data[index + 3] = pixel.a;
}

function sampleBackground(png) {
  const points = [
    [Math.floor(png.width / 2), 20],
    [20, Math.floor(png.height / 2)],
    [png.width - 21, Math.floor(png.height / 2)],
    [Math.floor(png.width / 2), png.height - 21],
    [100, 100],
    [png.width - 101, 100],
  ];

  const total = points.reduce((acc, [x, y]) => {
    const pixel = getPixel(png, x, y);
    acc.r += pixel.r;
    acc.g += pixel.g;
    acc.b += pixel.b;
    return acc;
  }, { r: 0, g: 0, b: 0 });

  return {
    r: Math.round(total.r / points.length),
    g: Math.round(total.g / points.length),
    b: Math.round(total.b / points.length),
    a: 255,
  };
}

function pixelDiff(left, right) {
  return Math.abs(left.r - right.r) + Math.abs(left.g - right.g) + Math.abs(left.b - right.b);
}

function findBadgeBounds(png, background, threshold = 60) {
  let minX = png.width;
  let minY = png.height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const pixel = getPixel(png, x, y);
      if (pixel.a === 0) continue;
      if (pixelDiff(pixel, background) > threshold) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  const padding = 18;

  return {
    x: Math.max(0, minX - padding),
    y: Math.max(0, minY - padding),
    width: Math.min(png.width, maxX + padding) - Math.max(0, minX - padding) + 1,
    height: Math.min(png.height, maxY + padding) - Math.max(0, minY - padding) + 1,
  };
}

function cropPng(source, bounds) {
  const result = new PNG({ width: bounds.width, height: bounds.height });

  for (let y = 0; y < bounds.height; y += 1) {
    for (let x = 0; x < bounds.width; x += 1) {
      setPixel(result, x, y, getPixel(source, bounds.x + x, bounds.y + y));
    }
  }

  return result;
}

function createSolidPng(width, height, color) {
  const result = new PNG({ width, height });

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      setPixel(result, x, y, color);
    }
  }

  return result;
}

function resizePng(source, targetWidth, targetHeight) {
  const result = new PNG({ width: targetWidth, height: targetHeight });
  const xRatio = source.width / targetWidth;
  const yRatio = source.height / targetHeight;

  for (let y = 0; y < targetHeight; y += 1) {
    for (let x = 0; x < targetWidth; x += 1) {
      const sourceX = Math.min(source.width - 1, Math.floor((x + 0.5) * xRatio));
      const sourceY = Math.min(source.height - 1, Math.floor((y + 0.5) * yRatio));
      setPixel(result, x, y, getPixel(source, sourceX, sourceY));
    }
  }

  return result;
}

function fitWithin(source, maxWidth, maxHeight) {
  const scale = Math.min(maxWidth / source.width, maxHeight / source.height);
  return resizePng(
    source,
    Math.max(1, Math.round(source.width * scale)),
    Math.max(1, Math.round(source.height * scale)),
  );
}

function compositeCentered(base, overlay) {
  const offsetX = Math.floor((base.width - overlay.width) / 2);
  const offsetY = Math.floor((base.height - overlay.height) / 2);

  for (let y = 0; y < overlay.height; y += 1) {
    for (let x = 0; x < overlay.width; x += 1) {
      const pixel = getPixel(overlay, x, y);
      if (pixel.a === 0) continue;
      setPixel(base, offsetX + x, offsetY + y, pixel);
    }
  }

  return base;
}

function buildMonochromeCrop(source, background, threshold = 60) {
  const result = new PNG({ width: source.width, height: source.height });

  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const pixel = getPixel(source, x, y);
      if (pixelDiff(pixel, background) > threshold && pixel.a > 0) {
        setPixel(result, x, y, {
          r: 255,
          g: 255,
          b: 255,
          a: 255,
        });
      } else {
        setPixel(result, x, y, {
          r: 0,
          g: 0,
          b: 0,
          a: 0,
        });
      }
    }
  }

  return result;
}

function main() {
  if (!fs.existsSync(SOURCE_PATH)) {
    throw new Error(`Missing source logo at ${SOURCE_PATH}`);
  }

  const source = readPng(SOURCE_PATH);
  const background = sampleBackground(source);
  const bounds = findBadgeBounds(source, background);
  const badge = cropPng(source, bounds);

  const iconBase = createSolidPng(1024, 1024, background);
  const iconBadge = fitWithin(badge, 800, 800);
  writePng(OUTPUTS.icon, compositeCentered(iconBase, iconBadge));

  const splashBase = createSolidPng(1024, 1024, { r: 0, g: 0, b: 0, a: 0 });
  const splashBadge = fitWithin(badge, 820, 820);
  writePng(OUTPUTS.splash, compositeCentered(splashBase, splashBadge));

  const faviconBase = createSolidPng(48, 48, background);
  const faviconBadge = fitWithin(badge, 40, 40);
  writePng(OUTPUTS.favicon, compositeCentered(faviconBase, faviconBadge));

  writePng(OUTPUTS.androidBackground, createSolidPng(512, 512, background));

  const foregroundBase = createSolidPng(512, 512, { r: 0, g: 0, b: 0, a: 0 });
  const foregroundBadge = fitWithin(badge, 430, 430);
  writePng(OUTPUTS.androidForeground, compositeCentered(foregroundBase, foregroundBadge));

  const monoCrop = buildMonochromeCrop(badge, background);
  const monoBase = createSolidPng(432, 432, { r: 0, g: 0, b: 0, a: 0 });
  const monoBadge = fitWithin(monoCrop, 372, 372);
  writePng(OUTPUTS.androidMonochrome, compositeCentered(monoBase, monoBadge));

  console.log('Generated brand assets from source logo.');
}

main();
