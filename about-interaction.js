const playground = document.querySelector(".contact-playground");
const canvas = playground?.querySelector(".contact-playground__canvas");

if (playground && canvas) {
  const context = canvas.getContext("2d", { alpha: false });
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pointer = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    velocityX: 0,
    velocityY: 0,
    radius: 0,
    active: false,
  };

  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let particles = [];
  let isVisible = false;
  let animationFrame = 0;
  let previousTime = performance.now();

  function seededRandom(seed) {
    const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return value - Math.floor(value);
  }

  function buildParticles() {
    const gap = width < 700 ? 16 : 19;
    const columns = Math.ceil(width / gap) + 6;
    const rows = Math.ceil(height / gap) + 8;
    const nextParticles = [];

    for (let row = -4; row < rows; row += 1) {
      for (let column = -3; column < columns; column += 1) {
        const seed = row * 4099 + column * 131;
        const typeValue = seededRandom(seed + 1);
        const type = typeValue < 0.48 ? "square" : typeValue < 0.75 ? "circle" : "cross";

        nextParticles.push({
          baseX: column * gap + (seededRandom(seed + 2) - 0.5) * gap * 0.72,
          baseY: row * gap + (seededRandom(seed + 3) - 0.5) * gap * 0.72,
          phase: seededRandom(seed + 4) * Math.PI * 2,
          drift: 0.55 + seededRandom(seed + 5) * 0.8,
          scatter: seededRandom(seed + 6),
          type,
          size:
            type === "square"
              ? 6.4 + seededRandom(seed + 7) * 4.6
              : 3.2 + seededRandom(seed + 7) * 2.6,
          rotation: seededRandom(seed + 8) * Math.PI,
        });
      }
    }

    particles = nextParticles;
  }

  function resizeCanvas() {
    const bounds = playground.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.6);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    pointer.x = pointer.targetX = width * 0.5;
    pointer.y = pointer.targetY = height * 0.5;
    buildParticles();
    draw(performance.now());
  }

  function drawShape(particle, x, y, opacity) {
    const size = particle.size;
    context.globalAlpha = opacity;

    if (particle.type === "circle") {
      context.beginPath();
      context.arc(x, y, size * 0.48, 0, Math.PI * 2);
      context.fill();
      return;
    }

    if (particle.type === "cross") {
      const arm = size * 0.58;
      const stroke = Math.max(1.1, size * 0.2);
      context.save();
      context.translate(x, y);
      context.rotate(particle.rotation);
      context.fillRect(-arm, -stroke * 0.5, arm * 2, stroke);
      context.fillRect(-stroke * 0.5, -arm, stroke, arm * 2);
      context.restore();
      return;
    }

    context.save();
    context.translate(x, y);
    context.rotate(particle.rotation * 0.35);
    context.fillRect(-size * 0.5, -size * 0.5, size, size);
    context.restore();
  }

  function draw(time) {
    const seconds = reducedMotion ? 0 : time * 0.001;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.fillStyle = "#2722f4";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#ffffff";

    pointer.x += (pointer.targetX - pointer.x) * 0.13;
    pointer.y += (pointer.targetY - pointer.y) * 0.13;
    pointer.velocityX *= 0.88;
    pointer.velocityY *= 0.88;
    const targetRadius = pointer.active && !reducedMotion ? Math.min(width, height) * 0.19 : 0;
    pointer.radius += (targetRadius - pointer.radius) * 0.09;

    particles.forEach((particle) => {
      const surface =
        height * 0.3 +
        Math.sin(particle.baseX * 0.0042 + seconds * 0.72) * height * 0.1 +
        Math.sin(particle.baseX * 0.009 - seconds * 0.46 + particle.phase) * height * 0.052;
      const distanceBelowSurface = particle.baseY - surface;
      const isFloating =
        particle.scatter > 0.958 &&
        particle.baseY > surface - height * 0.28;

      if (distanceBelowSurface < 0 && !isFloating) return;

      let x =
        particle.baseX +
        Math.sin(seconds * particle.drift + particle.phase) * 7 +
        Math.sin(particle.baseY * 0.008 - seconds * 0.32) * 5;
      let y =
        particle.baseY +
        Math.sin(particle.baseX * 0.007 + seconds * 0.86 + particle.phase) * 12 +
        Math.cos(particle.baseY * 0.011 - seconds * 0.5) * 5;

      if (isFloating) {
        y -= (particle.scatter - 0.958) * height * 5.2;
      }

      const deltaX = x - pointer.x;
      const deltaY = y - pointer.y;
      const distance = Math.hypot(deltaX, deltaY) || 1;

      if (distance < pointer.radius) {
        const force = Math.pow(1 - distance / pointer.radius, 2);
        x += (deltaX / distance) * force * Math.min(width, height) * 0.15;
        y += (deltaY / distance) * force * Math.min(width, height) * 0.15;
        x += pointer.velocityX * force * 0.18;
        y += pointer.velocityY * force * 0.18;
      }

      const depthOpacity = Math.min(1, Math.max(0.28, distanceBelowSurface / (height * 0.22)));
      drawShape(particle, x, y, isFloating ? 0.9 : depthOpacity);
    });

    context.globalAlpha = 1;
  }

  function animate(time) {
    const delta = Math.min(32, time - previousTime);
    previousTime = time;
    pointer.velocityX *= Math.pow(0.92, delta / 16.67);
    pointer.velocityY *= Math.pow(0.92, delta / 16.67);
    draw(time);
    animationFrame = requestAnimationFrame(animate);
  }

  function startAnimation() {
    if (animationFrame || reducedMotion) return;
    previousTime = performance.now();
    animationFrame = requestAnimationFrame(animate);
  }

  function stopAnimation() {
    if (!animationFrame) return;
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  }

  playground.addEventListener("pointermove", (event) => {
    const bounds = playground.getBoundingClientRect();
    const nextX = event.clientX - bounds.left;
    const nextY = event.clientY - bounds.top;
    pointer.velocityX = nextX - pointer.targetX;
    pointer.velocityY = nextY - pointer.targetY;
    pointer.targetX = nextX;
    pointer.targetY = nextY;
    pointer.active = true;
  });

  playground.addEventListener("pointerleave", () => {
    pointer.active = false;
  });

  playground.addEventListener("pointercancel", () => {
    pointer.active = false;
  });

  new ResizeObserver(resizeCanvas).observe(playground);

  new IntersectionObserver(
    ([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) {
        startAnimation();
      } else {
        stopAnimation();
      }
    },
    { threshold: 0.02 },
  ).observe(playground);

  resizeCanvas();
}
