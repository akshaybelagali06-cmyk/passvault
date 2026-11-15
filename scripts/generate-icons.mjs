import sharp from 'sharp';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../assets/brand/logo.svg', import.meta.url), 'utf8');
const monochrome = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72">
  <path d="M36 5 59 14v18c0 15-9.6 27.1-23 34C22.6 59.1 13 47 13 32V14l23-9Z" fill="#FFFFFF"/>
  <path d="M40.5 34.2a8 8 0 1 0-9 0v12.3a4.5 4.5 0 0 0 9 0V34.2Zm-4.5-2.7a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" fill="#0A0C12"/>
</svg>`;

await sharp({
  create: {
    width: 1024,
    height: 1024,
    channels: 4,
    background: '#0A0C12',
  },
})
  .composite([{ input: Buffer.from(source), gravity: 'center' }])
  .png()
  .toFile('assets/images/icon.png');

await sharp(Buffer.from(source)).resize(1024, 1024).png().toFile('assets/images/android-icon-foreground.png');
await sharp(Buffer.from(monochrome)).resize(1024, 1024).png().toFile('assets/images/android-icon-monochrome.png');
await sharp(Buffer.from(source)).resize(512, 512).png().toFile('assets/images/favicon.png');
await sharp(Buffer.from(source)).resize(512, 512).png().toFile('assets/images/splash-icon.png');
