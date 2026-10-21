(() => {
  const { t, setLanguage } = globalThis.CompanionI18n;
  let host, box, version = 0;
  const send = async message => { const r = await chrome.runtime.sendMessage(message); if (!r.ok) throw new Error(r.error); return r.data; };
  function close() { version++; host?.remove(); host = null; }
  function element(tag, text) { const e = document.createElement(tag); if (text) e.textContent = text; return e; }
  async function selected(event) {
    if (host && event.composedPath().includes(host)) return;
    if (event.target.closest?.('input,textarea,[contenteditable="true"],[role="textbox"]')) return;
    const selection = getSelection(), text = selection?.toString().trim();
    if (!text || selection.isCollapsed) return;
    close();
    if (text.length > 6000) return;
    const current = version;
    let s; try { s = await send({ type: 'publicSettings' }); } catch { return; }
    if (!s.enabled || current !== version) return;
    setLanguage(s.language);
    const range = selection.getRangeAt(0).getBoundingClientRect();
    host = element('div'); host.style.cssText = 'all:initial;position:fixed;z-index:2147483647;';
    const root = host.attachShadow({ mode: 'closed' });
    const style = element('style'); style.textContent = ':host{all:initial}*{box-sizing:border-box}section{font:14px/1.65 system-ui,sans-serif;color:#243b35;background:#fff;width:min(360px,calc(100vw - 24px));max-height:65vh;overflow:auto;border:1px solid #dfe8e2;border-radius:16px;box-shadow:0 12px 50px #142d3030;padding:18px}header{display:flex;align-items:center;justify-content:space-between;color:#26765b;font-weight:700}button{font:inherit;cursor:pointer;border:0;border-radius:8px;padding:6px 12px;background:#edf4ed;color:#24624c}p{white-space:pre-wrap;overflow-wrap:anywhere;margin:12px 0}small{color:#728077}footer{display:flex;gap:8px}'; root.append(style);
    box = element('section'); box.setAttribute('aria-label', t('拾词翻译')); const header = element('header', t('✦ 拾词 · 中英互译')); const x = element('button', '×'); x.setAttribute('aria-label', t('关闭')); x.onclick = close; header.append(x);
    const original = element('p', text), status = element('p', t('正在翻译…')), explain = element('p'); const footer = element('footer'); const save = element('button', t('＋ 加入生词本')), retry = element('button', t('重试')), settings = element('button', t('打开设置')); save.hidden = true; retry.hidden = true;
    settings.onclick = () => send({ type: 'open' }).catch(() => { status.textContent = t('请点击工具栏插件图标打开设置'); });
    footer.append(save, retry, settings); box.append(header, original, status, explain, footer); root.append(box); document.documentElement.append(host);
    const width = box.getBoundingClientRect().width; host.style.left = `${Math.max(12, Math.min(range.left, innerWidth - width - 12))}px`; host.style.top = `${Math.max(12, Math.min(range.bottom + 10, innerHeight - box.getBoundingClientRect().height - 12))}px`;
    let result;
    async function run() {
      retry.hidden = true; save.hidden = true; status.textContent = t('正在翻译…'); explain.textContent = '';
      try { const r = await send({ type: 'translate', text, direction: s.direction }); if (version !== current) return; result = r; status.textContent = r.translation; explain.textContent = r.explanation; save.hidden = false; }
      catch (e) { if (version !== current) return; status.textContent = t(e.message); retry.hidden = false; }
      if (host) host.style.top = `${Math.max(12, Math.min(range.bottom + 10, innerHeight - box.getBoundingClientRect().height - 12))}px`;
    }
    retry.onclick = run; save.onclick = async () => { save.disabled = true; try { const r = await send({ type: 'save', entry: { ...result, source: location.href } }); save.textContent = r.duplicate ? t('已在生词本中') : t('✓ 已收藏'); } catch(e) { status.textContent = t(e.message); save.disabled = false; } }; run();
  }
  document.addEventListener('mouseup', selected);
  document.addEventListener('keyup', e => { if (e.key === 'Escape') close(); else if (e.key === 'Shift') selected(e); });
  document.addEventListener('mousedown', e => { if (host && !e.composedPath().includes(host)) close(); });
})();
