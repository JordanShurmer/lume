import { basename, dirname, extname, join, normalize } from "./deps/path.js";
import { copy, emptyDir, ensureDir, exists } from "./deps/fs.js";
import { gray } from "./deps/colors.js";
import { createHash } from "./deps/hash.js";
import Source from "./source.js";
import Scripts from "./scripts.js";
import { concurrent } from "./utils.js";

const defaults = {
  cwd: Deno.cwd(),
  src: "./",
  dest: "./_site",
  dev: false,
  prettyUrls: true,
  flags: [],
  server: {
    port: 3000,
    page404: "/404.html",
  },
};

export default class Site {
  engines = new Map();
  filters = new Map();
  extraData = {};
  listeners = new Map();
  processors = new Map();
  pages = [];

  constructor(options = {}) {
    this.options = { ...defaults, ...options };

    this.options.location = (options.location instanceof URL)
      ? this.options.location
      : new URL(this.options.location || "http://localhost");

    this.source = new Source(this);
    this.scripts = new Scripts(this);
  }

  /**
   * Returns the src path
   */
  src(...path) {
    return join(this.options.cwd, this.options.src, ...path);
  }

  /**
   * Returns the dest path
   */
  dest(...path) {
    return join(this.options.cwd, this.options.dest, ...path);
  }

