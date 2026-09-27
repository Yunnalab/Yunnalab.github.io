import { defineConfig, envField, svgoOptimizer } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { unified } from "@astrojs/markdown-remark";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
// 数学公式:$...$ 行内、$$...$$ 独立成行(remark-math 解析,rehype-katex 在构建期渲染)
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeCallouts from "rehype-callouts";
import remarkBlockMath from "./src/utils/remarkBlockMath";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerFileName } from "./src/utils/transformers/fileName";
import config from "./astro-paper.config";

export default defineConfig({
  site: config.site.url,
  integrations: [
    mdx(),
    sitemap({
      filter: page =>
        config.features?.showArchives !== false || !page.endsWith("/archives/"),
    }),
  ],
  i18n: {
    locales: ["en", "zh"],
    // 站点语言与 astro-paper.config.ts 的 site.lang 一致:中文
    defaultLocale: "zh",
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkToc,
        [remarkCollapse, { test: "Table of contents" }],
        // remark-math 需在 remark-rehype 之前,由 Astro 的 processor 统一挂载
        remarkMath,
        // 把同一行的 $$公式$$ 提升为块级公式(须在 remark-math 之后)
        remarkBlockMath,
      ],
      rehypePlugins: [
        rehypeCallouts,
        [
          rehypeKatex,
          {
            // 中文公式里常有 CJK 字符与换行,关掉 strict 以免整篇构建报错
            strict: false,
            // 单条公式出错时渲染成红色文本,而不是让整站构建失败
            throwOnError: false,
            output: "htmlAndMathml",
          },
        ],
      ],
    }),
    shikiConfig: {
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },

  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
  experimental: {
    svgOptimizer: svgoOptimizer(),
  },
});
