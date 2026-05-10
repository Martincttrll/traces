import "@styles/style.scss";
import Home from "@pages/Home";
import { Navigation } from "@components/Navigation";
import { each } from "lodash";
import { Preloader } from "@components/Preloader";
import Canvas from "@components/Canvas";
import gsap from "gsap";
class App {
  constructor() {
    console.log("©2025 - Boilerplate by MartinCtrl");
    this.createContent();
    this.createPreloader();
    this.createNavigation();
    this.createPages();
    this.createCanvas();
    this.addEventListeners();
    this.addLinkListeners();
    this.addDebug();
    this.onResize();

    gsap.ticker.add(this.update.bind(this));
  }

  createContent() {
    this.content = document.querySelector(".content");
    this.template = this.content.getAttribute("data-template");
  }

  createNavigation() {
    this.navigation = new Navigation(this.template);
  }

  createPreloader() {
    this.preloader = new Preloader();

    this.preloader.once("completed", this.onPreloaded.bind(this));
    this.preloader.once(
      "animationCompleted",
      this.onPreloaderAnimationCompleted.bind(this)
    );
  }

  createPages() {
    this.pages = {
      home: new Home(),
    };

    this.page = this.pages[this.template];
    this.page.create();
  }

  createCanvas() {
    this.canvas = new Canvas({ template: this.template });
  }

  update() {
    if (this.canvas) {
      this.canvas.update(this.page.smoothScroll.scroll);
    }
  }

  /*
   * Events
   */

  onPreloaded() {
    //Canvas
    this.onResize();
    this.canvas.onPreloaded();
    this.update();
    this.page.setCanvasPage(this.canvas.canvasPage);
  }

  onPreloaderAnimationCompleted() {
    this.page.show();
  }

  onResize() {
    if (this.page && this.page.onResize) {
      this.page.onResize();
    }

    window.requestAnimationFrame(() => {
      if (this.canvas && this.canvas.onResize) {
        this.canvas.onResize();
      }
    });
  }

  onPopState = () => {
    this.onChange({
      url: window.location.pathname,
      push: true,
    });
  };

  async onChange({ url, push = true }) {
    if (this.isFetching || this.url === url) return;

    this.isFetching = true;
    this.page.hide();

    const request = await window.fetch(url);
    if (request.status === 200) {
      const html = await request.text();
      const tempDom = document.createElement("div");
      tempDom.innerHTML = html;
      const newContent = tempDom.querySelector(".content");
      const newTemplate = newContent.getAttribute("data-template");
      const newTitle = tempDom.querySelector("title").innerText;

      if (!newContent || !this.pages[newTemplate]) {
        throw new Error("New page content or template not found");
      }

      this.content.replaceWith(newContent);
      this.content = newContent;
      this.template = newTemplate;
      document.title = newTitle;

      this.navigation.onChange(this.template);

      if (push) {
        window.history.pushState({}, "", url);
      }

      this.page = this.pages[this.template];
      this.page.create();

      this.onResize();
      this.page.show();

      this.canvas.onChange({ template: this.template, url });
      this.page.setCanvasPage(this.canvas.canvasPage);

      this.isFetching = false;
      this.addLinkListeners();
    } else {
      console.log("Error fetching page");
    }
  }

  onContextMenu(event) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
  addLinkListeners() {
    const links = document.querySelectorAll("a");

    each(links, (link) => {
      link.addEventListener("click", (e) => {
        if (!link.href.startsWith(window.location.origin)) return;
        e.preventDefault();
        const { href } = link;
        this.onChange({ url: href });
      });
    });
  }

  addEventListeners() {
    window.addEventListener("popstate", this.onPopState, { passive: true });
    window.addEventListener("resize", this.onResize.bind(this));
    // window.oncontextmenu = this.onContextMenu; //Disable right click
  }

  addDebug() {
    if (window.location.protocol !== "https:") {
      each(this.pages, (page) => {
        if (page && typeof page.addDebug === "function") {
          page.addDebug();
        }
      });
      if (this.canvasPage && typeof this.canvasPage.addDebug === "function") {
        this.canvasPage.addDebug();
      }
    }
  }
}

window.app = new App();
