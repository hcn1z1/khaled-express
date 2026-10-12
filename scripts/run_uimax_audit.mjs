import { pathToFileURL } from 'url';
import fs from 'fs';
import path from 'path';

process.env.CHROME_PATH = process.env.CHROME_PATH || 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

const uimaxDir = 'C:/Users/LENOVO IP330/AppData/Local/npm-cache/_npx/6a7b88f764ad2677/node_modules/uimax-mcp/dist';

async function main() {
  console.log('Loading UIMax MCP tools...');
  const fullReviewMod = await import(pathToFileURL(`${uimaxDir}/tools/full-review.js`).href);
  const screenshotMod = await import(pathToFileURL(`${uimaxDir}/tools/screenshot.js`).href);
  const a11yMod = await import(pathToFileURL(`${uimaxDir}/tools/accessibility.js`).href);
  const perfMod = await import(pathToFileURL(`${uimaxDir}/tools/performance.js`).href);
  const seoMod = await import(pathToFileURL(`${uimaxDir}/tools/seo.js`).href);
  const codeMod = await import(pathToFileURL(`${uimaxDir}/tools/code-analysis.js`).href);
  const htmlMod = await import(pathToFileURL(`${uimaxDir}/tools/html-report.js`).href);
  const browserMod = await import(pathToFileURL(`${uimaxDir}/utils/browser.js`).href);

  const url = 'http://localhost:3000';
  const codeDir = 'x:/dev/khaled-express/customer-web/src';

  console.log(`\n============================================================`);
  console.log(`RUNNING UIMAX MCP AUDIT ON: ${url}`);
  console.log(`SOURCE CODE DIRECTORY: ${codeDir}`);
  console.log(`============================================================\n`);

  // 1. Desktop Full Review
  console.log('[1/4] Running Desktop Full Review (Lighthouse, axe-core, Web Vitals, Code AST, SEO)...');
  const desktopResult = await fullReviewMod.runFullReview(url, codeDir, { width: 1440, height: 900 });

  // 2. Mobile Audit
  console.log('[2/4] Running Mobile Viewport Audits (375x812)...');
  const mobileScreenshot = await screenshotMod.captureScreenshot({
    url,
    width: 375,
    height: 812,
    fullPage: true,
    delay: 1000
  });

  // 3. Responsive comparison
  console.log('[3/4] Running Responsive Viewport Checks...');
  const responsiveShots = await screenshotMod.captureResponsiveScreenshots(url);

  // 4. Generate Reports
  console.log('[4/4] Generating formatted reports...');
  const markdownReport = fullReviewMod.formatFullReviewReport(desktopResult);
  const htmlReport = htmlMod.generateHtmlReport(desktopResult);

  // Save outputs
  const outDir = path.resolve('scripts/uimax_output');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Save screenshots to disk
  fs.writeFileSync(path.join(outDir, 'screenshot-desktop.png'), Buffer.from(desktopResult.screenshot.base64, 'base64'));
  fs.writeFileSync(path.join(outDir, 'screenshot-mobile.png'), Buffer.from(mobileScreenshot.base64, 'base64'));

  // Save reports
  fs.writeFileSync(path.join(outDir, 'report.md'), markdownReport, 'utf-8');
  fs.writeFileSync(path.join(outDir, 'report.html'), htmlReport, 'utf-8');

  // Strip base64 for compact json
  const compactResult = {
    ...desktopResult,
    screenshot: { ...desktopResult.screenshot, base64: '[OMITTED]' },
    responsive: responsiveShots.map(s => ({ width: s.width, height: s.height, url: s.url }))
  };
  fs.writeFileSync(path.join(outDir, 'audit_summary.json'), JSON.stringify(compactResult, null, 2), 'utf-8');

  console.log('\n============================================================');
  console.log('AUDIT COMPLETED SUCCESSFULLY');
  console.log('============================================================\n');
  console.log(markdownReport);

  const browser = await browserMod.getBrowser();
  await browser.close();
}

main().catch(err => {
  console.error('UIMax audit failed:', err);
  process.exit(1);
});
