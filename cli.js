import {existsSync} from "./deps/fs.js";
import {parse} from "./deps/flags.js";
import {brightGreen, gray, red, bold} from "./deps/colors.js";
import {join, relative, resolve} from "./deps/path.js";
import lume from "./mod.js";
import {error} from "./utils.js";
import { build } from './commands/mod.js';
import { Command, ValidationError } from "./deps/cliffy-command.js";

export const version = "0.13.2";

if (import.meta.main) {
  try {
    cli(Deno.args);
  } catch (error) {
    console.log(`${bold(red("error"))}: ${error.message}`)
    if (error instanceof ValidationError) {
      console.log(`Run ${brightGreen("lume --help")} for usage information`);
    }
    console.log("");
    Deno.exit(1);
  }
}

const validCommands = [
  "build",
  "init",
  "run",
  "serve",
  "upgrade",
  "update",
];

export default async function cli(args) {

  await new Command()
      .name("lume")
      .version(version)
      .description("A static site generator for Deno\n\nDocs: https://lumeland.github.io")
      .command("build", build)
      .parse(args)
}

async function old_cli(args) {
  const options = parse(args, {
    boolean: ["dev", "version", "help"],
    string: ["port", "src", "dest", "location"],
    alias: {
      help: "h",
      version: "v",
    },
    ["--"]: true,
    unknown(option) {
      if (option.startsWith("-")) {
        throw new Error(`Unknown option: ${option}`);
      }
    },
  });

  if (options._.length > 1) {
    throw new Error(`Too many arguments: ${options._.join(", ")}`);
  }

  const command = options._[0] || 'build' // default command is build
  if (!validCommands.includes(command)) {
    throw new Error(`Found argument '${command}' which wasn't expected`);
  }

  // lume --help
  if (options.help) {
    console.log(`🔥lume ${version}
A static site generator for Deno

Docs: https://lumeland.github.io

To build the site:
    lume

To serve the site in localhost
    lume --serve

USAGE:
    lume [OPTIONS] [COMMAND]

COMMANDS:
        ${validCommands.join('/n')}

OPTIONS:
    -h, --help     Prints help information
    -v, --version  Prints version information
        --dest     Set/override the dest option
        --dev      Run lume in development mode
        --init     Creates a _config.js file
        --location Set/override the location option
        --port     Change the default port of the webserver (from 3000)
        --run      Run a script
        --serve    Starts the webserver
        --src      Set/override the src option
        --update   Update the lume version imported in the _config.js file
        --upgrade  Upgrade 🔥lume to the latest version
`);
    return;
  }

  // lume --version
  if (options.version) {
    console.log(`🔥lume ${version}`);
    return;
  }


    if (stop) {
      console.log(`Run ${brightGreen("lume --help")} for usage information`);
      console.log("");
      return;
    }

  // lume --upgrade
  if (options.upgrade) {
    const versions = await fetch(
        "https://cdn.deno.land/lume/meta/versions.json",
    ).then((res) => res.json());

    if (versions.latest === version) {
      console.log(
          `You're using the latest version of lume: ${versions.latest}!`,
      );
      console.log("");
      return;
    }

    console.log(
        `New version available. Updating lume to ${versions.latest}...`,
    );

    await Deno.run({
      cmd: [
        "deno",
        "install",
        "--unstable",
        "-Afr",
        `https://deno.land/x/lume@${versions.latest}/cli.js`,
      ],
    }).status();

    await Deno.run({
      cmd: [
        "deno",
        "cache",
        "--unstable",
        "-r",
        `https://deno.land/x/lume/mod.js`,
      ],
    }).status();

    console.log("");
    console.log(
        `Update successful! You're using the latest version of lume: ${
            brightGreen(versions.latest)
        }!`,
    );
    console.log(
        "See the changes in",
        gray(
            `https://github.com/lumeland/lume/blob/${versions.latest}/CHANGELOG.md}`,
        ),
    );
    console.log("");
    return;
  }

  // lume --update
  if (options.update) {
    const file = options._[0] || "_config.js";

    if (!existsSync(file)) {
      error("error", `The file ${file} does not exists`);
      return;
    }

    const content = await Deno.readTextFile(file);
    const updated = content.replaceAll(
        /https:\/\/deno\.land\/x\/lume(@v[\d\.]+)?\/(.*)/g,
        (m, v, file) => `https://deno.land/x/lume@${version}/${file}`,
    );

    if (content === updated) {
      console.log("No changes required in", gray(file));
      console.log("");
      return;
    }

    Deno.writeTextFile(file, updated);

    console.log(
        `Updated lume modules to ${brightGreen(version)} in`,
        gray(file),
    );
    console.log("");
    return;
  }

  let cwd, configFile;

  if (options._[0]) {
    const path = options._[0];

    if (path.endsWith(".js") || path.endsWith(".ts")) {
      configFile = resolve(Deno.cwd(), path);
      cwd = dirname(configFile);
    } else {
      cwd = resolve(Deno.cwd(), path);
      configFile = join(cwd, "_config.js");

      if (!existsSync(cwd)) {
        error("error", `The folder ${cwd} does not exists`);
        return;
      }
    }
  } else {
    cwd = Deno.cwd();
    configFile = join(cwd, "_config.js");
  }

  // lume --init
  if (options.init) {
    Deno.writeTextFileSync(
        configFile,
        `import lume from "https://deno.land/x/lume/mod.js";

const site = lume();

export default site;
`,
    );
    console.log(brightGreen("Created config file"), configFile);
    return;
  }

  let site;

  if (existsSync(configFile)) {
    const mod = await import(`file://${configFile}`);
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

  if (!options.serve) {
    return;
  }

  // lume --serve
  const {server} = await import("./server.js");

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
