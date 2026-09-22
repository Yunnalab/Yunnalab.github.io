import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import config from "@/config";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * 日期字段。
 *
 * frontmatter 只写日期时(如 `pubDatetime: 2026-09-22`),YAML 会把它解析成
 * **UTC 零点**,在东八区显示就变成 08:00 并整体偏移 8 小时。这里把这种值
 * 按站点时区(`config.site.timezone`)的零点重新解释,日期保持不变。
 * 写了完整时间戳(带时区)的值原样保留。
 */
function toSiteTimezoneIfDateOnly(value: unknown): unknown {
  const date = value instanceof Date ? value : new Date(String(value ?? ""));
  if (Number.isNaN(date.getTime())) return value;

  const isUtcMidnight =
    date.getTime() ===
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  if (!isUtcMidnight) return date;

  const ymd = dayjs.utc(date).format("YYYY-MM-DD");
  return dayjs.tz(`${ymd} 00:00:00`, config.site.timezone).toDate();
}

const siteDatetime = () => z.preprocess(toSiteTimezoneIfDateOnly, z.date());

export const BLOG_PATH = "src/content/posts";
export const MOMENTS_PATH = "src/content/moments";

const posts = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${BLOG_PATH}` }),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(config.site.author),
      pubDatetime: siteDatetime(),
      modDatetime: siteDatetime().optional().nullable(),
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
      pubDatetime: siteDatetime(),
      modDatetime: siteDatetime().optional().nullable(),
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
