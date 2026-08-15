# @myles/astro-remark-first-paragraph-plugin

A [remark][remark] plugin for [Astro][astro] that copies the text of a markdown
file's first paragraph into its frontmatter as `firstParagraph`.

Useful for generating a description or excerpt for a blog post without having to
write one by hand for every file.

## Install

```sh
npm install @myles/astro-remark-first-paragraph-plugin
```

## Usage

Add the plugin to the `markdown.remarkPlugins` array in your Astro config:

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import remarkFirstParagraphPlugin from "@myles/astro-remark-first-paragraph-plugin";

export default defineConfig({
  markdown: {
    remarkPlugins: [remarkFirstParagraphPlugin],
  },
});
```

Given a markdown file like this:

```md
---
title: Hello, world
---

This is the **first** paragraph, and it has a [link](https://example.com).

This is the second paragraph.
```

`firstParagraph` is added to the frontmatter with all inline markup flattened to
plain text:

```
This is the first paragraph, and it has a link.
```

Read it from `frontmatter` wherever Astro exposes it — a content collection
entry, `Astro.props`, or `import.meta.glob`:

```astro
---
// src/pages/blog/[...slug].astro
const { frontmatter } = Astro.props;
---

<meta name="description" content={frontmatter.firstParagraph} />
```

## How it works

The plugin walks the mdast tree, stops at the first `paragraph` node, and
recursively joins the `value` of every descendant node into a single string.
Because it only reads text values, formatting such as emphasis, links, and
inline code is stripped — you get the words, not the markup. A hard line break
becomes a single space; nodes with no text of their own, such as images,
contribute nothing.

The result is written to `file.data.astro.frontmatter`, which is an Astro-specific
part of the vfile. That means this plugin works as an Astro remark plugin only;
it will not do anything useful in a plain unified/remark pipeline.

## Development

```sh
npm install
npm run prettier        # check formatting
npm run prettier:write  # fix formatting
```

## Credits

The original approach comes from Hunor Marton Borbely's post,
[Add a description to your Astro blog posts automatically][post].

## License

[MIT](LICENSE)

[remark]: https://github.com/remarkjs/remark
[astro]: https://astro.build
[post]: https://hunormarton.com/blog/astro-description
