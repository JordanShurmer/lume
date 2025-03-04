import { parse } from "../deps/flags.js";
import { server } from "../server.js";
import { brightGreen, gray } from "../deps/colors.js";
import { error } from "../utils.js";
import { join, relative } from "../deps/path.js";
import { buildSite, validateArgsCount } from "./utils.js";

export const HELP = `
${brightGreen("lume build")}: Build the site and optionally serve it

USAGE: 
    lume build [OPTIONS]

OPTIONS:
    --root     <dir>    the root that lume should work in   Default: ./
    --src      <dir>    the source directory for your site  Default: ./
    --dest     <dir>    the build destination.              Default: _site
    --config   <file>   specify the lume config file.       Default: _config.js
    --location <domain> set the domain for your site.       Default: http://localhost
    --dev               enable dev mode (view draft pages)

    --serve             start a live-reloading web server
    --port     <port>   the port the server is on           Default: 3000
        
`;
export async function run(args) {
  const options = parse(args, {
    boolean: ["serve", "dev"],
    string: ["port", "src", "dest", "location", "root", "config"],
    ["--"]: true,
    unknown(option) {
      if (option.startsWith("-")) {
        throw new Error(`Unknown option: ${option}`);
      }
    },
    default: {
      root: Deno.cwd(),
      config: "_config.js",
    },
  });

  validateArgsCount("build", options._, 1);

  const site = await buildSite(options);
  console.log("");
  await site.build();
  console.log("");
  console.log(`🍾 ${brightGreen("Site built into")} ${gray(site.options.dest)}`);

  if (!options.serve) {
    return;
  }

  try {
    await server(site, options);
    const watcher = Deno.watchFs(site.src());
    const changes = new Set();
    console.log("Watching for changes...");

    let timer = 0;

    const rebuild = async () => {
      console.log("");
      console.log("Changes detected. Building...");
      const files = new Set(changes);
      changes.clear();

      try {
        await site.update(files);
        console.log("Done");
        console.log("");
      } catch (err) {
        error("rebuild", "Error on build the site", err);
      }
    };

    for await (const event of watcher) {
      if (event.paths.every((path) => path.startsWith(site.dest()))) {
        continue;
      }

      event.paths.forEach((path) =>
        changes.add(join("/", relative(site.src(), path)))
      );

      //Debounce
      clearTimeout(timer);
      timer = setTimeout(rebuild, 500);
    }
  } catch (err) {
    console.log(err);
  }
}
