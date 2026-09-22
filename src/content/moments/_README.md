# 动态(moments)

这里存放「说说」式短内容。放进本目录的 `*.md` / `*.mdx` 都会出现在
首页动态流与 `/moments` 页面;文件名以下划线 `_` 开头的文件会被忽略(如本文件)。

**发布方式和写文章一样**:新建/编辑一个 Markdown 文件 → `git commit` → 推送,
云端重新构建后上线。网页端不提供发布入口,所以只有能往仓库提交的人才能发布动态。

## 写法

```md
---
pubDatetime: 2026-09-19T21:30:00+08:00
location: 南京 # 可选
mood: "☕" # 可选
tags: [日常] # 可选
pinned: true # 可选,置顶
images: # 可选,九宫格配图
  - "./media/photo-1.jpg"
  - "./media/photo-2.jpg"
---

正文随便写,支持 Markdown。
```

- `pubDatetime` 是唯一必填项。写未来时间即为「定时动态」,到点后自动上线
  (本地开发环境始终可见,方便预览)。
- **时间写多细,决定怎么显示**:
  - 写了完整时间(带时区,如 `2026-09-22T11:00:00+08:00`)→ 24 小时内显示「刚刚 / X 分钟前 /
    X 小时前」,超过 24 小时显示具体日期时间;
  - 只写日期(如 `2026-09-22`)→ 按站点时区的当天零点处理,**只显示日期**,
    不会出现时刻或「X 小时前」(时间没写,不能编)。
  - 全部按 `config.site.timezone`(当前 `Asia/Shanghai`)显示。
- 配图放在与本文件同级的 `media/` 目录里,用相对路径引用;
  也可以直接写 `/public` 下的绝对路径(如 `/avatar.jpg`)。
  1 张图显示为大图,2/4 张两列,其余三列。
- 想同步到动态的文章:不需要任何额外操作,`astro-paper.config.ts` 里
  `moments.syncPosts` 为 `true` 时,文章会自动以「发布了新文章」的卡片出现在动态流中。
- `draft: true` 只在本地可见,不会进入线上构建。

## 相关代码

- 动态流合并逻辑:`src/utils/getFeedItems.ts`
- 卡片样式:`src/components/MomentCard.astro`,正文排版类 `.moment-body`(在 `src/styles/global.css`)
