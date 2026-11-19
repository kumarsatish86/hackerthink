import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

type PadOpts = {
  padRatio?: number;
  minPad?: number;
};

function pixelAt(
  data: Buffer,
  width: number,
  channels: number,
  x: number,
  y: number
) {
  const i = (y * width + x) * channels;
  return {
    r: data[i],
    g: data[i + 1],
    b: data[i + 2],
    a: channels === 4 ? data[i + 3] : 255,
  };
}

function colorDist(
  a: { r: number; g: number; b: number; a: number },
  b: { r: number; g: number; b: number; a: number }
) {
  return Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b) + Math.abs(a.a - b.a);
}

/**
 * Crop to visible logo artwork (works on black/white/transparent backgrounds),
 * then add a little transparent padding so glyphs aren't clipped.
 */
export async function padLogoBuffer(
  input: Buffer,
  opts: PadOpts = {}
): Promise<{ buffer: Buffer; mime: string }> {
  const padRatio = opts.padRatio ?? 0.05;
  const minPad = opts.minPad ?? 16;

  const { data, info } = await sharp(input, { failOn: 'none' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  // Estimate background from corners
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

  const threshold = 40;
  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;
  let found = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = pixelAt(data, width, channels, x, y);
      // Transparent-ish pixels are empty
      if (p.a < 16) continue;
      if (colorDist(p, bg) >= threshold) {
        found = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  let pipeline = sharp(input, { failOn: 'none' }).ensureAlpha();

  if (found && maxX > minX && maxY > minY) {
    // Keep extra margin so anti-aliased glyph tips (e.g. final "k") are not cropped
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
  const padX = Math.max(minPad, Math.round(cropped.info.width * padRatio));
  const padY = Math.max(minPad, Math.round(cropped.info.height * padRatio));

  const buffer = await sharp(cropped.data)
    .extend({
      top: padY,
      bottom: padY,
      left: padX,
      right: padX,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  return { buffer, mime: 'image/png' };
}

export async function savePaddedLogoToPublic(
  input: Buffer,
  fileName: string
): Promise<string> {
  const { buffer } = await padLogoBuffer(input);
  const dir = join(process.cwd(), 'public', 'images');
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  const safeName = fileName.replace(/\.[^.]+$/, '') + '.png';
  await writeFile(join(dir, safeName), buffer);
  return `/images/${safeName}`;
}
