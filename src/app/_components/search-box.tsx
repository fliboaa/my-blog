"use client";

import { useMemo, useState } from "react";
import { type Post } from "@/interfaces/post";
import { TAG_SLUG } from "@/lib/tags";

export function SearchBox({ posts }: { posts: Post[] }) {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);

  const hits = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    return posts.filter((p) => p.title.toLowerCase().includes(query));
  }, [q, posts]);

  const show = focused && q.trim().length > 0;

  return (
    <div className="search-box">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        className="search-input"
        placeholder="搜索文章..."
        value={q}
        autoComplete="off"
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
      />
      {show && (
        <div className="search-results">
          {hits.length === 0 ? (
            <div className="sr-empty">没有匹配「{q}」的文章</div>
          ) : (
            hits.map((p) => (
              <a
                key={p.slug}
                href={`/posts/${p.slug}`}
                className="sr-item"
              >
                <span
                  className="sr-title"
                  dangerouslySetInnerHTML={{
                    __html: highlight(p.title, q.trim()),
                  }}
                />
                <span className="sr-meta">
                  {p.tags?.[0] && (
                    <span className="tag tag-meta">{p.tags[0]}</span>
                  )}
                  {p.date} · {p.readingTime}
                </span>
              </a>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function highlight(title: string, q: string) {
  const idx = title.toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) return escapeHtml(title);
  return (
    escapeHtml(title.slice(0, idx)) +
    '<mark class="sr-mark">' +
    escapeHtml(title.slice(idx, idx + q.length)) +
    "</mark>" +
    escapeHtml(title.slice(idx + q.length))
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
