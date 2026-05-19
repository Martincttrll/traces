import Page from "@classes/Page";
import Particles from "./Particles";
import { Detection } from "@classes/Detection";

export default class Home extends Page {
  constructor() {
    super({
      element: ".home",
      elements: {
        wrapper: ".home__wrapper",
        mainWrapper: ".home__main__wrapper",
        h1: ".home__title",
        particlesCanvas: ".home__canvas__particles",
        carouselItems: ".carousel__item",
      },
    });
    this.scrollInfo = {
      position: 0,
      velocity: 0,
      friction: Detection.isMobile ? 0.96 : 0.94,
      sensitivity: 0.00015,
      delta: 0,
      touchStartY: 0,
      isTouching: false,
    };
  }

  create() {
    super.create();
  }

  createParticles() {
    this.particles = new Particles({ canvas: this.elements.particlesCanvas });
  }

  handleScroll() {
    requestAnimationFrame(() => this.handleScroll());

    const movingDetection = 0.005;
    const wasMoving = Math.abs(this.scrollInfo.velocity) >= movingDetection;

    this.scrollInfo.position += this.scrollInfo.velocity;
    this.scrollInfo.velocity *= this.scrollInfo.friction;

    const total = this.elements.carouselItems.length;
    if (this.scrollInfo.position < 0) this.scrollInfo.position += total;
    if (this.scrollInfo.position >= total) this.scrollInfo.position -= total;

    if (this.canvasPage) {
      const isNowMoving = Math.abs(this.scrollInfo.velocity) >= movingDetection;
      const isNowStopped =
        wasMoving && Math.abs(this.scrollInfo.velocity) < movingDetection;

      this.canvasPage.onScroll(this.scrollInfo);
    }
  }

  addEventListeners() {
    super.addEventListeners();
    if (!Detection.isMobile) {
      window.addEventListener(
        "wheel",
        (e) => {
          this.scrollInfo.velocity += e.deltaY * this.scrollInfo.sensitivity;
        },
        { passive: true },
      );
    } else {
      window.addEventListener(
        "touchstart",
        (e) => {
          this.scrollInfo.touchStartY = e.touches[0].clientY;
          this.scrollInfo.isTouching = true;
          this.scrollInfo.velocity = 0;
        },
        { passive: true },
      );

      window.addEventListener(
        "touchmove",
        (e) => {
          if (!this.scrollInfo.isTouching) return;

          const currentY = e.touches[0].clientY;
          const deltaY = this.scrollInfo.touchStartY - currentY;
          this.scrollInfo.touchStartY = currentY;

          // Ajuste la sensibilité pour le touch
          this.scrollInfo.velocity +=
            deltaY * (this.scrollInfo.sensitivity * 2);
        },
        { passive: true },
      );

      window.addEventListener(
        "touchend",
        () => {
          this.scrollInfo.isTouching = false;
        },
        { passive: true },
      );
    }
    this.handleScroll();
  }

  update() {
    if (this.particles) {
      this.particles.update();
    }
  }

  show() {
    super.show();
    this.createParticles();
    this.addEventListeners();
  }
}
