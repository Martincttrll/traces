import * as THREE from "three";
import Home from "./Home";
export default class Canvas {
  constructor({ template }) {
    this.template = template;
    this.createRenderer();
    this.createScene();
    this.createCamera();
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    this.renderer.domElement.style.pointerEvents = "none";
    this.renderer.domElement.style.position = "absolute";
    this.renderer.domElement.style.overflow = "hidden";
    this.renderer.domElement.style.boxSizing = "border-box";
    this.renderer.domElement.style.top = 0;
    this.renderer.domElement.style.left = 0;
    this.renderer.domElement.style.zIndex = 1;

    document.body.appendChild(this.renderer.domElement);
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.camera.position.set(0, 0, 5);
  }

  createScene() {
    this.scene = new THREE.Scene();
  }

  update(scroll) {
    if (this.canvasPage) {
      this.canvasPage.update(scroll);
    }

    this.renderer.render(this.scene, this.camera);
  }

  createHome() {
    this.home = new Home({
      scene: this.scene,
      sizes: this.sizes,
      camera: this.camera,
    });
  }

  createDiscography() {
    this.discography = new Discography({
      scene: this.scene,
      sizes: this.sizes,
      camera: this.camera,
      transition: this.transition,
    });
  }

  createAlbum() {
    this.album = new Album({
      scene: this.scene,
      sizes: this.sizes,
      camera: this.camera,
      group: this.discography.group,
      transition: this.transition,
    });
  }

  createTransitions() {
    this.transition = new Transition({
      scene: this.scene,
      sizes: this.sizes,
      camera: this.camera,
    });
  }

  /**
   * Events.
   */

  onPreloaded() {
    this.createHome();

    this.onChange({ template: this.template, isPreloaded: true });
  }

  onResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    const fov = this.camera.fov * (Math.PI / 180);
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;

    this.sizes = { width, height };

    if (this.home && this.home.onResize) {
      this.home.onResize(this.sizes);
    }
  }

  onChange({ template, isPreloaded }) {
    if (this.home) this.home.hide();
    if (template === "home") {
      this.canvasPage = this.home;
    }
    if (this.canvasPage) {
      this.canvasPage.show(isPreloaded);
    }
    this.template = template;
  }
}
