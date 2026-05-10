import * as THREE from "three";

export default class Home {
  constructor({ scene, sizes, camera }) {
    this.scene = scene;
    this.sizes = sizes;
    this.camera = camera;
    this.group = new THREE.Group();
  }

  create() {
    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 2),
      new THREE.MeshBasicMaterial({ color: 0x00ffff })
    );
  }

  update(scroll) {
    if (this.mesh) {
      this.mesh.rotation.x += 0.01;
      this.mesh.rotation.y += 0.01;
    }
  }

  onResize(sizes) {
    this.sizes = sizes;
  }

  addDebug() {}

  async show() {
    if (!this.mesh) {
      this.create();
    }
    this.scene.add(this.group);
  }
  hide() {
    this.scene.remove(this.group);
  }
}
