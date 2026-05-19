import * as THREE from "three";
import gsap from "gsap";

export default class Media {
  constructor({ element, group, sizes }) {
    this.element = element;
    this.slug = element.getAttribute("data-slug");
    this.title = element.getAttribute("data-title");
    this.date = element.getAttribute("data-date");
    this.tracksNumber = element.getAttribute("data-tracks");
    this.albumDuration = element.getAttribute("data-duration");
    this.group = group;
    this.sizes = sizes;
    this.createTextures();
    this.createMesh();
    this.onResize(this.sizes);
  }

  createTextures() {
    let image = window.PRELOADED[this.element.getAttribute("data-src")];
    //iOS bug
    if (image === undefined) {
      image = new Image();
      image.src = this.element.getAttribute("src");
      image.crossOrigin = "anonymous";
    }
    this.texture = new THREE.Texture(image);
    this.texture.needsUpdate = true;
  }

  createMesh() {
    this.geometry = new THREE.BoxGeometry(1, 1, 0.1);
    const frontMaterial = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
    });
    const mirrored = this.texture.clone();
    mirrored.repeat.x = -1;
    mirrored.center.x = 0.5;
    mirrored.needsUpdate = true;
    const backMaterial = new THREE.MeshBasicMaterial({
      map: mirrored,
      transparent: true,
    });
    const edgeMaterial = new THREE.MeshBasicMaterial({
      color: 0xe5e5e5,
      transparent: true,
    });
    this.material = [
      edgeMaterial, // droite
      edgeMaterial, // gauche
      edgeMaterial, // haut
      edgeMaterial, // bas
      frontMaterial, // face avant
      backMaterial, // face arrière
    ];

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.material.opacity = 1;
    this.group.add(this.mesh);

    this.mesh.userData = {
      url: this.slug,
      title: this.title,
    };
  }

  onResize(sizes) {
    this.sizes = sizes;
    const scaleFactor = window.innerWidth < window.innerHeight ? 0.8 : 0.6;
    const meshWidth = this.sizes.width * scaleFactor;
    this.mesh.scale.set(meshWidth, meshWidth, meshWidth * 0.1);
  }

  show(delay) {
    gsap.fromTo(
      this.mesh.position,
      { y: this.mesh.position.y - 1 },
      {
        y: this.mesh.position.y,
        duration: 0.6,
        delay: delay,
        ease: "power2.out",
      },
    );
    this.mesh.material.forEach((material) => {
      gsap.fromTo(
        material,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.6,
          delay: delay,
          ease: "power2.out",
        },
      );
    });
  }
  hide() {}
}
