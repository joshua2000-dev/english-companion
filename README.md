# 拾词 · English Companion

无需构建、无需安装依赖的 Chrome Manifest V3 扩展。

## 安装

1. 在 Chrome 地址栏打开 `chrome://extensions`。
2. 开启右上角「开发者模式」。
3. 点击「加载已解压的扩展程序」，选择本项目目录（包含 manifest.json 的文件夹）。
4. 将「拾词」固定到工具栏，点击图标 →「模型与 API 设置」。
5. 选择服务商，填写 API Key、完整接口地址和模型名称，保存后测试连接。
6. 刷新已打开的普通网页，划选文字即可翻译。

## 使用

- 网页划选单词、词组或句子会自动中英互译，可收藏到生词本。支持 Shift + 方向键选中文字后松开 Shift。
- Esc 或点击弹窗外关闭翻译卡；输入框、编辑区不触发划词。
- 工具栏弹窗支持手动输入翻译、调整方向和暂停划词。
- 生词本支持原文/译文搜索、查看例句、来源跳转和删除。
- 每日复习先显示原文，揭晓答案后选择「还没记住」或「记住了」。记住后的间隔为 1、3、7、14、30、60、120 天；没记住则 10 分钟后复习。新收藏立即进入复习。
- 导出生成 JSON，包含学习内容和复习记录，不含 API Key。当前版本不含导入功能。

## 模型配置

预置 DeepSeek、智谱、OpenAI、Ollama；可改为任意提供 OpenAI 兼容 `POST /chat/completions` 接口的文本模型服务，包括托管开源模型。

填写**完整地址**，不是只填域名或 `/v1`。模型名称必须使用账户实际可用的模型 ID；预置名称仅为起点，供应商可能调整可用模型。

- DeepSeek：`https://api.deepseek.com/chat/completions`
- 智谱：`https://open.bigmodel.cn/api/paas/v4/chat/completions`
- OpenAI：`https://api.openai.com/v1/chat/completions`
- Ollama：`http://localhost:11434/v1/chat/completions`，模型名填写本地已安装的模型；可留空 Key。需要本地服务允许运行中的扩展来源访问。

原生 Anthropic、Gemini 等非 Chat Completions 协议需要兼容网关；仅有 API Key 不能自动兼容所有协议。接口超时为 25 秒，单次输入最多 6000 字符。连接测试会向已保存的服务发送一条短翻译请求，可能产生少量费用。

## 数据与隐私

密钥与生词保存在 `chrome.storage.local`，不上传到本产品服务器、不启用云同步。密钥存储限定插件可信上下文，网页脚本无法直接读取。密钥并非加密保险库，具有本机浏览器访问权限的人仍可能读取；共享设备请清空 Key 并保存。翻译时只向配置的 API 发送选中文字，不发送整页、网页来源或生词本。来源记录只存 origin + pathname，不含查询参数和锚点。

插件需要普通网页内容脚本来读取划选，以及 HTTPS 接口访问权限来支持自定义服务。Chrome 内置页面、Chrome 网上应用店、内置 PDF 阅读器等受限制页面不支持网页划词，可使用工具栏手动翻译。更新扩展后需刷新网页。卸载扩展会清除本地数据，建议先导出。未上架 Chrome 网上应用店。

## 开发与验证

运行 `npm test`（Node 20+）。测试覆盖 URL 校验、模型响应解析、复习调度、密钥访问限制、并发收藏、重复收藏和模拟 API 请求。

可选浏览器检查：安装 Playwright 并运行 `node tests/browser-smoke.mjs`；优先使用本机 Chrome/Edge，也可通过 `CHROME_PATH` 指定可执行文件。该检查使用模拟 Chrome API 和模拟翻译结果，验证页面交互与内容脚本；不等同于加载真实扩展或连接真实模型。

手动验收：配置接口并测试 → 打开普通文章网页并刷新 → 划选英文/中文/词组/句子 → 收藏 → 搜索 → 复习揭晓与评分 → 导出 → 重启浏览器检查数据。再检查错误 Key、超时和停用划词。

参考：[Chrome storage](https://developer.chrome.com/docs/extensions/reference/api/storage)、[DeepSeek API](https://api-docs.deepseek.com/)、[智谱文档](https://docs.bigmodel.cn/)。
