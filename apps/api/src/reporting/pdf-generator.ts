import { existsSync } from 'node:fs';

let _puppeteer: any = null;
async function getPuppeteer() {
  if (!_puppeteer) {
    _puppeteer = await import('puppeteer-core');
  }
  return _puppeteer;
}

const CHROMIUM_CANDIDATES = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/google-chrome',
  '/usr/bin/chrome',
  '/opt/google/chrome/chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter((p): p is string => !!p && existsSync(p));

export async function renderHtmlToPdf(html: string): Promise<Buffer> {
  const { launch } = await getPuppeteer();
  const executablePath = CHROMIUM_CANDIDATES[0];
  if (!executablePath) {
    throw new Error(
      'No Chromium/Chrome executable found. Install one or set PUPPETEER_EXECUTABLE_PATH.',
    );
  }
  const browser = await launch({
    executablePath,
    args: ['--no-sandbox', '--headless=new'],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '40px', bottom: '40px', left: '30px', right: '30px' },
      printBackground: true,
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
