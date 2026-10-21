export const defaults = { provider: 'deepseek', endpoint: 'https://api.deepseek.com/chat/completions', model: 'deepseek-chat', apiKey: '', enabled: true, direction: 'auto' };
export function endpointURL(value) {
  const url = new URL(value.trim());
  if (url.username || url.password || url.search || url.hash) throw new Error('接口地址不能包含账号、查询参数或锚点');
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) throw new Error('请使用 HTTPS 地址；本地模型可使用 localhost HTTP');
  return url.href.replace(/\/$/, '');
}
export function normalize(text) { return text.trim().replace(/\s+/g, ' ').toLocaleLowerCase(); }
export function schedule(entry, rating, now = Date.now()) {
  const step = rating === 'again' ? 0 : Math.min((entry.step || 0) + 1, 7);
  const days = [0, 1, 3, 7, 14, 30, 60, 120][step];
  return { ...entry, step, reviews: (entry.reviews || 0) + 1, due: now + (days ? days * 86400000 : 600000), lastReview: now };
}
export function parseTranslation(content) {
  try {
    const value = JSON.parse(content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim());
    if (typeof value.translation === 'string' && value.translation.trim()) return { translation: value.translation.slice(0, 14000), explanation: typeof value.explanation === 'string' ? value.explanation.slice(0, 10000) : '' };
  } catch {}
  if (!content.trim()) throw new Error('模型返回了空内容');
  return { translation: content.slice(0, 14000), explanation: '' };
}
