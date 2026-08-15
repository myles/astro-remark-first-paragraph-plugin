import assert from "node:assert/strict";
import { describe, it } from "node:test";

import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";

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
    assert.equal(
      firstParagraph("The first paragraph.\n\nThe second paragraph.\n"),
      "The first paragraph.",
    );
  });

  it("skips a leading heading", () => {
    assert.equal(
      firstParagraph("# Title\n\nThe first paragraph.\n"),
      "The first paragraph.",
    );
  });

  describe("flattening inline markup", () => {
    it("strips emphasis, links, and inline code", () => {
      assert.equal(
        firstParagraph(
          "This is the **first** paragraph, it has a [link](https://example.com) and `code`.\n",
        ),
        "This is the first paragraph, it has a link and code.",
      );
    });

    it("strips raw inline HTML but keeps the text it wraps", () => {
      assert.equal(
        firstParagraph("This is <em>emphasised</em> text.\n"),
        "This is emphasised text.",
      );
    });

    it("turns a hard line break into a single space", () => {
      assert.equal(firstParagraph("One\\\ntwo.\n"), "One two.");
    });

    it("ignores nodes with no text of their own, such as images", () => {
      assert.equal(
        firstParagraph("Before ![alt text](image.png) after.\n"),
        "Before  after.",
      );
    });

    it("strips a GFM footnote reference", () => {
      assert.equal(
        firstParagraph("Text with a footnote[^1].\n\n[^1]: The note.\n"),
        "Text with a footnote.",
      );
    });

    it("strips GFM strikethrough", () => {
      assert.equal(
        firstParagraph("This is ~~struck~~ text.\n"),
        "This is struck text.",
      );
    });
  });

  describe("only considering top-level paragraphs", () => {
    it("skips a paragraph nested in a leading list", () => {
      assert.equal(
        firstParagraph("- item one\n- item two\n\nThe body paragraph.\n"),
        "The body paragraph.",
      );
    });

    it("skips a paragraph nested in a leading blockquote", () => {
      assert.equal(
        firstParagraph("> Quoted intro.\n\nThe body paragraph.\n"),
        "The body paragraph.",
      );
    });

    it("skips a leading table", () => {
      assert.equal(
        firstParagraph("| a | b |\n|---|---|\n| 1 | 2 |\n\nThe body.\n"),
        "The body.",
      );
    });
  });

  describe("when there is nothing to extract", () => {
    it("leaves frontmatter untouched with no top-level paragraph", () => {
      assert.deepEqual(process("# Only a heading\n"), {});
    });

    it("leaves frontmatter untouched for an empty document", () => {
      assert.deepEqual(process(""), {});
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

      assert.deepEqual(file.data.astro.frontmatter, {
        title: "Hello, world",
        firstParagraph: "The first paragraph.",
      });
    });
  });

  describe("outside Astro", () => {
    it("does nothing when the vfile has no Astro frontmatter", () => {
      assert.doesNotThrow(() =>
        process("The first paragraph.\n", { astro: false }),
      );
    });
  });
});
