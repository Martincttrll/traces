import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";

gsap.registerPlugin(ScrollTrigger);

export class SmoothScroll {
  constructor(wrapper, content) {
    this.wrapper = wrapper;
    this.content = content;
    this.lenis = null;
    this.create();
    this.initScrollTriggerProxy(this.lenis);
  }

  create() {
    this.lenis = new Lenis({
      wrapper: this.wrapper,
      content: this.content,
      lerp: 0.07,
      autoRaf: false,
    });

    this.scroll = this.lenis.scroll;
    this.maxScroll = this.lenis.limit;

    this.lenis.on("scroll", () => {
      this.scroll = this.lenis.scroll;
      this.maxScroll = this.lenis.limit;
      ScrollTrigger.update();
    });

    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  initScrollTriggerProxy(lenis) {
    const scroller = this.wrapper;

    ScrollTrigger.scrollerProxy(scroller, {
      scrollTop(value) {
        if (arguments.length) {
          lenis.scrollTo(value);
        } else {
          return lenis.scroll;
        }
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType:
        getComputedStyle(scroller).transform !== "none" ? "transform" : "fixed",
    });

    ScrollTrigger.defaults({
      scroller: scroller,
    });
  }
}
