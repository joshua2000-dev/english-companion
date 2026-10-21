export const defaults = { provider: 'deepseek', endpoint: 'https://api.deepseek.com/chat/completions', model: 'deepseek-chat', apiKey: '', enabled: true, direction: 'auto', language: 'zh' };
export function sourceURL(value) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : ''; } catch { return ''; }
}
export function endpointURL(value) {
  const url = new URL(value.trim());
  if (url.username || url.password || url.search || url.hash) throw new Error('接口地址不能包含账号、查询参数或锚点');
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) throw new Error('请使用 HTTPS 地址；本地模型可使用 localhost HTTP');
  return url.href.replace(/\/$/, '');
}
export function normalize(text) { return text.trim().replace(/\s+/g, ' ').toLocaleLowerCase(); }
export const DAY = 86400000;
export const REVIEW_GAPS = [0, 1, 3, 7, 14, 30, 60, 120];
export function completedReviews(entry) {
  const value = Number.isInteger(entry.completedStages) ? entry.completedStages : entry.step || 0;
  return Math.max(0, Math.min(value, REVIEW_GAPS.length));
}
export function reviewState(entry, now = Date.now()) {
  const completed = completedReviews(entry);
  const due = Number.isFinite(entry.due) ? entry.due : now;
  const overdue = due < now - 60000;
  const level = completed === 0 ? 0 : completed <= 2 ? 1 : completed <= 4 ? 2 : completed <= 6 ? 3 : 4;
  return { completed, total: REVIEW_GAPS.length, progress: completed / REVIEW_GAPS.length, level, due, overdue, ready: due <= now, maintenance: completed === REVIEW_GAPS.length };
}
export function reviewPlan(entry, now = Date.now()) {
  const state = reviewState(entry, now);
  let date = Math.max(state.due, now);
  return REVIEW_GAPS.map((gap, index) => {
    if (index < state.completed) return { index, gap, status: 'completed', date: null };
    if (index > state.completed) date += gap * DAY;
    return { index, gap, status: index === state.completed ? 'current' : 'future', date };
  });
}
export function schedule(entry, rating, now = Date.now()) {
  const remembered = rating === 'good';
  const completedStages = remembered ? Math.min(completedReviews(entry) + 1, REVIEW_GAPS.length) : 0;
  const step = Math.min(completedStages, REVIEW_GAPS.length - 1);
  const days = REVIEW_GAPS[step];
  const due = now + (days ? days * DAY : 600000);
  return { ...entry, step, completedStages, reviews: (entry.reviews || 0) + 1, due, lastReview: now,
    lapses: (entry.lapses || 0) + (remembered ? 0 : 1),
    history: [...(Array.isArray(entry.history) ? entry.history : []), { at: now, rating: remembered ? 'good' : 'again', due }].slice(-50) };
}
export function parseTranslation(content) {
  try {
    const value = JSON.parse(content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim());
    if (typeof value.translation === 'string' && value.translation.trim()) return { translation: value.translation.slice(0, 14000), explanation: typeof value.explanation === 'string' ? value.explanation.slice(0, 10000) : '' };
  } catch {}
  if (!content.trim()) throw new Error('模型返回了空内容');
  return { translation: content.slice(0, 14000), explanation: '' };
}
