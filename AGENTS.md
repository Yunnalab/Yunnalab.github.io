## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## 动态(moments)系统

站内有两类内容:

| 内容 | 位置 | 说明 |
|------|------|------|
| 文章 | `src/content/posts/` | 长文,渲染在 `/posts/<slug>` |
| 动态 | `src/content/moments/` | 说说式短内容,渲染在首页与 `/moments` |

关键实现:

- `src/utils/getFeedItems.ts` — 把「手写动态」和「文章同步动态」合并成一条时间流
  (置顶优先、时间倒序)。`moments.syncPosts` 为 true 时,文章会自动以
  「发布了新文章《…》」的卡片出现在动态里,无需手工登记。
- `src/components/MomentCard.astro` — 单条动态卡片(头像/相对时间/心情/位置/九宫格配图/文章链接卡)。
- `src/components/MomentFeed.astro` — 动态列表,含每 60 秒刷新「x 分钟前」的客户端脚本。
- `src/content/moments/` — 动态内容,发布方式与文章一致:新建/编辑 Markdown 文件
  并提交。**网页端不提供任何发布入口**(纯静态站点无法做真正的鉴权),
  因此只有能往仓库提交的人才能发布动态。完整写法见该目录下的 `_README.md`。
- 配置在 `astro-paper.config.ts` 的 `moments` 字段(条数、是否同步文章、头像)。
- 动态正文样式类 `.moment-body` 定义在 `src/styles/global.css`。
- 日期时间统一在 `src/content.config.ts` 的 `siteDatetime()` 里归一:frontmatter 只写日期时
  YAML 会解析成 **UTC 零点**(东八区一显示就成了 08:00、并整体偏移 8 小时),这里按
  `config.site.timezone` 的零点重新解释。`src/utils/formatMomentTime.ts` 的 `isDateOnly()`
  判定这类条目,展示层对它们**只显示日期**、不显示相对时间;改日期逻辑时别破坏这两点。

UI 文案在 `src/i18n/lang/` 下,当前默认语言(见 `astro.config.ts` 的 `i18n.defaultLocale`)为 `zh`。

## 数学公式(KaTeX)

公式在**构建期**由 `remark-math` + `rehype-katex` 渲染成静态 HTML,没有客户端 JS。
插件接在 `astro.config.ts` 的 `markdown.processor` 上,排版样式与字体来自
`src/styles/global.css` 里 `@import "katex/dist/katex.min.css"`。

写公式时的约定:

- 行内公式 `$...$`,块级公式 `$$...$$`。
- 块级公式要**自己占一整行**(`$$公式$$` 单独一行也可以,由 `src/utils/remarkBlockMath.ts`
  提升成块级);夹在句子中间的 `$$…$$` 仍按行内公式排版。
- 正文里的美元符号必须转义成 `\$`(如 `\$10`、`\$50,000`),否则会被当成公式定界符,
  甚至跨行把后面的文字一起吞进公式。
- 表格单元格里的公式要把竖线写成 `\lvert` / `\rvert`(或 `\vert`);直接写 `|` 会被 GFM
  当成单元格分隔符,把公式和整行表格一起切坏(例如 `$\varphi(x)=|x|$`)。

改完 remark/rehype 插件后要删掉 Astro 的内容缓存再构建,否则旧文章的 markdown 不会重渲染:

```bash
rm -rf node_modules/.astro && pnpm run build
```

## 字体

中英文分工(token 在 `src/styles/theme.css`):

| token | 值 | 用在哪 |
|---|---|---|
| `--font-latin` | Bitter(板衬线) | 拉丁正文/UI(`--font-app` 第一位) |
| `--font-display` | Zilla Slab(板衬线) | 拉丁标题(`--font-heading`,由 `global.css` 的 `h1..h6` 规则套用) |
| `--font-cjk` | LXGW WenKai 霞鹜文楷(楷体) | 中文字形 |

- 拉丁字体在 `public/fonts/`(`@font-face` 写在 `src/styles/global.css`),按 latin / latin-ext
  子集 + `unicode-range` 自托管,只有真正用到才下载。
- **中文字体是分片的**:`public/fonts/lxgw-wenkai/`(`lxgw-wenkai.css` + `files/` 下 194 个
  woff2 分片,Regular/Bold 各 97 个,来自 npm 包 `lxgw-wenkai-webfont@1.7.0`,OFL-1.1)。
  该 CSS 由 `src/layouts/Layout.astro` 与 `DocsLayout.astro` 用 `<link>` 引入,**不经过**
  `global.css`——200KB 的 unicode-range 规则不适合塞进主 CSS。一篇长文实际只下载 1–2MB 分片。
- `public/fonts/NotoSansSC-Regular.otf`(8MB)**只给构建期 OG 图用**(satori 只吃 otf/ttf),
  故意没有 `@font-face`;写成 @font-face 会让浏览器为了回退白下 8MB。satori 读它的位置:
  `src/pages/og.png.ts`、`src/pages/posts/[...slug]/index.png.ts`。
- JetBrains Mono 是 woff2(`.ttf` 已删),接在字体链尾部兜住 √、α、β 这类符号。
- 换字体:拉丁改 `public/fonts/` + `global.css` 的 `@font-face` + `theme.css` 两行 token;
  中文替换 `public/fonts/lxgw-wenkai/` 整个目录,并同步 `Layout.astro`/`DocsLayout.astro` 的 link。
- 楷体字面比黑体小约 5%,所以同样的字号看着略小;要补偿就在 `--font-app` 使用处加字号,
  别改 `--font-cjk` 里的字体名顺序。
