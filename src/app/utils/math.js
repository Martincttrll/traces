const mod = (n, m) => ((n % m) + m) % m;
const lerp = (a, b, t) => a + (b - a) * t;
const lerpVec = (a, b, t) => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  z: lerp(a.z, b.z, t),
});
export { mod, lerp, lerpVec };
