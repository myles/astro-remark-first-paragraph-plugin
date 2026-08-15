import type { Root } from "mdast";
import type { Plugin } from "unified";

/**
 * The frontmatter fields this plugin adds to a markdown file.
 */
export interface FirstParagraphFrontmatter {
  /**
   * The text content of the first paragraph in the markdown file, with all
   * inline markup (links, emphasis, code, etc.) flattened to plain text.
   */
  firstParagraph: string;
}

/**
 * Add the text of a markdown file's first paragraph to its frontmatter as
 * `firstParagraph`.
 *
 * Requires Astro's `file.data.astro.frontmatter`, so it only works as an Astro
 * remark plugin.
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
