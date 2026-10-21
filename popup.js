import { send, $ } from './client.js';
const { t, setLanguage, translateDocument, languageControl } = globalThis.CompanionI18n;
let config, result;
const status = message => $('status').textContent = t(message);
let languageSelect;
function applyLanguage(language) { setLanguage(language); translateDocument(); if (languageSelect) languageSelect.value = globalThis.CompanionI18n.language; $('save').textContent = t($('save').disabled ? '✓ 已收藏' : '＋ 加入生词本'); status(''); }
$('open').onclick = $('settings').onclick = () => chrome.runtime.openOptionsPage();
async function load() {
  config = await send({ type: 'getSettings' }); $('enabled').checked = config.enabled; $('direction').value = config.direction;
  if (!languageSelect) {
    const container = document.createElement('div'); container.className = 'popup-language'; document.querySelector('main').prepend(container);
    languageSelect = languageControl(container, async language => { try { await send({ type: 'setLanguage', language }); config.language = language; applyLanguage(language); } catch(e) { languageSelect.value = globalThis.CompanionI18n.language; status(e.message); } });
  }
  applyLanguage(config.language);
}
for (const id of ['enabled', 'direction']) $(id).onchange = async () => { try { await send({ type: 'setSettings', settings: { ...config, enabled: $('enabled').checked, direction: $('direction').value } }); await load(); } catch (e) { status(e.message); } };
$('translate').onclick = async () => {
  $('translate').disabled = true; $('result').hidden = true; status(t('正在翻译…'));
  try { result = await send({ type: 'translate', text: $('input').value, direction: $('direction').value }); $('translation').textContent = result.translation; $('explanation').textContent = result.explanation; $('result').hidden = false; $('save').disabled = false; $('save').textContent = t('＋ 加入生词本'); status(''); } catch(e) { status(e.message); } finally { $('translate').disabled = false; }
};
$('save').onclick = async () => { $('save').disabled = true; try { const r = await send({ type: 'save', entry: result }); $('save').textContent = r.duplicate ? t('已在生词本中') : t('✓ 已收藏'); } catch(e) { status(e.message); $('save').disabled = false; } };
load().catch(e => status(e.message));
chrome.storage.onChanged.addListener((changes, area) => { const language = changes.settings?.newValue?.language; if (area === 'local' && language && language !== globalThis.CompanionI18n.language) applyLanguage(language); });
