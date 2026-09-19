import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://yunnalab.github.io",
    title: "云雨桐's Blog",
    description: "我将在终末抵达世界边境",
    author: "云雨桐",
    profile: "undefined",
    ogImage: "default-og.jpg",
    lang: "zh",
    timezone: "Asia/Shanghai",
    dir: "ltr",
  },
  posts: {
    perPage: 6,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  // 动态(说说):留言式的短内容流
  moments: {
    perIndex: 10,
    perPage: 10,
    // 新发布的文章自动同步到动态流
    syncPosts: true,
    avatar: "/avatar.jpg",
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: false,
    },
    search: false,
  },
  socials: [
    { name: "github",   url: "https://github.com/Yunnalab" },
  ],
  shareLinks: [
    { name: "telegram", url: "https://t.me/alaways_hopeful" },
  ],
});