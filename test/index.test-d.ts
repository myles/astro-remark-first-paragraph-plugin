import type { Root } from "mdast";
import remarkParse from "remark-parse";
import { unified, type Plugin } from "unified";
import { describe, expectTypeOf, it } from "vitest";

import remarkFirstParagraphPlugin, {
  type FirstParagraphFrontmatter,
} from "../index.js";

describe("remarkFirstParagraphPlugin types", () => {
  it("is a unified plugin that takes no options and runs on an mdast root", () => {
    expectTypeOf(remarkFirstParagraphPlugin).toEqualTypeOf<Plugin<[], Root>>();
  });

  it("attaches to a unified pipeline", () => {
    const processor = unified()
      .use(remarkParse)
      .use(remarkFirstParagraphPlugin);

    expectTypeOf(processor.parse).toBeCallableWith("# Hello, world\n");
  });

  it("rejects options", () => {
    // @ts-expect-error - the plugin takes no options.
    unified().use(remarkParse).use(remarkFirstParagraphPlugin, { depth: 2 });
  });
});

describe("FirstParagraphFrontmatter", () => {
  it("has an optional string `firstParagraph`", () => {
    expectTypeOf<FirstParagraphFrontmatter>().toEqualTypeOf<{
      firstParagraph?: string;
    }>();
  });

  it("is unset when there is no top-level paragraph", () => {
    const frontmatter: FirstParagraphFrontmatter = {};

    expectTypeOf(frontmatter.firstParagraph).toEqualTypeOf<
      string | undefined
    >();
  });
});
