# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

Aaron 的个人学习博客(技术型 PM 视角)。Next.js **App Router** + **纯 Markdown 文件**作为唯一数据源,无数据库、无 API route、无 CMS。所有页面静态生成(SSG)。部署在 Vercel(项目名 `my-blog`,见 `.vercel/project.json`)。

## 常用命令

```bash
npm run dev      # 本地开发,默认 turbopack,http://localhost:3000
npm run build    # 生产构建(也是验证改动是否破坏构建的主要手段)
npm run start    # 跑构建产物
npx tsc --noEmit # 类型检查(tsconfig 已 noEmit,直接 npx tsc 也行)
```

仓库**没有 ESLint 和测试脚本**。验证一次改动是否安全:`npx tsc --noEmit` + `npm run build` 都通过即可。新增依赖后注意 `package.json` 无 lockfile 版本固定策略(next/rea­ct 用 `latest`/`^`)。

## 架构:Markdown → 页面的数据流

```
_posts/*.md  ──(fs + gray-matter)──▶  src/lib/api.ts        读取 frontmatter + 原文
                  ──(unified pipeline)──▶  src/lib/markdownToHtml.ts  原文 → HTML
                                                  ──▶  Server Component 渲染(<div dangerouslySetInnerHTML>)
```

- **文章即文件**:`_posts/<slug>.md` 的文件名就是 URL slug。新增文章 = 新增一个 md 文件,无需改任何代码。
- `src/lib/api.ts` 在构建时用 Node `fs` 同步读 `_posts/`,按 `date` 降序排序。
- 页面组件(`src/app/page.tsx`、`src/app/posts/[slug]/page.tsx`)都是 **Server Component**,直接调用 `api.ts`,数据不经过客户端。
- `posts/[slug]/page.tsx` 用 `generateStaticParams` 预渲染所有文章页。

### Markdown 渲染管线(`src/lib/markdownToHtml.ts`)

`remark-parse → remark-gfm → remark-rehype → rehype-slug → rehype-autolink-headings → rehype-pretty-code → rehype-stringify`

两个关键依赖点,改管线时别破坏:
- **`rehype-slug`** 给 `h2`/`h3` 生成 `id` —— TOC 组件靠抓 `.prose` 内的 `h2,h3` 的 `id` 来生成目录。去掉 slug → TOC 失效。
- **`rehype-prettyCode`(Shiki)输出双主题**:`theme: { dark: "github-dark-dimmed", light: "github-light" }`,生成两套带 `data-theme` 属性的 token span。CSS 里靠 `:root.dark .prose pre [data-theme="dark"]` / `:root.light ...[data-theme="light"]` 只显示当前主题那套。改代码块样式务必同时照顾两套主题。

## 设计系统:样式约定

**Tailwind 已安装但基本不用** —— `tailwind.config.ts` 存在,但所有组件样式几乎都走 `src/app/globals.css` 里的自定义语义 class(`.hero`、`.card`、`.prose`、`.toc`、`.featured` 等)。

- **改样式的默认去向是 `globals.css` 的设计 token**,不要新引入 Tailwind 工具类,以免风格分裂。
- 颜色/表面/文字色全部是 CSS variables,按主题分组定义在 `globals.css` 顶部:
  - `:root, :root.dark` —— 暗色(默认),原色。
  - `:root.light` —— 亮色,同色相、提亮度降饱和。
  - 四个语义色 token:`--magenta`(主)/`--blue`/`--yellow`/`--green`。
- 改一个颜色:通常改 CSS variable 即可全站联动,不必逐处改。

### 暗色/亮色主题切换

- `tailwind.config.ts` 设 `darkMode: "class"`,但切换逻辑是手写的。
- **防闪烁**:`src/app/layout.tsx` 的 `<head>` 里有内联脚本,在 React 水合前就读 `localStorage.theme`(无则跟随 `prefers-color-scheme`),给 `<html>` 加 `.dark` 或 `.light` class。改主题逻辑时**必须同步这个内联脚本和 `ThemeToggle` 组件**(`src/app/_components/theme-toggle.tsx`),否则会闪屏或状态不一致。
- `<html>` 上有 `suppressHydrationWarning`,因为 class 由内联脚本提前写入。

## Tag 类型系统(改 tag 需三处联动)

`src/interfaces/post.ts` 里 `Tag` 是**固定联合类型**:`"智能体" | "LLM 基础" | "产品方法论" | "实战工程"`。每个 tag 映射到一个 CSS class。**新增一个 tag 必须同时改三处**,漏一处会导致类型/样式错乱:

1. `src/interfaces/post.ts` —— `Tag` 联合类型加新值
2. `src/app/_components/tag-badge.tsx` —— `cls` 判断分支
3. `src/app/globals.css` —— 对应 `.tag-xxx` class(背景/文字色,参考现有 `.tag-agent` 等)

## Post frontmatter 字段

`_posts/*.md` 顶部 frontmatter(`gray-matter` 解析),字段对应 `src/interfaces/post.ts` 的 `Post` 类型:

| 字段 | 必填 | 作用 |
|---|---|---|
| `title` / `excerpt` | 是 | 标题、摘要(摘要同时用作 meta description) |
| `date` | 是 | `"YYYY-MM-DD"`,用于排序 |
| `coverImage` / `ogImage.url` | 是 | 封面图,放 `/public/assets/blog/<slug>/cover.jpg` |
| `author` | 是 | `{ name, picture }`,picture 指向 `/public/assets/blog/authors/*.jpeg` |
| `tags` | 否 | tag 数组,值必须属于 `Tag` 联合类型 |
| `featured` | 否 | `true` 时在首页 FeaturedPost 区置顶(首页取**第一个** featured,无则取最新一篇) |
| `toc` | 否 | `false` 时隐藏详情页目录与三栏布局;省略默认显示 |
| `readingTime` | 否 | 显示在文章 meta 的阅读时长字符串 |

注意:详情页作者信息目前**写死为 Aaron**(`posts/[slug]/page.tsx` 里 author-card),未真正使用 frontmatter 的 `author` 字段。

## 详情页布局(`posts/[slug]/page.tsx`)

- `toc !== false` 时是**三栏 grid**:`TOC 侧栏(220px,sticky)` + `正文(.prose,720px)` + `留白(1fr)`。`toc: false` 退化为单栏居中。
- **TOC 是客户端组件**(`table-of-contents.tsx`),运行时从渲染后的 `.prose` DOM 里抓 `h2,h3`(依赖 `rehype-slug` 的 id),用 `IntersectionObserver` 做 scroll-spy 高亮。没有 h2/h3 时 TOC 自动隐藏。
- `ReadingProgress` 是顶部固定进度条。
- 响应式:≤1024px 隐藏 TOC,≤860px 卡片网格变单列。

## 路径别名与资源

- TypeScript 别名:`@/* → ./src/*`(`tsconfig.json`),import 一律用 `@/...`。
- 静态资源在 `public/`:文章封面 `public/assets/blog/<slug>/`、作者头像 `public/assets/blog/authors/`、favicon 在 `public/favicon/`。
- `design/` 目录是设计阶段的 HTML 原型(`variant-a/b.html`、`post-detail*.html`),**不参与构建**,仅作设计参考。globals.css 的设计系统就是从这些原型移植来的。
