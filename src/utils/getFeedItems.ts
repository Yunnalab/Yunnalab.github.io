import { getCollection, type CollectionEntry } from "astro:content";
import type { ImageMetadata } from "astro";
import config from "@/config";
import { postFilter } from "./postFilter";
import { momentFilter } from "./momentFilter";
import { getPostUrl } from "./getPostPaths";
import { isDateOnly } from "./formatMomentTime";
import { slugifyStr } from "./slugify";

export interface FeedImage {
  src: string;
  alt: string;
}

export interface FeedItem {
  /** moment: 手写动态;post: 由文章自动同步过来的动态 */
  kind: "moment" | "post";
  id: string;
  /** 页面锚点 id(可直接 /moments#xxx 定位) */
  anchor: string;
  datetime: Date;
  author: string;
  title?: string;
  location?: string;
  mood?: string;
  tags: string[];
  images: FeedImage[];
  pinned: boolean;
  /** true = frontmatter 只写了日期,展示时不应出现「X 小时前」或具体时刻 */
  dateOnly: boolean;
  timezone?: string;
  /** 文章动态的简介 */
  excerpt?: string;
  /** 文章链接 */
  url?: string;
  /** 手写动态的原始条目(正文需要 render) */
  moment?: CollectionEntry<"moments">;
  post?: CollectionEntry<"posts">;
}

function resolveImages(images?: Array<ImageMetadata | string>): FeedImage[] {
  return (images ?? []).map(image =>
    typeof image === "string"
      ? { src: image, alt: "" }
      : {
          src: image.src,
          alt: "alt" in image && typeof image.alt === "string" ? image.alt : "",
        }
  );
}

function momentToFeedItem(moment: CollectionEntry<"moments">): FeedItem {
  const { data } = moment;
  return {
    kind: "moment",
    id: moment.id,
    anchor: slugifyStr(moment.id),
    datetime: data.pubDatetime,
    author: data.author,
    title: data.title,
    location: data.location,
    mood: data.mood,
    tags: data.tags,
    images: resolveImages(data.images),
    pinned: data.pinned ?? false,
    dateOnly: isDateOnly(
      data.pubDatetime,
      data.timezone ?? config.site.timezone
    ),
    timezone: data.timezone,
    moment,
  };
}

function postToFeedItem(post: CollectionEntry<"posts">): FeedItem {
  const { data } = post;
  return {
    kind: "post",
    id: post.id,
    anchor: slugifyStr(`post-${post.id}`),
    datetime: data.pubDatetime,
    author: data.author,
    title: data.title,
    tags: data.tags,
    images: [],
    pinned: false,
    dateOnly: isDateOnly(
      data.pubDatetime,
      data.timezone ?? config.site.timezone
    ),
    timezone: data.timezone,
    excerpt: data.description,
    url: getPostUrl(post.id, post.filePath, config.site.lang),
    post,
  };
}

/**
 * 动态流 = 手写动态 + 自动同步的文章动态,按时间倒序(置顶优先)。
 *
 * 文章同步:每次发布/修改文章都不需要额外操作,只要 `moments.syncPosts`
 * 为 true,文章就会以「发布了新文章《…》」的形式出现在动态里。
 */
export async function getFeedItems(): Promise<FeedItem[]> {
  const [moments, posts] = await Promise.all([
    getCollection("moments"),
    getCollection("posts"),
  ]);

  const items = moments.filter(momentFilter).map(momentToFeedItem);

  if (config.moments.syncPosts) {
    items.push(...posts.filter(postFilter).map(postToFeedItem));
  }

  return items.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.datetime.valueOf() - a.datetime.valueOf();
  });
}
