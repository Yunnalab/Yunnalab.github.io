import type { CollectionEntry } from "astro:content";
import config from "@/config";

/**
 * 与 postFilter 规则一致:草稿永不展示,定时动态到点后才出现。
 */
export function momentFilter({ data }: CollectionEntry<"moments">) {
  const isPublishTimePassed =
    Date.now() >
    new Date(data.pubDatetime).getTime() - config.posts.scheduledPostMargin;
  return !data.draft && (import.meta.env.DEV || isPublishTimePassed);
}
