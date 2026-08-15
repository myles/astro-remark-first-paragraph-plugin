import type { Root } from "mdast";
import type { Plugin } from "unified";

/**
 * The frontmatter fields this plugin adds to a markdown file.
 */
export interface FirstParagraphFrontmatter {
  /**
   * The text content of the first top-level paragraph in the markdown file,
   * with all inline markup (links, emphasis, code, etc.) flattened to plain
   * text.
   *
   * Left unset when the file has no top-level paragraph — for example a file
   * containing only a heading, or only a list.
   */
  firstParagraph?: string;
}

/**
 * Add the text of a markdown file's first top-level paragraph to its
 * frontmatter as `firstParagraph`.
 *
 * Requires Astro's `file.data.astro.frontmatter`, so it only works as an Astro
 * remark plugin. In any other unified pipeline it does nothing.
 *
 * @example
 * ```js
 * // astro.config.mjs
 * import { defineConfig } from "astro/config";
 * import remarkFirstParagraphPlugin from "@myles/astro-remark-first-paragraph-plugin";
 *
 * export default defineConfig({
 *   markdown: {
 *     remarkPlugins: [remarkFirstParagraphPlugin],
 *   },
 * });
 * ```
 */
declare const remarkFirstParagraphPlugin: Plugin<[], Root>;

export default remarkFirstParagraphPlugin;
