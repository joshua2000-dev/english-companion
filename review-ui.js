import { reviewState, reviewPlan, DAY } from './core.mjs';
const { t } = globalThis.CompanionI18n;
const labels = ['尚未学习', '初步记住', '正在巩固', '比较熟悉', '较牢固'];
function el(tag, text, cls) { const e = document.createElement(tag); if (text) e.textContent = text; if (cls) e.className = cls; return e; }
function locale() { return globalThis.CompanionI18n.language === 'en' ? 'en-US' : 'zh-CN'; }
function dateText(date) { return new Date(date).toLocaleString(locale(), { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }); }
export function intervalText(gap) { return gap === 1 ? t('间隔 1 天') : gap ? t('间隔 {days} 天', {days:gap}) : t('主动回忆'); }
function dueText(state, now) {
  if (!state.ready) return t('下次复习：{date}', {date:dateText(state.due)});
  if (state.overdue) { const days = Math.floor((now - state.due) / DAY); return days ? t('已逾期 {days} 天 · 现在可以复习', {days}) : t('已到复习时间 · 现在可以复习'); }
  return t('现在可以复习');
}
export function memoryPanel(word, now = Date.now(), expanded = false) {
  const state = reviewState(word, now), panel = el('section', '', 'memory-panel');
  panel.setAttribute('aria-label', t('复习进度与掌握程度'));
  const heading = el('div', '', 'memory-heading');
  const strength = el('span', '', `memory-strength level-${state.level}`);
  const dots = el('span', '', 'strength-dots'); dots.setAttribute('aria-hidden','true');
  for (let i=0;i<4;i++) dots.append(el('i', '', i < state.level ? 'filled' : ''));
  strength.append(dots, el('strong', t(state.completed === 0 && word.reviews ? '重新巩固' : labels[state.level])));
  strength.title = t('根据连续记住的复习阶段估计，不代表准确记忆概率');
  const counter = el('span', t('进度 {done}/{total}', {done:state.completed,total:state.total}), 'memory-counter'); heading.append(strength,counter);
  const bar = el('div', '', 'memory-bar'); bar.setAttribute('role','progressbar'); bar.setAttribute('aria-label',t('复习阶段')); bar.setAttribute('aria-valuemin','0');bar.setAttribute('aria-valuemax',String(state.total));bar.setAttribute('aria-valuenow',String(state.completed));
  const fill = el('span'); fill.style.width = `${state.progress*100}%`;bar.append(fill);
  const due = el('p', dueText(state,now), `memory-due${state.ready ? ' due-now' : ''}`);
  panel.append(heading,bar,due);
  const details = el('details', '', 'memory-details'); details.open = expanded; details.append(el('summary',t('查看复习时间线')));
  details.append(el('p',t('间隔从上一次记住时起算；未来日期以每次都记住为前提。'), 'memory-help'));
  const timeline = el('ol', '', 'memory-timeline');
  for (const item of reviewPlan(word,now)) {
    const li = el('li','',item.status);
    const marker = el('span',item.status === 'completed' ? '✓' : String(item.index+1),'timeline-marker'); marker.setAttribute('aria-hidden','true');
    const body = el('div');body.append(el('strong',intervalText(item.gap)));
    body.append(el('small',item.status === 'completed' ? t('已完成') : `${item.status === 'current' ? t('下一次') : t('预计')} · ${dateText(item.date)}`));
    if (item.status === 'current') li.setAttribute('aria-current','step'); li.append(marker,body);timeline.append(li);
  }
  details.append(timeline);
  if (state.maintenance) details.append(el('p',t('已完成全部巩固阶段，之后每隔 120 天继续回忆。'),'memory-help'));
  if (word.lapses) details.append(el('p',t('重新巩固 {count} 次 · 忘记很正常，再回忆一次就好。',{count:word.lapses}),'memory-help'));
  const history = Array.isArray(word.history) ? word.history.slice(-5).reverse() : [];
  if (history.length) { const log = el('ul','','review-history');log.append(el('li',t('最近的复习记录'))); for (const h of history) log.append(el('li',`${dateText(h.at)} · ${h.rating === 'good' ? t('记住了') : t('再巩固一次')}`)); details.append(log); }
  panel.append(details); return panel;
}
function dayKey(date) { return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`; }
export function scheduleOverview(words, now = Date.now()) {
  const container = el('section','','schedule-overview');container.setAttribute('aria-label',t('复习日程'));
  const title = el('div','','schedule-heading');title.append(el('h3',t('复习日程')),el('span',t('到期优先，先回忆再揭晓')));container.append(title);
  const today = new Date(now), buckets=[];
  for(let i=0;i<7;i++){const date=new Date(today);date.setDate(today.getDate()+i);buckets.push({date,count:0});}
  let overdue=0;
  for(const w of words){if(w.due<=now){if(dayKey(new Date(w.due))!==dayKey(today))overdue++;buckets[0].count++;}else{const bucket=buckets.find(b=>dayKey(b.date)===dayKey(new Date(w.due)));if(bucket)bucket.count++;}}
  const days=el('div','','schedule-days');
  buckets.forEach((b,i)=>{const cell=el('div','',`schedule-day${i===0?' today':''}`);cell.append(el('small',i===0?t('今天'):b.date.toLocaleDateString(locale(),{month:'short',day:'numeric'})),el('strong',String(b.count)),el('span',t('条待复习')));days.append(cell);});container.append(days);
  const next = words.filter(w=>w.due>now).sort((a,b)=>a.due-b.due)[0];
  if(overdue)container.append(el('p',t('今天包含此前到期的 {count} 条，无需补做多轮，先从当前这次开始。',{count:overdue}),'memory-help'));
  if(next)container.append(el('p',t('最近一次安排：{date}',{date:dateText(next.due)}),'memory-help'));
  const rules=el('details','','schedule-rules');rules.append(el('summary',t('间隔复习如何安排？')));
  rules.append(el('p',t('先主动回忆一次，再依次间隔 1、3、7、14、30、60、120 天。记住了才进入下一阶段；忘记了，10 分钟后重新开始巩固。')));
  rules.append(el('p',t('这是基于间隔重复的实用日程，并非人人通用的固定遗忘曲线。掌握程度来自自评记录，不是记忆概率。')));
  container.append(rules);return container;
}
