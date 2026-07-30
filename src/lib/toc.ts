export type Heading = { id: string; text: string; level: number };

/**
 * 从渲染后的文章 HTML 提取 h2/h3 标题（id + 文本 + 层级）。
 * 标题由 rehype-slug（加 id）+ rehype-autolink-headings（wrap 成 <a>）生成，
 * 格式固定：<h2 id=".."><a class="heading-anchor" href="#..">文本</a></h2>
 *
 * 服务端调用 —— TOC 内容直接进 SSG HTML，不依赖 client JS 读 DOM。
 * 标题可能含行内 HTML（行内代码、<em>），用非贪婪 [^]*? 匹配后去标签。
 */
export function extractHeadings(html: string): Heading[] {
  const re = /<(h[23])\s+id="([^"]+)"><a[^>]*>([\s\S]*?)<\/a><\/\1>/g;
  const headings: Heading[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    // 去掉行内 HTML 标签（如 <code>、<em>），只保留纯文本
    const text = m[3].replace(/<[^>]+>/g, "");
    headings.push({
      level: m[1] === "h2" ? 2 : 3,
      id: m[2],
      text,
    });
  }
  return headings;
}
