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
