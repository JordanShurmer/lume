import {Command} from "../deps/cliffy-command.js";
import {existsSync} from "../deps/fs";
import lume from "../mod";
import {brightGreen, gray} from "../deps/colors";

export const build = new Command()
    .description("build the site")
    .option("--dev", "enable development mode")
    .option("--host", "set the domain of the site", { default: "http://localhost" })
    .option("--dev", "enable development mode")
    .arguments("[config]")
    .action(async ({}, config) => {
      let site;

      if (existsSync(config)) {
        const mod = await import(`file://${config}`);
        site = mod.default;
        site.options.cwd = cwd;
      } else {
        site = lume({cwd});
      }

      if (options.dev) {
        site.options.dev = options.dev;
      }

      if (options.location) {
        site.options.location = new URL(options.location);
      }

      if (options.src) {
        site.options.src = options.src;
      }

      if (options.dest) {
        site.options.dest = options.dest;
      }

      if (options["--"]) {
        site.options.flags = options["--"];
      }

      // lume --run
      if (options.run) {
        await site.run(options.run);
        return;
      }

      console.log("");
      await site.build();

      console.log("");
      console.log(`🍾 ${brightGreen("Site built into")} ${gray(site.options.dest)}`);

    })