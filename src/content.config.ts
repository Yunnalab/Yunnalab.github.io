import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import config from "@/config";

export const BLOG_PATH = "src/content/posts";
export const MOMENTS_PATH = "src/content/moments";

const posts = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${BLOG_PATH}` }),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(config.site.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image().or(z.string()).optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      hideEditPost: z.boolean().optional(),
      timezone: z.string().optional(),
    }),
});

// 动态(类似 QQ 空间的说说),比文章更短、更随性
const moments = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${MOMENTS_PATH}` }),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(config.site.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      // 动态一般没有标题,需要时再填
      title: z.string().optional(),
      // 位置、心情等 QQ 空间式的小标签
      location: z.string().optional(),
      mood: z.string().optional(),
      tags: z.array(z.string()).default([]),
      // 配图(九宫格),支持相对路径与 public 下的绝对路径
      images: z.array(image().or(z.string())).optional(),
      // 置顶
      pinned: z.boolean().optional(),
      draft: z.boolean().optional(),
      timezone: z.string().optional(),
    }),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    ogImage: z.string().optional(),
    canonicalURL: z.string().optional(),
  }),
});

export const collections = { posts, moments, pages };
