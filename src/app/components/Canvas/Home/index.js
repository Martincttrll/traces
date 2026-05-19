import { each, last } from "lodash";
import Media from "./Media.js";
import * as THREE from "three";
import gsap from "gsap";
import { mod, lerpVec } from "@utils/math.js";
export default class Home {
  constructor({ scene, sizes, camera, transition }) {
    this.scene = scene;
    this.camera = camera;
    this.sizes = sizes;
    this.transition = transition;
    this.enableOpacityUpdate = true;
    this.group = new THREE.Group();
    this.addDebug();
    this.mediaElements = document.querySelectorAll(".carousel__item");
    this.isHoveringCarousel = false;
  }

  createMedia() {
    this.mediaInstances = [];
    each(this.mediaElements, (element) => {
      const media = new Media({
        element,
        group: this.group,
        sizes: this.sizes,
      });
      this.mediaInstances.push(media);
    });
  }

  createGallery() {
    this.spacing = this.mediaInstances[0].mesh.scale.y * (1 / 18);
    this.mediaInstances.forEach((media, i) => {
      media.mesh.position.z = -i * 0.5;
      media.mesh.position.y = i * this.spacing;
      media.mesh.rotation.x = 0.1;
    });
    const groupHeight =
      this.mediaInstances.length -
      1 * this.spacing +
      this.mediaInstances[0].mesh.scale.y;
    this.group.position.y = -groupHeight / 3;

    this.slotPositions = this.mediaInstances.map((media) => {
      return {
        x: media.mesh.position.x,
        y: media.mesh.position.y,
        z: media.mesh.position.z,
      };
    });
  }

  createRaycaster() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    window.addEventListener("mousemove", (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(
        this.mediaInstances.map((media) => media.mesh),
      );
      if (intersects.length > 0) {
        document.body.style.cursor = "pointer";
        this.isHoveringCarousel = true;
        this.onMouseOver(intersects[0].object);
      } else {
        document.body.style.cursor = "";
        this.isHoveringCarousel = false;
        this.onMouseOut();
      }
    });

    window.addEventListener("click", (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(
        this.mediaInstances.map((media) => media.mesh),
      );
      if (intersects.length > 0) {
        this.onClick(intersects[0].object);
      }
    });
  }

  getCurrentAlbum() {
    const current = this.mediaInstances.reduce(
      (closest, media) => {
        if (!closest.media) {
          closest = { dist: -Infinity, media: null };
        }

        const dist = media.mesh.position.z;
        const isVisible = media.mesh.material[0].opacity > 0.3;

        if (isVisible && dist > closest.dist) {
          closest.dist = dist;
          closest.media = media;
        }

        return closest;
      },
      { dist: -Infinity, media: null },
    );

    return current.media ? current.media.mesh.userData : null;
  }

  updateY() {
    if (!this.mediaElements) return;
    this.bounds = this.mediaElements[0].getBoundingClientRect();

    const normalizedY =
      (this.bounds.top + this.bounds.height * 0.5) / window.innerHeight;

    const worldY = this.sizes.height / 2 - normalizedY * this.sizes.height;

    this.group.position.y = worldY - 1;
  }
  update(scroll) {
    this.updateY(scroll);
  }

  onScroll(scrollInfo) {
    if (!this.mediaInstances || !this.isHoveringCarousel) return;
    const { position, velocity } = scrollInfo;
    const total = this.mediaInstances.length;
    const lastIndex = total - 1;

    this.mediaInstances.forEach((media, i) => {
      const rawIndex = i - position;
      const targetSlotIndex = mod(rawIndex, total);

      let opacity = 1;

      const fadeZone = 0.35;

      const i0 = Math.floor(targetSlotIndex);
      const t = targetSlotIndex - i0;
      const i1 = (i0 + 1) % total;

      const slotA = this.slotPositions[i0];
      const slotB = this.slotPositions[i1];

      if (velocity != 0) {
        if (targetSlotIndex < fadeZone && targetSlotIndex > -fadeZone) {
          opacity = Math.max(0, targetSlotIndex / fadeZone);
        }
        const distToEnd = targetSlotIndex - lastIndex;
        if (distToEnd > -fadeZone && distToEnd < 0) {
          opacity = Math.min(1, Math.abs(distToEnd / fadeZone));
        }
        if (slotA.z < slotB.z) {
          opacity = 0;
        }
      }

      const target = lerpVec(slotA, slotB, t);

      media.mesh.position.set(target.x, target.y, target.z);

      if (this.enableOpacityUpdate) {
        media.mesh.material.forEach((material) => {
          material.opacity = opacity;
        });
      }
    });
  }

  onClick(mesh) {
    // this.enableOpacityUpdate = false;
    console.log("click item");
  }

  onMouseOver(mesh) {
    this.mediaInstances.forEach((media) => {
      if (media != mesh) {
        gsap.to(media.mesh.rotation, {
          z: 0,
          duration: 0.3,
          ease: "power4.inOut",
        });
      }
    });

    gsap.to(mesh.rotation, {
      z: 0.03,
      duration: 0.3,
      ease: "power2.inOut",
    });
  }

  onMouseOut() {
    this.mediaInstances.forEach((media) => {
      gsap.to(media.mesh.rotation, {
        z: 0,
        duration: 0.3,
        ease: "power2.inOut",
      });
    });
  }

  onResize(sizes) {
    this.sizes = sizes;
    if (!this.mediaInstances) return;
    this.mediaInstances.forEach((media, i) => {
      media.onResize(this.sizes);
    });
    this.createGallery();
  }

  show(isPreloaded, isAlbumToDiscography) {
    this.enableOpacityUpdate = false;
    if (!this.mediaInstances) {
      this.createMedia();
      this.createGallery();
      this.createRaycaster();
      this.scene.add(this.group);
    }
    if (this.mediaInstances) {
      let delay = 1;
      this.mediaInstances.forEach((media, i) => media.show(delay + i * 0.05));
      setTimeout(
        () => {
          this.enableOpacityUpdate = true;
        },
        (delay + this.mediaInstances.length * 0.05) * 1000,
      );
    }
  }

  hide() {
    this.enableOpacityUpdate = false;
    this.scene.remove(this.group);
    if (this.mediaInstances) {
      this.mediaInstances.forEach((media) => media.hide());
    }
  }

  //debug
  addDebug() {
    window.addEventListener("keydown", (event) => {
      if (event.key === "d") {
        console.log(this.scene);
        this.camera.lookAt(this.group.position);
      }
    });
  }
}
