import { createNoise2D } from "simplex-noise";

export default class Particles {
  constructor({ canvas }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.particles = [];
    this.rafId = null;
    this.noise2D = createNoise2D();

    this.config = {
      gap: 3, // espacement grille en px
      noiseScale: 0.002, // zoom du bruit (plus petit = tâches plus larges)
      threshold: 0.01, // seuil de densité (-1 à 1)
      radius: 120, // rayon de répulsion souris en px
      strength: 8, // force du push
      ease: 0.1, // vitesse de retour (0.05 lent → 0.15 rapide)
      baseColor: "#666",
      hoverColor: "#666",
    };
    this.mouse = { x: -9999, y: -9999 };

    this.bindEvents();
    this.init();
    this.animate();
  }

  init() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;

    this.particles = [];
    this.createParticles();
  }

  createParticles() {
    const { gap, noiseScale, threshold } = this.config;

    for (let x = 0; x < this.width; x += gap) {
      for (let y = 0; y < this.height; y += gap) {
        const n = this.noise2D(x * noiseScale, y * noiseScale);
        // noise2D retourne entre -1 et 1
        // on ne crée une particule que si le bruit dépasse le seuil
        if (n > threshold) {
          const alpha = Math.pow((n - threshold) / (1 - threshold), 1.5);
          this.particles.push({
            x,
            y,
            originX: x,
            originY: y,
            size: Math.random() * 0.2 + 0.4, // légère variation de taille
            alpha,
          });
        }
      }
    }
  }

  update() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.animate();
    this.draw();
  }

  animate() {
    const { radius, strength, ease } = this.config;
    const { x: mx, y: my } = this.mouse;

    for (const p of this.particles) {
      const dx = p.x - mx;
      const dy = p.y - my;
      // évite Math.sqrt tant que possible
      const distSq = dx * dx + dy * dy;

      if (distSq < radius * radius) {
        const dist = Math.sqrt(distSq);
        const force = (radius - dist) / radius; // 1 au centre, 0 au bord
        const angle = Math.atan2(dy, dx);
        p.x += Math.cos(angle) * force * strength;
        p.y += Math.sin(angle) * force * strength;
      }

      // Lerp de retour — actif en permanence
      p.x += (p.originX - p.x) * ease;
      p.y += (p.originY - p.y) * ease;
    }
  }

  draw() {
    const { radius } = this.config;
    const { x: mx, y: my } = this.mouse;
    const radiusSq = radius * radius;

    for (const p of this.particles) {
      const dx = p.x - mx;
      const dy = p.y - my;
      const isNear = dx * dx + dy * dy < radiusSq;

      // couleur selon proximité souris, alpha selon position dans la tache
      this.ctx.fillStyle = isNear
        ? `rgba(232, 71, 26, ${p.alpha + 0.5})`
        : `rgba(100, 100, 100, ${p.alpha + 0.5})`;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  bindEvents() {
    // Bind pour pouvoir les retirer proprement dans destroy()
    this._onMouseMove = (e) => this.onMouseMove(e);
    this._onMouseLeave = () => this.onMouseLeave();
    this._onResize = () => this.init();

    this.canvas.addEventListener("mousemove", this._onMouseMove);
    this.canvas.addEventListener("mouseleave", this._onMouseLeave);
    window.addEventListener("resize", this._onResize);
  }
  onMouseMove(e) {
    // getBoundingClientRect pour avoir les coords relatives au canvas
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
  }

  onMouseLeave() {
    this.mouse.x = -9999;
    this.mouse.y = -9999;
  }

  // ——————————————————————————————————————————
  // Cleanup (important en SPA type Nuxt/Next)
  // ——————————————————————————————————————————

  destroy() {
    this.canvas.removeEventListener("mousemove", this._onMouseMove);
    this.canvas.removeEventListener("mouseleave", this._onMouseLeave);
    window.removeEventListener("resize", this._onResize);
  }
}