  /**
   * Adds an event
   */
  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
    return this;
  }

  /**
   * Dispatch an event
   */
  async dispatchEvent(event) {
    const type = event.type;
    const listeners = this.listeners.get(type);

    if (!listeners) {
      return;
    }

    for (let listener of listeners) {
      if (typeof listener === "string") {
        listener = [listener];
      }

      if (Array.isArray(listener)) {
        const success = await this.run(...listener);

        if (!success) {
          return false;
        }

        continue;
      }

      if (await listener(event) === false) {
        return false;
      }
    }
  }

  /**
   * Use a plugin
   */
  use(plugin) {
    plugin(this);
    return this;
  }

  /**
   * Register a script
   */
  script(name, ...scripts) {
    this.scripts.set(name, ...scripts);
    return this;
  }

  /**
   * Register a data loader for some extensions
   */
  loadData(extensions, loader) {
    extensions.forEach((extension) => this.source.data.set(extension, loader));
    return this;
  }

  /**
   * Register a page loader for some extensions
   */
  loadPages(extensions, loader) {
    extensions.forEach((extension) => this.source.pages.set(extension, loader));
    return this;
  }

  /**
   * Register an assets loader for some extensions
   */
  loadAssets(extensions, loader) {
    extensions.forEach((extension) => this.source.pages.set(extension, loader));
    extensions.forEach((extension) => this.source.assets.add(extension));
    return this;
  }

  /**
   * Register a processor for some extensions
   */
  process(extensions, processor) {
    extensions.forEach((extension) => {
      const processors = this.processors.get(extension) || [];
      processors.push(processor);
      this.processors.set(extension, processors);
    });
    return this;
  }

  /**
   * Register template engine used for some extensions
   */
  engine(extensions, engine) {
    extensions.forEach((extension) => this.engines.set(extension, engine));
    this.loadPages(extensions, engine.load.bind(engine));

    for (const [name, filter] of this.filters) {
      engine.addFilter(name, ...filter);
    }

    return this;
  }

  /**
   * Register a template filter
   */
  filter(name, filter, async) {
    this.filters.set(name, [filter, async]);

    for (const engine of this.engines.values()) {
      engine.addFilter(name, filter, async);
    }

    return this;
  }

  /**
   * Register extra data accesible by layouts
   */
  data(name, data) {
    this.extraData[name] = data;
    return this;
  }

  /**
   * Copy static files/folders without processing
   */
  copy(from, to = from) {
    this.source.staticFiles.set(join("/", from), join("/", to));
    return this;
  }

  /**
   * Ignore one or several files or folders
   */
  ignore(...paths) {
    paths.forEach((path) => this.source.ignored.add(join("/", path)));
    return this;
  }

  /** 
   * Clear the dest folder
   */
  async clear() {
    await emptyDir(this.dest());
  }

  /**
   * Build the entire site
   */
  async build() {
    await this.dispatchEvent({ type: "beforeBuild" });

    await this.clear();

    for (const [from, to] of this.source.staticFiles) {
      await this.#copyStatic(from, to);
    }

    await this.source.loadDirectory();
    await this.#buildPages();

    await this.dispatchEvent({ type: "afterBuild" });
  }

  /**
   * Reload some files that might be changed
   */
  async update(files) {
    await this.dispatchEvent({ type: "beforeUpdate", files });

    for (const file of files) {
      // file inside a _data file or folder
      if (file.includes("/_data/") || file.match(/\/_data.\w+$/)) {
        await this.source.loadFile(file);
        continue;
      }

      // file path contains /_ or /.
      if (file.includes("/_") || file.includes("/.")) {
        continue;
      }

      //Static file
      const entry = this.source.isStatic(file);

      if (entry) {
        const [from, to] = entry;

        await this.#copyStatic(file, join(to, file.slice(from.length)));
        continue;
      }

      //Default
      await this.source.loadFile(file);
    }

    await this.#buildPages();
    await this.dispatchEvent({ type: "afterUpdate", files });
  }

  /**
   * Run a script
   */
  async run(name, options = {}) {
    return await this.scripts.run(options, name);
  }

  /**
   * Return the site flags
   */
  get flags() {
    return this.options.flags || [];
  }

  /**
   * Returns the url of a page
   */
  url(path, absolute) {
    if (
      path.startsWith("./") || path.startsWith("../") || path.startsWith("#") ||
      path.startsWith("?")
    ) {
      return path;
    }

    try {
      return new URL(path).toString();
    } catch (err) {
      if (!this.options.location) {
        return normalize(join("/", path));
      }

      path = normalize(join(this.options.location.pathname, path));

      return absolute ? this.options.location.origin + path : path;
    }
  }

  /**
   * Copy a static file
   */
  async #copyStatic(from, to) {
    const pathFrom = this.src(from);
    const pathTo = this.dest(to);

    if (await exists(pathFrom)) {
      await ensureDir(dirname(pathTo));
      console.log(`🔥 ${from}`);
      return copy(pathFrom, pathTo, { overwrite: true });
    }
  }

  /**
   * Build the pages
   */
  async #buildPages() {
    this.pages = [];
    const fnPages = [];

    //Build the this.pages array
    for (const page of this.source.root.getPages()) {
      if (page.data.draft && !this.options.dev) {
        continue;
      }

      page.content = page.data.content;

      if (typeof page.content === "function") {
        fnPages.push(page);
        continue;
      }

      this.#urlPage(page);
      this.pages.push(page);
    }

    //Generate pages (pagination, etc)
    for (const page of fnPages) {
      await this.#expandPage(page);
    }

    //Render the pages
    for (const page of this.pages) {
      await this.#renderPage(page);
    }

    //Process the pages
    for (const [ext, processors] of this.processors) {
      await concurrent(
        this.pages,
        async (page) => {
          if (ext === page.dest.ext && page.content) {
            for (const process of processors) {
              await process(page, this);
            }
          }
        },
      );
    }

    //Save the pages
    await concurrent(
      this.pages,
      (page) => this.#savePage(page),
    );
  }

  /**
   * Generate the url and dest info of a page
   */
  #urlPage(page) {
    const { dest } = page;

    if (page.data.permalink) {
      const ext = extname(page.data.permalink);
      dest.ext = ext || ".html";
      dest.path = ext
        ? page.data.permalink.slice(0, -ext.length)
        : page.data.permalink;

      if (!ext && this.options.prettyUrls) {
        dest.path = join(dest.path, "index");
      }
    } else if (
      this.options.prettyUrls && dest.ext === ".html" &&
      basename(dest.path) !== "index"
    ) {
      dest.path = join(dest.path, "index");
    }

    if (!dest.path.startsWith("/")) {
      dest.path = `/${dest.path}`;
    }

    page.data.url = (dest.ext === ".html" && basename(dest.path) === "index")
      ? dest.path.slice(0, -5)
      : dest.path + dest.ext;
    page.data.slug = basename(dest.path) === "index" ? basename(dest.path.slice(0, -5)) : basename(dest.path)
  }

  /**
   * Generate subpages (for pagination)
   */
  async #expandPage(page) {
    const filters = {};

    for (const [name, [fn]] of this.filters) {
      filters[name] = fn;
    }

    const content = page.content;
    const data = { ...page.data, ...this.extraData };
    const result = content(data, filters);
    const type = (typeof result === "object")
      ? String(result)
      : (typeof result);

    switch (type) {
      case "[object Generator]":
      case "[object AsyncGenerator]":
        for await (const pageData of result) {
          const newPage = page.duplicate(pageData);

          newPage.content = newPage.data.content;

          this.pages.push(newPage);
          this.#urlPage(newPage);
        }
        break;

      default:
        page.content = result;
        this.pages.push(page);
        this.#urlPage(page);
    }
  }

  /**
   * Render a page
   */
  async #renderPage(page) {
    let content = page.content;
    let pageData = { ...page.data, ...this.extraData };
    let layout = pageData.layout;
    let path = this.src(page.src.path + page.src.ext);
    const engine = this.#getEngine(page.src.ext, pageData.templateEngine);

    if (Array.isArray(engine)) {
      for (const eng of engine) {
        content = await eng.render(content, pageData, path);
      }
    } else if (engine) {
      content = await engine.render(content, pageData, path);
    }

    while (layout) {
      const engine = this.#getEngine(layout);
      const path = this.src(engine.includes, layout);
      const layoutData = await engine.load(path);
      pageData = {
        ...layoutData,
        ...pageData,
        content,
        ...this.extraData,
      };

      content = await engine.render(layoutData.content, pageData, path);

      layout = layoutData.layout;
    }

    page.content = content;
  }

  /**
   * Save a page
   */
  async #savePage(page) {
    //Ignore empty files
    if (!page.content) {
      return;
    }

    const sha1 = createHash("sha1");
    sha1.update(page.content);
    const hash = sha1.toString();

    //The page content didn't change
    if (page.dest.hash === hash) {
      return;
    }
    page.dest.hash = hash;
    const dest = page.dest.path + page.dest.ext;
    const src = page.src.path + page.src.ext;

    console.log(`🔥 ${dest} ${gray(src)}`);

    const filename = this.dest(dest);
    await ensureDir(dirname(filename));
    return Deno.writeTextFile(filename, page.content);
  }

  /**
   * Get the engine used by a path or extension
   */
  #getEngine(path, custom) {
    if (custom) {
      custom = Array.isArray(custom) ? custom : custom.split(",");

      return custom.map((name) => {
        const engine = this.engines.get(`.${name.trim()}`);

        if (engine) {
          return engine;
        }

        throw new Error(`Invalid template engine: "${name}"`);
      });
    }

    for (const [ext, engine] of this.engines) {
      if (path.endsWith(ext)) {
        return engine;
      }
    }
  }
}
