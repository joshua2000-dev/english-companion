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
  const name = req.url.split('?')[0] === '/article' ? null : req.url.split('?')[0].slice(1);
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
    const words = [], settings = JSON.parse(sessionStorage.getItem('test-settings') || 'null') || { provider:'deepseek',endpoint:'https://api.deepseek.com/chat/completions',model:'deepseek-chat',apiKey:'',enabled:true,direction:'auto',language:'zh' };
    window.__testWords = words;
    window.chrome = { storage: { onChanged:{addListener(){}} }, runtime:{ openOptionsPage:async()=>{}, sendMessage:async m => {
      let data;
      if(m.type==='getSettings') data=settings;
      if(m.type==='setSettings') { Object.assign(settings,m.settings); data=true; }
      if(m.type==='setLanguage') { settings.language=m.language; data=m.language; }
      if(m.type==='setLanguage' || m.type==='setSettings') sessionStorage.setItem('test-settings',JSON.stringify(settings));
      if(m.type==='publicSettings') data={enabled:true,direction:'auto',language:settings.language};
      if(m.type==='words') data=words;
      if(m.type==='translate') data={text:m.text,translation:'学习打开新世界的大门。',explanation:'open doors：创造机会。'};
      if(m.type==='save') { window.__lastSaved = m.entry; words.push({id:'1',...m.entry,created:Date.now(),due:Date.now(),reviews:0,step:0});data={saved:true}; }
      if(m.type==='review') { const {schedule} = await import('/core.mjs'); const index = words.findIndex(w=>w.id===m.id); words[index]=schedule(words[index],m.rating); data=true; }
      return {ok:true,data};
    } } };
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  await page.goto(base+'/app.html');
  await page.locator('.language-select').waitFor();
  await page.locator('#settings').waitFor({state:'visible'});
  await page.locator('#provider').selectOption('zhipu');
  assert.equal(await page.locator('#endpoint').inputValue(),'https://open.bigmodel.cn/api/paas/v4/chat/completions');
  await page.locator('#apiKey').fill('fake-key');
  await page.locator('button[type=submit]').click();
  await page.locator('#test').click(); await page.getByText('✓ 连接成功：学习打开新世界的大门。').waitFor();
  await page.locator('[data-page=words]').click();
  await page.screenshot({path:'ui-preview.png',fullPage:true});
  await page.locator('[data-page=review]').click(); await page.getByText('先收藏第一个表达吧。').waitFor();
  await page.locator('.language-select').selectOption('en');
  await page.getByRole('button',{name:'⚙　Model settings',exact:true}).waitFor();
  await page.getByText('Save your first expression.',{exact:true}).waitFor();
  await page.locator('[data-page=settings]').click();
  assert.equal(await page.locator('#apiKey').inputValue(),'fake-key');
  await page.getByRole('button',{name:'Save settings',exact:true}).waitFor();
  const articleURL = base + '/article?id=123&lang=en#chapter-2';
  await page.evaluate(async source => { await chrome.runtime.sendMessage({type:'save',entry:{text:'contextual learning',translation:'情境学习',source}}); }, articleURL);
  await page.locator('[data-page=words]').click(); await page.locator('#search').fill('contextual');
  assert.equal(await page.locator('#wordList [role=progressbar]').getAttribute('aria-valuenow'),'0');
  await page.locator('#wordList .memory-details summary').click();
  assert.equal(await page.locator('#wordList .memory-timeline li').count(),8);
  assert.equal(await page.locator('#wordList .source-link').getAttribute('href'),articleURL);
  assert.equal(await page.locator('#wordList .source-link').innerText(),'Read original ↗');
  await page.locator('[data-page=review]').click();
  assert.equal(await page.locator('#reviewCard .source-link').getAttribute('href'),articleURL);
  await page.getByRole('button',{name:'Reveal answer',exact:true}).click();
  await page.locator('.language-select').selectOption('zh');
  await page.getByRole('button',{name:'还没记住 · 10 分钟后',exact:true}).waitFor();
  assert.equal(await page.locator('#reviewCard .source-link').innerText(),'阅读原文 ↗');
  const [article] = await Promise.all([page.waitForEvent('popup'),page.locator('#reviewCard .source-link').click()]);
  await article.waitForLoadState(); assert.equal(article.url(),articleURL); await article.close();
  await page.getByRole('button',{name:'记住了 · 延长间隔',exact:true}).click();
  await page.getByText('今天的复习已完成。',{exact:true}).waitFor();
  await page.locator('[data-page=words]').click();
  assert.equal(await page.locator('#wordList [role=progressbar]').getAttribute('aria-valuenow'),'1');
  await page.getByText('初步记住',{exact:true}).first().waitFor();
  await page.evaluate(()=>{ Object.assign(window.__testWords[0],{completedStages:6,step:6,due:Date.now()-86400000,reviews:6}); });
  await page.locator('[data-page=review]').click();
  await page.getByRole('button',{name:'揭晓答案',exact:true}).click();
  await page.getByRole('button',{name:'还没记住 · 10 分钟后',exact:true}).click();
  await page.getByText('今天的复习已完成。',{exact:true}).waitFor();
  await page.locator('[data-page=words]').click();await page.locator('#search').fill('learning');
  assert.equal(await page.locator('#wordList [role=progressbar]').getAttribute('aria-valuenow'),'0');
  await page.getByText('重新巩固',{exact:true}).first().waitFor();
  await page.locator('.language-select').selectOption('en');
  await page.locator('[data-page=words]').click(); await page.screenshot({path:'ui-preview.png',fullPage:true});
  await page.reload(); await page.locator('.language-select').waitFor(); assert.equal(await page.locator('.language-select').inputValue(),'en');
  await page.locator('.language-select').selectOption('zh');
  await page.goto(base+'/popup.html'); await page.locator('#input').fill('Learning opens doors.');await page.locator('#translate').click();await page.locator('#save').click();await page.getByText('✓ 已收藏').waitFor();
  await page.locator('.language-select').selectOption('en'); await page.getByRole('button',{name:'Translate →',exact:true}).waitFor();
  assert.equal(await page.locator('#translation').innerText(),'学习打开新世界的大门。');
  await page.goto(articleURL);
  await page.evaluate(() => { const original = Element.prototype.attachShadow; Element.prototype.attachShadow = function(options) { const root = original.call(this,options); window.__testShadow = root; return root; }; });
  await page.addScriptTag({path:'i18n.js'});await page.addScriptTag({path:'content.js'});
  await page.locator('#article').evaluate(e=>{ const range=document.createRange();range.selectNodeContents(e);getSelection().removeAllRanges();getSelection().addRange(range); });await page.locator('#article').dispatchEvent('mouseup');
  // Closed shadow roots are intentionally private; verify host attachment and no page errors.
  await page.waitForFunction(()=>Array.from(document.documentElement.children).some(e=>e.tagName==='DIV' && e.style.zIndex==='2147483647'));
  await page.waitForFunction(()=>window.__testShadow && [...window.__testShadow.querySelectorAll('button')].some(b=>!b.hidden && b.textContent==='＋ Save to vocabulary'));
  await page.evaluate(()=>[...window.__testShadow.querySelectorAll('button')].find(b=>b.textContent==='＋ Save to vocabulary').click());
  await page.waitForFunction(()=>window.__lastSaved?.source===location.href);
  await page.keyboard.press('Escape');
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('Browser smoke passed: bilingual UI, language persistence, source navigation, eight-stage timeline, memory indicators, successful recall scheduling, lapse reset, review answer preservation, popup and webpage selection.');
} finally { await browser?.close(); await new Promise(resolve=>server.close(resolve)); }
