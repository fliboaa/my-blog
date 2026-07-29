import { Post } from "@/interfaces/post";
import fs from "fs";
import matter from "gray-matter";
import { join } from "path";

const postsDirectory = join(process.cwd(), "_posts");

// Post 类型中的必填字段;frontmatter 缺这些会导致渲染异常或排序错乱
const REQUIRED_FIELDS = [
  "title",
  "date",
  "excerpt",
  "coverImage",
  "author",
  "ogImage",
] as const;

export function getPostSlugs() {
  // 只读 .md 文件，忽略目录里的 .DS_Store / 草稿等非 md 文件，
  // 否则 readdirSync 会把任意文件喂给 getPostBySlug，导致构建挂掉
  return fs.readdirSync(postsDirectory).filter((slug) => slug.endsWith(".md"));
}

export function getPostBySlug(slug: string): Post {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(postsDirectory, `${realSlug}.md`);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Post not found: _posts/${realSlug}.md`);
  }
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  // 校验必填 frontmatter：以前用 `{ ...data } as Post` 强制断言，
  // 缺字段时 tsc 查不出，运行/构建期才崩。这里提前拦截并给出明确错误。
  const missing = REQUIRED_FIELDS.filter((key) => data[key] === undefined);
  if (missing.length > 0) {
    throw new Error(
      `Missing frontmatter in _posts/${realSlug}.md: ${missing.join(", ")}`,
    );
  }

  return {
    slug: realSlug,
    title: data.title,
    date: data.date,
    coverImage: data.coverImage,
    author: data.author,
    excerpt: data.excerpt,
    ogImage: data.ogImage,
    content,
    preview: data.preview,
    tags: data.tags,
    readingTime: data.readingTime,
    featured: data.featured,
    toc: data.toc,
  };
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    // sort posts by date in descending order；同日期返回 0 保证排序稳定
    .sort((post1, post2) => {
      if (post1.date > post2.date) return -1;
      if (post1.date < post2.date) return 1;
      return 0;
    });
  return posts;
}
