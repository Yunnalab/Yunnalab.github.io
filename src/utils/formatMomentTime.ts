import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import config from "@/config";
import { tplStr } from "@/i18n/format";

dayjs.extend(utc);
dayjs.extend(timezone);

export interface RelativeTimeLabels {
  justNow: string;
  minutesAgo: string;
  hoursAgo: string;
}

/**
 * 动态统一的时间显示(整张卡片只有这一处时间):
 * - 24 小时以内:「刚刚 / n 分钟前 / n 小时前」
 * - 超过 24 小时:回退成具体日期时间(如 2026年9月9日 08:00)
 *
 * 客户端脚本(MomentFeed)用同一格式重算,二者不会出现不一致。
 */
export function formatMomentTime(
  date: Date | string,
  locale: string = config.site.lang,
  labels?: RelativeTimeLabels,
  tz: string = config.site.timezone
): string {
  const target = dayjs(date).tz(tz);
  const now = dayjs().tz(tz);
  const diffSeconds = now.diff(target, "second");

  if (labels && diffSeconds >= 0) {
    if (diffSeconds < 60) return labels.justNow;

    const minutes = Math.floor(diffSeconds / 60);
    if (minutes < 60) return tplStr(labels.minutesAgo, { count: minutes });

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return tplStr(labels.hoursAgo, { count: hours });
  }

  return formatFullTime(date, locale, tz);
}

/**
 * 是否“只写了日期”(frontmatter 里没带时间)。
 *
 * 这类值在 schema 里已被归一到站点时区的零点,所以“恰好是当地零点”即视为
 * 无具体时间:此时不能显示「X 小时前」或具体时刻 —— 时间本来就没写,显示出来只能是编的。
 */
export function isDateOnly(
  date: Date | string,
  tz: string = config.site.timezone
): boolean {
  const target = dayjs(date).tz(tz);
  return (
    target.hour() === 0 &&
    target.minute() === 0 &&
    target.second() === 0 &&
    target.millisecond() === 0
  );
}

/** 只有日期的条目:只显示日期,不带时分 */
export function formatDateOnly(
  date: Date | string,
  locale: string = config.site.lang,
  tz: string = config.site.timezone
): string {
  return dayjs(date)
    .tz(tz)
    .format(
      locale.toLowerCase().startsWith("zh") ? "YYYY年M月D日" : "MMM D, YYYY"
    );
}

/** 完整日期时间,同时用作 <time title> 悬停提示 */
export function formatFullTime(
  date: Date | string,
  locale: string = config.site.lang,
  tz: string = config.site.timezone
): string {
  return dayjs(date)
    .tz(tz)
    .format(
      locale.toLowerCase().startsWith("zh")
        ? "YYYY年M月D日 HH:mm"
        : "MMM D, YYYY HH:mm"
    );
}
