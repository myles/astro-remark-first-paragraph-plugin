/**
 * Plugin for Remark to get the first paragraph of a markdown file.
 *
 * Found at: <https://hunormarton.com/blog/astro-description>
 */

function getNodeValue(node) {
  // Raw HTML nodes hold markup such as `<em>`, not words. The text they wrap is
  // a sibling node, so skipping them keeps the words and drops the tags.
  if (node.type === "html") return "";

  if (typeof node.value === "string") return node.value;

  // A hard line break carries no value, but the words on either side of it
  // shouldn't run together once the paragraph is flattened.
  if (node.type === "break") return " ";

  // Leaf nodes such as `image` have neither a value nor children.
  if (!node.children) return "";

  return node.children.map(getNodeValue).join("");
}

const remarkFirstParagraphPlugin = () => {
  return (tree, file) => {
    // `astro` is an Astro-specific part of the vfile, absent in a plain
    // unified pipeline. Nothing to write to, so leave the file alone.
    const frontmatter = file.data?.astro?.frontmatter;
    if (!frontmatter) return;

    // Only top-level paragraphs, so a leading list or blockquote doesn't stand
    // in for the body text.
    const paragraph = tree.children.find((child) => child.type === "paragraph");
    if (!paragraph) return;

    frontmatter.firstParagraph = getNodeValue(paragraph);
  };
};

export default remarkFirstParagraphPlugin;
