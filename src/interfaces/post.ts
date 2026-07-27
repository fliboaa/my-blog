import { type Author } from "./author";

export type Tag = "智能体" | "LLM 基础" | "产品方法论" | "实战工程";

export type Post = {
  slug: string;
  title: string;
  date: string;
  coverImage: string;
  author: Author;
  excerpt: string;
  ogImage: {
    url: string;
  };
  content: string;
  preview?: boolean;
  tags?: Tag[];
  readingTime?: string;
  featured?: boolean;
  toc?: boolean;
};
