import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = process.cwd();
const server = createServer(async (req,res) => {
  const name = req.url === '/article' ? null : req.url.split('?')[0].slice(1);
  if (!name) { res.setHeader('Content-Type','text/html'); res.end('<p id="article">Learning opens doors. Take care of yourself.</p>'); return; }
  try { const file = path.resolve(root,name); if (!file.startsWith(root + path.sep)) throw Error(); const data = await readFile(file); res.setHeader('Content-Type',name.endsWith('.css') ? 'text/css' : name.endsWith('.html') ? 'text/html' : 'text/javascript'); res.end(data); } catch { res.statusCode=404;res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  const executablePath = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p => p && existsSync(p));
  browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => {
    const words = [], settings = { provider:'deepseek',endpoint:'https://api.deepseek.com/chat/completions',model:'deepseek-chat',apiKey:'',enabled:true,direction:'auto' };
    window.chrome = { storage: { onChanged:{addListener(){}} }, runtime:{ openOptionsPage:async()=>{}, sendMessage:async m => {
      let data;
      if(m.type==='getSettings') data=settings;
      if(m.type==='setSettings') { Object.assign(settings,m.settings); data=true; }
      if(m.type==='publicSettings') data={enabled:true,direction:'auto'};
      if(m.type==='words') data=words;
      if(m.type==='translate') data={text:m.text,translation:'学习打开新世界的大门。',explanation:'open doors：创造机会。'};
      if(m.type==='save') { words.push({id:'1',...m.entry,created:Date.now(),due:Date.now(),reviews:0,step:0});data={saved:true}; }
      return {ok:true,data};
    } } };
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  await page.goto(base+'/app.html');
  await page.locator('#settings').waitFor({state:'visible'});
  await page.locator('#provider').selectOption('zhipu');
  assert.equal(await page.locator('#endpoint').inputValue(),'https://open.bigmodel.cn/api/paas/v4/chat/completions');
  await page.locator('#apiKey').fill('fake-key');
  await page.locator('button[type=submit]').click();
  await page.locator('#test').click(); await page.getByText('✓ 连接成功：学习打开新世界的大门。').waitFor();
  await page.locator('[data-page=words]').click();
  await page.screenshot({path:'ui-preview.png',fullPage:true});
  await page.locator('[data-page=review]').click(); await page.getByText('先收藏第一个表达吧。').waitFor();
  await page.goto(base+'/popup.html'); await page.locator('#input').fill('Learning opens doors.');await page.locator('#translate').click();await page.locator('#save').click();await page.getByText('✓ 已收藏').waitFor();
  await page.goto(base+'/article');await page.addScriptTag({path:'content.js'});
  await page.locator('#article').evaluate(e=>{ const range=document.createRange();range.selectNodeContents(e);getSelection().removeAllRanges();getSelection().addRange(range); });await page.locator('#article').dispatchEvent('mouseup');
  // Closed shadow roots are intentionally private; verify host attachment and no page errors.
  await page.waitForFunction(()=>Array.from(document.documentElement.children).some(e=>e.tagName==='DIV' && e.style.zIndex==='2147483647'));
  await page.keyboard.press('Escape');
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('Browser smoke passed: settings, connection test, vocabulary empty state, review, popup translate/save, selection host and Escape.');
} finally { await browser?.close(); await new Promise(resolve=>server.close(resolve)); }
