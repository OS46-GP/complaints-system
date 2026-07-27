let _puppeteer: any = null;
async function getPuppeteer() {
  if (!_puppeteer) {
    _puppeteer = await import('puppeteer-core');
  }
  return _puppeteer;
}

const CHROMIUM_PATH = '/usr/bin/chromium';

export async function renderHtmlToPdf(html: string): Promise<Buffer> {
  const { launch } = await getPuppeteer();
  const browser = await launch({
    executablePath: CHROMIUM_PATH,
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
