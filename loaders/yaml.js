import { parse } from "../deps/yaml.js";

export default async function (path, source) {
  return source.readFile(path, (content) => parse(content));
}

export function parseFrontmatter(content) {
  if (content.startsWith("---") && content.charAt(3) !== "-") {
    const end = content.indexOf("---", 3);

    if (end !== -1) {
      const data = parse(content.slice(3, end));
      data.content = content.slice(end + 3);

      if (data.content[0] === "\r") {
        data.content = data.content.slice(1);
      }

      if (data.content[0] === "\n") {
        data.content = data.content.slice(1);
      }

      return data;
    }
  }

  return { content };
}
