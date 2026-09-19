import type { UIStrings } from "../types";

export default {
  nav: {
    home: "首页",
    posts: "文章",
    tags: "标签",
    about: "关于",
    archives: "归档",
    search: "搜索",
    moments: "动态",
  },
  post: {
    publishedAt: "发布于",
    updatedAt: "更新于",
    sharePostIntro: "分享这篇文章:",
    sharePostOn: "分享到 {{platform}}",
    sharePostViaEmail: "通过邮件分享",
    tagLabel: "标签",
    backToTop: "回到顶部",
    goBack: "返回",
    editPage: "编辑页面",
    previousPost: "上一篇",
    nextPost: "下一篇",
  },
  pagination: {
    prev: "上一页",
    next: "下一页",
    page: "第",
  },
  home: {
    socialLinks: "社交链接",
    featured: "精选文章",
    recentPosts: "近期文章",
    allPosts: "全部文章",
    moments: "动态",
    allMoments: "全部动态",
  },
  moments: {
    pageTitle: "动态",
    pageDesc: "记录此刻的想法、碎片,以及每一篇新文章。",
    justNow: "刚刚",
    minutesAgo: "{{count}} 分钟前",
    hoursAgo: "{{count}} 小时前",
    pinned: "置顶",
    publishedPost: "发布了新文章",
    readPost: "阅读全文",
    empty: "还没有动态,来发第一条吧。",
  },
  footer: {
    copyright: "版权所有",
    allRightsReserved: "保留所有权利。",
  },
  pages: {
    tagTitle: "标签",
    tagDesc: "带有该标签的全部文章",

    tagsTitle: "标签",
    tagsDesc: "文章中出现的全部标签。",

    postsTitle: "文章",
    postsDesc: "我写下的全部文章。",

    archivesTitle: "归档",
    archivesDesc: "按时间归档的全部文章。",

    searchTitle: "搜索",
    searchDesc: "搜索任何文章…",
  },
  a11y: {
    skipToContent: "跳到正文",
    openMenu: "打开菜单",
    closeMenu: "关闭菜单",
    toggleTheme: "切换主题",
    searchPlaceholder: "搜索文章…",
    noResults: "没有找到结果",
    goToPreviousPage: "上一页",
    goToNextPage: "下一页",
  },
  notFound: {
    title: "404 未找到",
    message: "页面不存在",
    goHome: "返回首页",
  },
} satisfies UIStrings;
