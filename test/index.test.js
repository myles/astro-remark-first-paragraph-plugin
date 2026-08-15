import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { describe, expect, it } from "vitest";

import remarkFirstParagraphPlugin from "../index.js";

/**
 * Run the plugin over some markdown and return the resulting frontmatter.
 *
 * Astro enables GFM by default, so the test pipeline does too.
 */
function process(markdown, { astro = true } = {}) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkFirstParagraphPlugin);

  const file = {
    value: markdown,
    data: astro ? { astro: { frontmatter: {} } } : {},
  };

  processor.runSync(processor.parse(file), file);

  return file.data.astro?.frontmatter;
}

/** Run the plugin and return just the `firstParagraph` value. */
function firstParagraph(markdown) {
  return process(markdown).firstParagraph;
}

describe("remarkFirstParagraphPlugin", () => {
  it("uses the first paragraph and ignores later ones", () => {
    expect(
      firstParagraph("The first paragraph.\n\nThe second paragraph.\n"),
    ).toBe("The first paragraph.");
  });

  it("skips a leading heading", () => {
    expect(firstParagraph("# Title\n\nThe first paragraph.\n")).toBe(
      "The first paragraph.",
    );
  });

  describe("flattening inline markup", () => {
    it("strips emphasis, links, and inline code", () => {
      expect(
        firstParagraph(
          "This is the **first** paragraph, it has a [link](https://example.com) and `code`.\n",
        ),
      ).toBe("This is the first paragraph, it has a link and code.");
    });

    it("strips raw inline HTML but keeps the text it wraps", () => {
      expect(firstParagraph("This is <em>emphasised</em> text.\n")).toBe(
        "This is emphasised text.",
      );
    });

    it("turns a hard line break into a single space", () => {
      expect(firstParagraph("One\\\ntwo.\n")).toBe("One two.");
    });

    it("ignores nodes with no text of their own, such as images", () => {
      expect(firstParagraph("Before ![alt text](image.png) after.\n")).toBe(
        "Before  after.",
      );
    });

    it("strips a GFM footnote reference", () => {
      expect(
        firstParagraph("Text with a footnote[^1].\n\n[^1]: The note.\n"),
      ).toBe("Text with a footnote.");
    });

    it("strips GFM strikethrough", () => {
      expect(firstParagraph("This is ~~struck~~ text.\n")).toBe(
        "This is struck text.",
      );
    });
  });

  describe("only considering top-level paragraphs", () => {
    it("skips a paragraph nested in a leading list", () => {
      expect(
        firstParagraph("- item one\n- item two\n\nThe body paragraph.\n"),
      ).toBe("The body paragraph.");
    });

    it("skips a paragraph nested in a leading blockquote", () => {
      expect(firstParagraph("> Quoted intro.\n\nThe body paragraph.\n")).toBe(
        "The body paragraph.",
      );
    });

    it("skips a leading table", () => {
      expect(
        firstParagraph("| a | b |\n|---|---|\n| 1 | 2 |\n\nThe body.\n"),
      ).toBe("The body.");
    });
  });

  describe("when there is nothing to extract", () => {
    it("leaves frontmatter untouched with no top-level paragraph", () => {
      expect(process("# Only a heading\n")).toStrictEqual({});
    });

    it("leaves frontmatter untouched for an empty document", () => {
      expect(process("")).toStrictEqual({});
    });

    it("does not overwrite other frontmatter fields", () => {
      const processor = unified()
        .use(remarkParse)
        .use(remarkFirstParagraphPlugin);
      const file = {
        value: "The first paragraph.\n",
        data: { astro: { frontmatter: { title: "Hello, world" } } },
      };

      processor.runSync(processor.parse(file), file);

      expect(file.data.astro.frontmatter).toStrictEqual({
        title: "Hello, world",
        firstParagraph: "The first paragraph.",
      });
    });
  });

  describe("outside Astro", () => {
    it("does nothing when the vfile has no Astro frontmatter", () => {
      expect(() =>
        process("The first paragraph.\n", { astro: false }),
      ).not.toThrow();
    });
  });
});
