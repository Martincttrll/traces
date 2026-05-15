import Page from "@classes/Page";
import Particles from "./Particles";

export default class Home extends Page {
  constructor() {
    super({
      element: ".home",
      elements: {
        wrapper: ".home__wrapper",
        mainWrapper: ".home__main__wrapper",
        h1: ".home__title",
        particlesCanvas: ".home__canvas__particles",
      },
    });
  }

  create() {
    super.create();
  }

  createParticles() {
    this.particles = new Particles({ canvas: this.elements.particlesCanvas });
  }

  update() {
    if (this.particles) {
      this.particles.update();
    }
  }

  show() {
    super.show();
    this.createParticles();
  }
}
