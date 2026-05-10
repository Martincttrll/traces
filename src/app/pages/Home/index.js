import Page from "@classes/Page";

export default class Home extends Page {
  constructor() {
    super({
      element: ".home",
      elements: {
        wrapper: ".home__wrapper",
        mainWrapper: ".home__main__wrapper",
        h1: ".home__title",
      },
    });
  }

  create() {
    super.create();
  }

  show() {
    super.show();
  }
}
