/**
 * Plugin for Remark to get the first paragraph of a markdown file.
 *
 * Found at: <https://hunormarton.com/blog/astro-description>
 */

import { EXIT, visit } from "unist-util-visit";

function getNodeValue(node) {
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
    visit(tree, "paragraph", (node) => {
      file.data.astro.frontmatter.firstParagraph = getNodeValue(node);
      return EXIT;
    });
  };
};

export default remarkFirstParagraphPlugin;
