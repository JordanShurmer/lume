import { Command, ValidationError } from "./deps/cliffy-command.js";


await new Command()
    .name("lume")
    .version("0.14.0")
    .description("A static site generator for Deno\n\nDocs: https://lumeland.github.io")

    .command("build [config]")
    .description("build the site")
    .option("--dev", "enable development mode (show draft pages)")
    .option("--location", "set the domain of the site", { default: "http://localhost" })
    .option("--src", "source directory of your site", { default: "./" })
    .option("--dest", "directory to build your site into", { default: "./_site" })

    .command("init")
    .description("create a _config.js file for a new site")

    .command("serve")
    .description("Build the site and start a web server that refreshes automatically for every change")
    .option("--port", "web server port", { default: 3000 })
    .option("--dev", "enable development mode (show draft pages)")
    .option("--location", "set the domain of the site", { default: "http://localhost" })
    .option("--src", "source directory of your site", { default: "./" })
    .option("--dest", "directory to build your site into", { default: "./_site" })

    .command("upgrade")
    .description("Upgrade local lume install to the latest version")

    .command("update")
    .description("Update the lume version imported in _config.js to the latest")


    .parse(Deno.args)

