import { send, $ } from './client.js';
let config, result;
const status = message => $('status').textContent = message;
$('open').onclick = $('settings').onclick = () => chrome.runtime.openOptionsPage();
async function load() { config = await send({ type: 'getSettings' }); $('enabled').checked = config.enabled; $('direction').value = config.direction; }
for (const id of ['enabled', 'direction']) $(id).onchange = async () => { try { await send({ type: 'setSettings', settings: { ...config, enabled: $('enabled').checked, direction: $('direction').value } }); await load(); } catch (e) { status(e.message); } };
$('translate').onclick = async () => {
  $('translate').disabled = true; $('result').hidden = true; status('正在翻译…');
  try { result = await send({ type: 'translate', text: $('input').value, direction: $('direction').value }); $('translation').textContent = result.translation; $('explanation').textContent = result.explanation; $('result').hidden = false; $('save').disabled = false; $('save').textContent = '＋ 加入生词本'; status(''); } catch(e) { status(e.message); } finally { $('translate').disabled = false; }
};
$('save').onclick = async () => { $('save').disabled = true; try { const r = await send({ type: 'save', entry: result }); $('save').textContent = r.duplicate ? '已在生词本中' : '✓ 已收藏'; } catch(e) { status(e.message); $('save').disabled = false; } };
load().catch(e => status(e.message));
