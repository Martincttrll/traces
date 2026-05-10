import { each } from "lodash";
import gsap from "gsap";

export class Navigation {
  constructor(template, displayed = true) {
    this.navigation = document.querySelector(".nav__wrapper");
    this.menuBtn = document.querySelector(".nav__menu__btn");
    this.menuText = document.querySelector(".nav__menu__btn__text.menu");
    this.closeText = document.querySelector(".nav__menu__btn__text.close");
    this.menuWrapper = document.querySelector(".nav__menu__wrapper");
    this.links = document.querySelectorAll(".nav__menu__link");
    this.disabled = document.querySelectorAll(".nav__menu__link.disabled");

    this.isMenuOpen = false;
    this.isAnimating = false;

    this.createTimeline();
    if (displayed) this.show();

    this.onChange(template);
    this.addEventListeners();
  }

  createTimeline() {
    this.menuTimeline = gsap.timeline({ paused: true, reversed: true });

    this.menuTimeline
      .add(() => {
        this.menuWrapper.style.display = "flex";
      })
      .to(
        this.menuText,
        {
          y: -20,
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
        },
        0
      )
      .fromTo(
        this.closeText,
        {
          y: 20,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
        }
      )
      .to(
        this.menuWrapper,
        {
          duration: 0.5,
          autoAlpha: 1,
          y: 0,
          ease: "power2.out",
        },
        "<"
      )
      .fromTo(
        document.querySelectorAll(".nav__menu__link:not(.disabled)"),
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.5,
          ease: "power2.out",
          pointerEvents: "all",
        },
        "-=0.4"
      )
      .fromTo(
        this.disabled,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 0.5,
          duration: 0.5,
          ease: "power2.out",
          pointerEvents: "all",
        },
        "-=0.4"
      );

    this.menuTimeline.eventCallback("onComplete", () => {
      this.isAnimating = false;
      this.isMenuOpen = true;
    });

    this.menuTimeline.eventCallback("onReverseComplete", () => {
      this.menuWrapper.style.display = "none";
      this.isAnimating = false;
      this.isMenuOpen = false;
    });
  }

  show() {
    this.navigation.classList.add("active");
  }

  hide() {
    this.navigation.classList.remove("active");
  }

  onChange(template) {
    each(this.links, (link) => {
      const href = link.getAttribute("href");
      if (href) {
        const isActive =
          href.includes(template) || (template === "home" && href === "/");
        link.classList.toggle("current", isActive);
      } else {
        link.classList.add("disabled");
      }
    });
  }

  toggleMenu = () => {
    if (this.isAnimating) return;
    this.isAnimating = true;

    if (this.isMenuOpen) {
      this.menuTimeline.reverse();
    } else {
      this.menuWrapper.style.display = "flex";
      this.menuTimeline.play();
    }
  };

  addEventListeners() {
    this.menuBtn.addEventListener("click", this.toggleMenu);
    this.menuWrapper.addEventListener("click", this.toggleMenu);

    each(this.links, (link) => {
      link.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleMenu();
      });
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.toggleMenu();
    });
  }
}
