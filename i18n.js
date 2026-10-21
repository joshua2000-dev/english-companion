(() => {
  const en = {
    '尚未学习': 'Not started', '初步记住': 'Starting to stick', '正在巩固': 'Building memory', '比较熟悉': 'Familiar', '较牢固': 'Well reinforced', '重新巩固': 'Rebuilding memory',
    '根据连续记住的复习阶段估计，不代表准确记忆概率': 'Estimated from consecutive remembered stages, not a measured recall probability',
    '间隔 {days} 天': 'After {days} days', '间隔 1 天': 'After 1 day', '主动回忆': 'Initial recall', '下次复习：{date}': 'Next review: {date}',
    '已逾期 {days} 天 · 现在可以复习': '{days} days overdue · Ready to review', '已到复习时间 · 现在可以复习': 'Review is due · Ready now', '现在可以复习': 'Ready to review',
    '复习进度与掌握程度': 'Review progress and memory strength', '进度 {done}/{total}': 'Progress {done}/{total}', '复习阶段': 'Review stages', '查看复习时间线': 'View review timeline',
    '间隔从上一次记住时起算；未来日期以每次都记住为前提。': 'Intervals start from the previous successful recall. Future dates assume you remember at every review.',
    '已完成': 'Completed', '下一次': 'Next', '预计': 'Planned', '已完成全部巩固阶段，之后每隔 120 天继续回忆。': 'All consolidation stages completed. Continue recalling every 120 days.',
    '重新巩固 {count} 次 · 忘记很正常，再回忆一次就好。': 'Relearning rounds: {count} · Forgetting is normal. Give recall another try.',
    '最近的复习记录': 'Recent review history', '记住了': 'Remembered', '再巩固一次': 'Relearn', '复习日程': 'Review schedule', '到期优先，先回忆再揭晓': 'Due first. Recall before revealing.',
    '今天': 'Today', '条待复习': 'to review', '今天包含此前到期的 {count} 条，无需补做多轮，先从当前这次开始。': 'Today includes {count} previously due items. Resume with one review per item.',
    '最近一次安排：{date}': 'Next scheduled review: {date}', '间隔复习如何安排？': 'How are reviews scheduled?',
    '先主动回忆一次，再依次间隔 1、3、7、14、30、60、120 天。记住了才进入下一阶段；忘记了，10 分钟后重新开始巩固。': 'Recall once, then wait 1, 3, 7, 14, 30, 60 and 120 days between reviews. Advance when remembered; if forgotten, restart consolidation in 10 minutes.',
    '这是基于间隔重复的实用日程，并非人人通用的固定遗忘曲线。掌握程度来自自评记录，不是记忆概率。': 'This is a practical spaced-repetition schedule, not a universal forgetting curve. Memory strength reflects self-reported reviews, not a recall probability.',
    '这条生词已被删除，请刷新页面': 'This expression was deleted. Refresh the page', '尚未到复习时间，请按日程复习': 'This review is not due yet. Follow the schedule',
    '拾词': 'Word Companion', '生词本 ↗': 'Vocabulary ↗', '让每一次阅读，': 'Make every read', '都有新的收获。': 'a chance to learn.',
    '选中网页里的单词、词组或句子，即刻翻译并收藏。': 'Select words, phrases or sentences on a webpage to translate and save them.',
    '开启网页划词翻译': 'Enable selection translation', '翻译方向': 'Translation direction', '默认翻译方向': 'Default translation direction',
    '自动识别 · 中英互译': 'Auto · Chinese ↔ English', '译为中文': 'Translate into Chinese', '译为英文': 'Translate into English',
    '也可以在这里输入，开始翻译…': 'Enter text here to translate…', '翻译文本 →': 'Translate →', '＋ 加入生词本': '＋ Save to vocabulary', '⚙ 模型与 API 设置': '⚙ Model & API settings',
    '▤　我的生词本': '▤　My vocabulary', '◷　每日复习': '◷　Daily review', '⚙　模型设置': '⚙　Model settings',
    '把偶然遇见的词，': 'Words you discover,', '变成熟悉的表达。': 'expressions you remember.', '你的私人英语学习空间': 'Your personal English learning space',
    '我的学习空间': 'My learning space', '一点一滴，自有收获': 'Small steps, lasting progress', '阅读中遇见，记忆中留下': 'Discovered in reading. Kept in memory',
    '收藏值得记住的每一个单词、词组和句子。': 'Collect every word, phrase and sentence worth remembering.', '↓ 导出生词': '↓ Export vocabulary',
    '累计收藏': 'Saved expressions', '每一个词，都是新的可能': 'Every word opens a new possibility', '今日待复习': 'Due for review', '温故，让记忆更牢固': 'Revisit to remember',
    '已复习次数': 'Total reviews', '积累属于你的进步': 'Build on your progress', '全部收藏': 'All expressions', '搜索原文或译文…': 'Search expressions or translations…', '搜索生词': 'Search vocabulary',
    '给记忆一点时间。': 'Give your memory a moment.', '先回想，再揭晓。记住的内容会在更久之后与你重逢。': 'Recall first, then reveal. Familiar expressions return at longer intervals.',
    '选择你的语言伙伴。': 'Choose your language companion.', '连接自己的模型，在阅读时获得更贴心的解释。': 'Connect your own model for helpful explanations as you read.',
    '模型服务': 'Model provider', '智谱 · GLM': 'Zhipu · GLM', '本地模型 · Ollama': 'Local model · Ollama', '自定义 · OpenAI 兼容接口': 'Custom · OpenAI-compatible',
    'API 地址': 'API endpoint', '填写完整的 Chat Completions 地址，包括 /chat/completions。': 'Enter the full Chat Completions URL, including /chat/completions.',
    '模型名称': 'Model name', '服务商提供的模型 ID': 'Model ID supplied by your provider', '输入你的 API Key': 'Enter your API key', '显示': 'Show', '隐藏': 'Hide',
    '密钥仅保存于当前浏览器本地，不参与同步和生词导出。翻译时，选中的文本会直接发送到你配置的服务商。请勿在共享设备上保存密钥。': 'Your key stays in this browser and is excluded from sync and exports. Selected text is sent directly to your configured provider for translation. Avoid saving keys on shared devices.',
    '保存设置': 'Save settings', '测试已保存的配置': 'Test saved configuration', '正在翻译…': 'Translating…', '已在生词本中': 'Already saved', '✓ 已收藏': '✓ Saved',
    '还没有找到这个表达': 'No matching expressions', '你的词汇旅程，从一次划选开始': 'Your vocabulary journey starts with a selection', '试试其他关键词。': 'Try another search.',
    '先在模型设置中填写 API Key，再打开网页划选文字。\n你收藏的词语和句子，会在这里安家。': 'Add your API key in Model settings, then select text on a webpage.\nYour saved words and sentences will appear here.',
    '用法与例句': 'Usage & examples', '阅读原文 ↗': 'Read original ↗', '删除': 'Delete', '删除“{text}”？': 'Delete “{text}”?',
    '{date} 收藏 · 已复习 {count} 次': 'Saved {date} · Reviewed {count} times', '今天的复习已完成。': 'All caught up for today.', '先收藏第一个表达吧。': 'Save your first expression.',
    '记忆正在慢慢生长。到期的内容会出现在这里。': 'Your memory is growing. Expressions appear here when due.', '在网页上划选文字，翻译后点击“加入生词本”。': 'Select text on a webpage, translate it, then choose “Save to vocabulary”.',
    '待复习 {count} 条 · 先试着回想它的含义': '{count} due · Try to recall the meaning first', '揭晓答案': 'Reveal answer', '还没记住 · 10 分钟后': 'Again · in 10 minutes', '记住了 · 延长间隔': 'Remembered · extend interval',
    '已切换服务商，请填写对应密钥并保存。': 'Provider changed. Enter its API key and save.', '✓ 设置已保存。回到网页即可开始划词翻译。': '✓ Settings saved. Return to a webpage to translate selections.',
    '正在测试已保存的配置…': 'Testing saved configuration…', '✓ 连接成功：{text}': '✓ Connected: {text}',
    '✦ 拾词 · 中英互译': '✦ Word Companion · Translate', '拾词翻译': 'Word Companion translation', '关闭': 'Close', '重试': 'Retry', '打开设置': 'Open settings',
    '请点击工具栏插件图标打开设置': 'Click the extension toolbar icon to open settings', '界面语言': 'Interface language',
    '请先设置模型名称': 'Set a model name first', '请先在模型设置中填写 API Key': 'Add your API key in Model settings first', '请选择或输入 1–6000 个字符': 'Select or enter 1–6000 characters',
    'API Key 无效或已过期': 'Your API key is invalid or expired', '接口拒绝访问，请检查权限或余额': 'Access denied. Check permissions or balance', '请求过于频繁或额度不足，请稍后再试': 'Rate limit or quota exceeded. Try again later',
    '翻译超时，请稍后重试或更换模型': 'Translation timed out. Retry or choose another model', '无法连接模型接口，请检查地址、网络及本地服务': 'Cannot connect. Check the endpoint, network and local service',
    '返回格式不兼容，请使用 Chat Completions 文本模型': 'Incompatible response. Use a Chat Completions text model', '模型返回了空内容': 'The model returned an empty response',
    '请完整填写接口地址和模型名称': 'Enter the endpoint and model name', '接口地址不能包含账号、查询参数或锚点': 'The endpoint cannot contain credentials, query parameters or fragments',
    '请使用 HTTPS 地址；本地模型可使用 localhost HTTP': 'Use HTTPS, or localhost HTTP for a local model', '此操作仅允许在插件页面使用': 'This action is available only on extension pages',
    '插件连接已断开，请重新打开页面': 'Extension disconnected. Reopen this page', '收藏内容无效': 'Invalid vocabulary entry', '未知操作': 'Unknown action',
    '。': '.'
  };
  let language = 'zh';
  const originals = new WeakMap();
  function t(text, values = {}) {
    let result = language === 'en' ? (en[text] || text) : text;
    for (const [key, value] of Object.entries(values)) result = result.replaceAll(`{${key}}`, String(value));
    return result;
  }
  function setLanguage(value) { language = value === 'en' ? 'en' : 'zh'; }
  function translateDocument() {
    document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement.closest('script,style,textarea,[data-user-content],#wordList,#reviewCard,#result,#status,#settingsStatus,#globalStatus')) continue;
      const original = originals.get(node) ?? node.textContent;
      if (en[original.trim()]) { originals.set(node, original); node.textContent = original.replace(original.trim(), t(original.trim())); }
    }
    document.querySelectorAll('[placeholder],[aria-label]').forEach(e => {
      for (const attr of ['placeholder', 'aria-label']) {
        if (!e.hasAttribute(attr)) continue;
        const key = `data-original-${attr}`;
        const original = e.getAttribute(key) || e.getAttribute(attr);
        if (en[original]) { e.setAttribute(key, original); e.setAttribute(attr, t(original)); }
      }
    });
    document.title = language === 'en' ? 'Word Companion' : '拾词 · 我的学习空间';
  }
  function languageControl(container, onChange) {
    const select = document.createElement('select'); select.className = 'language-select'; select.setAttribute('aria-label', '界面语言');
    for (const [value, text] of [['zh', '中文'], ['en', 'English']]) { const option = document.createElement('option'); option.value = value; option.textContent = text; select.append(option); }
    select.value = language; select.onchange = () => onChange(select.value); container.append(select); return select;
  }
  globalThis.CompanionI18n = { t, setLanguage, translateDocument, languageControl, get language() { return language; } };
})();
