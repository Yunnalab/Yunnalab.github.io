/**
 * remark 插件:把「独占一行的 $$公式$$」当作块级公式(display math)渲染。
 *
 * remark-math 只把下面这种写法识别成块级公式:
 * ```
 * $$
 * 公式
 * $$
 * ```
 * 而写成 `$$公式$$`(两个 $$ 在同一行)时,它会被解析成**行内公式**,
 * rehype-katex 也就按行内排版渲染 —— \lim 的下标跑到右下角、\frac 变成小号。
 * 更麻烦的是,`$$公式$$` 如果紧跟在上一行文字后面(中间没有空行),
 * 它还会被并进同一段,和前面的文字挤在一起。
 *
 * 本插件按源码判断:只要一条公式**自己占了一整行**、且用 `$$` 作定界符,
 * 就把所在的段落切开,把它换成真正的块级 `math` 节点,渲染结果与块级写法一致。
 * 句子中间的 `$$x$$`、表格单元格里的 `$$x$$` 不受影响,仍是行内公式。
 *
 * 需要排在 remark-math 之后(依赖它解析出的 inlineMath 节点)。
 */

type OffsetPosition = {
  start?: { offset?: number };
  end?: { offset?: number };
};

type AnyNode = {
  type: string;
  value?: string;
  children?: AnyNode[];
  position?: OffsetPosition;
};

/** 与 mdast-util-math 生成的块级公式节点保持一致的结构 */
function displayMathNode(value: string) {
  return {
    type: "math",
    meta: null,
    value,
    data: {
      // mdast-util-to-hast 依据 data.hName / hChildren 生成 <pre><code>
      hName: "pre",
      hChildren: [
        {
          type: "element",
          tagName: "code",
          properties: { className: ["language-math", "math-display"] },
          children: [{ type: "text", value }],
        },
      ],
    },
  };
}

/** 公式前后到行首/行尾只有空白(允许前面的列表标记、引用标记) */
function occupiesWholeLine(math: AnyNode, source: string) {
  const start = math.position?.start?.offset;
  const end = math.position?.end?.offset;
  if (start === undefined || end === undefined) return null;

  const raw = source.slice(start, end);
  const fence = /^\$+/.exec(raw)?.[0];
  if (!fence || fence.length < 2 || !raw.endsWith(fence)) return null;

  const lineStart = source.lastIndexOf("\n", start - 1) + 1;
  const lineEndRaw = source.indexOf("\n", end);
  const lineEnd = lineEndRaw === -1 ? source.length : lineEndRaw;

  const before = source
    .slice(lineStart, start)
    .replace(/^\s*(?:>\s*)*/, "")
    .replace(/^(?:[-*+]|\d+[.)])\s+/, "");
  const after = source.slice(end, lineEnd);

  return before.trim() === "" && after.trim() === "" ? raw : null;
}

function isBlank(node: AnyNode) {
  return node.type === "text" && (node.value ?? "").trim() === "";
}

export default function remarkBlockMath() {
  return (tree: AnyNode, file?: { value?: unknown }) => {
    const source = typeof file?.value === "string" ? file.value : "";
    if (!source) return;

    /** 切开段落:返回若干节点,或 null 表示无需改写 */
    const splitParagraph = (paragraph: AnyNode): AnyNode[] | null => {
      const children = paragraph.children;
      if (!children?.length) return null;

      const result: AnyNode[] = [];
      let buffer: AnyNode[] = [];
      let changed = false;

      const flush = () => {
        while (buffer.length && isBlank(buffer[0]!)) buffer.shift();
        while (buffer.length && isBlank(buffer[buffer.length - 1]!))
          buffer.pop();
        if (buffer.length) result.push({ ...paragraph, children: buffer });
        buffer = [];
      };

      for (const child of children) {
        if (child.type === "inlineMath" && occupiesWholeLine(child, source)) {
          flush();
          result.push(displayMathNode(child.value ?? ""));
          changed = true;
        } else {
          buffer.push(child);
        }
      }
      flush();

      return changed ? result : null;
    };

    // 公式可能嵌在列表项、引用块里,所以整棵树都要走一遍
    const walk = (node: AnyNode) => {
      if (!node.children) return;
      node.children = node.children.flatMap(child => {
        if (child.type === "paragraph") {
          return splitParagraph(child) ?? [child];
        }
        walk(child);
        return [child];
      });
    };

    walk(tree);
  };
}
