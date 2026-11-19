import { readFileSync, writeFileSync } from 'fs';
import sharp from 'sharp';

function pixelAt(data, width, channels, x, y) {
  const i = (y * width + x) * channels;
  return {
    r: data[i],
    g: data[i + 1],
    b: data[i + 2],
    a: channels === 4 ? data[i + 3] : 255,
  };
}

function colorDist(a, b) {
  return Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b) + Math.abs(a.a - b.a);
}

async function normalize(file) {
  const input = readFileSync(file);
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const corners = [
    pixelAt(data, width, channels, 0, 0),
    pixelAt(data, width, channels, width - 1, 0),
    pixelAt(data, width, channels, 0, height - 1),
    pixelAt(data, width, channels, width - 1, height - 1),
  ];
  const bg = {
    r: Math.round(corners.reduce((s, p) => s + p.r, 0) / 4),
    g: Math.round(corners.reduce((s, p) => s + p.g, 0) / 4),
    b: Math.round(corners.reduce((s, p) => s + p.b, 0) / 4),
    a: Math.round(corners.reduce((s, p) => s + p.a, 0) / 4),
  };

  let minX = width, maxX = 0, minY = height, maxY = 0, found = false;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = pixelAt(data, width, channels, x, y);
      if (p.a < 16) continue;
      if (colorDist(p, bg) >= 40) {
        found = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  let pipeline = sharp(input).ensureAlpha();
  if (found && maxX > minX && maxY > minY) {
    const left = Math.max(0, minX - 8);
    const top = Math.max(0, minY - 8);
    const right = Math.min(width - 1, maxX + 24);
    const bottom = Math.min(height - 1, maxY + 8);
    pipeline = pipeline.extract({
      left,
      top,
      width: right - left + 1,
      height: bottom - top + 1,
    });
  }

  const cropped = await pipeline.toBuffer({ resolveWithObject: true });
  const padX = Math.max(16, Math.round(cropped.info.width * 0.05));
  const padY = Math.max(16, Math.round(cropped.info.height * 0.05));
  const out = await sharp(cropped.data)
    .extend({
      top: padY,
      bottom: padY,
      left: padX,
      right: padX,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  writeFileSync(file, out);
  console.log(
    file,
    `${width}x${height}`,
    'content',
    found ? `${minX},${minY}->${maxX},${maxY}` : 'none',
    '->',
    `${(await sharp(out).metadata()).width}x${(await sharp(out).metadata()).height}`
  );
}

await normalize('public/images/logo-1795071073992.png');
await normalize('public/images/footer_logo-1795081668629.png');
