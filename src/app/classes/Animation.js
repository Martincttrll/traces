import Component from "./Component.js";
export default class Animation extends Component {
  constructor({ element, elements, useObserver = true }) {
    super({ element, elements });

    this.isScrollingDown = true;

    if (useObserver && "IntersectionObserver" in window) {
      this.createObsverver();
      this.animateOut();
    } else {
      this.animateIn();
    }
  }
  createObsverver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && this.isScrollingDown) {
          this.animateIn();
        } else {
          this.animateOut();
        }
      });
    });
    this.observer.observe(this.element);
  }

  animateIn() {}
  animateOut() {}
}
