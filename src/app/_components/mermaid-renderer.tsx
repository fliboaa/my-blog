"use client";

import { useEffect } from "react";

export function MermaidRenderer() {
  useEffect(() => {
    const prose = document.querySelector(".prose");
    if (!prose) return;

    const mermaidBlocks = prose.querySelectorAll<HTMLElement>(
      'code[class*="language-mermaid"], pre code.language-mermaid'
    );

    if (mermaidBlocks.length === 0) return;

    // 动态加载 mermaid.js
    import("mermaid").then(async (mod) => {
      const mermaid = mod.default;
      mermaid.initialize({
        startOnLoad: false,
        theme: document.documentElement.classList.contains("dark")
          ? "dark"
          : "default",
        securityLevel: "loose",
      });

      for (const block of mermaidBlocks) {
        const code = block.textContent || "";
        const wrapper = document.createElement("div");
        wrapper.className = "mermaid-diagram";
        wrapper.textContent = code;
        // 替换掉被 pretty-code 包裹的代码块
        const pre = block.closest("pre");
        if (pre) {
          pre.replaceWith(wrapper);
        } else {
          block.replaceWith(wrapper);
        }
        try {
          const { svg } = await mermaid.render(
            `mermaid-${Math.random().toString(36).slice(2, 8)}`,
            code
          );
          wrapper.innerHTML = svg;
        } catch {
          wrapper.classList.add("mermaid-error");
          wrapper.innerHTML = `<pre>${code}</pre>`;
        }
      }
    });
  }, []);

  return null;
}
