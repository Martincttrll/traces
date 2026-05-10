import gsap from "gsap";
import Component from "@classes/Component";
export class Preloader extends Component {
  constructor() {
    super({
      element: ".preloader",
      elements: {},
    });

    window.PRELOADED = {};

    this.animateIn();

    document.body.style.visibility = "visible";

    this.minDisplayTime = 1500;
    this.entryStartTime = performance.now();

    //Disable preloader for dev
    this.emit("completed");
    this.emit("animationCompleted");
    this.destroy();
    // this.loadAssets().then(() => {
    //   const elapsed = performance.now() - this.entryStartTime;
    //   const delay = Math.max(0, this.minDisplayTime - elapsed);
    //   setTimeout(() => {
    //     this.onLoaded();
    //   }, delay);
    // });
  }

  loadAssets() {
    return new Promise((resolve) => {
      const assets = window.ASSETS || [];

      const totalSteps = assets.length;
      let loaded = 0;

      if (totalSteps === 0) {
        this.updateCounter(100);
        resolve();
        return;
      }

      const onAssetLoad = () => {
        loaded++;
        const progress = Math.round((loaded / totalSteps) * 100);
        gsap.to(this, {
          dummy: progress,
          duration: 0.3,
          onUpdate: () => this.updateCounter(Math.round(this.dummy)),
        });
        if (loaded >= totalSteps) {
          resolve();
        }
      };

      assets.forEach((src) => {
        if (src.match(/\.(mp3|wav|ogg)$/)) {
          const audio = new Audio();
          audio.src = src;
          audio.crossOrigin = "anonymous";
          audio.preload = "auto";

          audio.addEventListener(
            "canplaythrough",
            () => {
              window.PRELOADED[src] = audio;
              onAssetLoad();
            },
            { once: true }
          );
          audio.addEventListener("error", onAssetLoad, { once: true });
        } else if (src.match(/\.(mp4|webm)$/)) {
          const video = document.createElement("video");
          video.src = src;
          video.preload = "auto";
          video.crossOrigin = "anonymous";

          video.addEventListener(
            "loadeddata",
            () => {
              window.PRELOADED[src] = video;
              onAssetLoad();
            },
            { once: true }
          );
          video.addEventListener("error", onAssetLoad, { once: true });
        } else {
          const img = new Image();
          img.src = src;
          img.crossOrigin = "anonymous";

          (img.onload = () => {
            window.PRELOADED[src] = img;
            onAssetLoad();
          }),
            { once: true };
          img.onerror = onAssetLoad;
        }
      });
    });
  }
  onLoaded() {
    return new Promise((resolve) => {
      this.emit("completed");

      this.animateOut = gsap.timeline({
        delay: 0.5,
        onComplete: () => {
          this.emit("animationCompleted");
          this.destroy();
          resolve();
        },
      });
      this.animateOut.to(this.element, {
        autoAlpha: 0,
        duration: 0.5,
        ease: "power2.inOut",
      });
    });
  }

  animateIn() {}

  updateCounter(value) {
    const padded = value.toString().padStart(3, "0");
    console.log(value);
  }
  destroy() {
    this.element.remove(this.element);
  }
}
