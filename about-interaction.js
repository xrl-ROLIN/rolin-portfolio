const playground = document.querySelector(".contact-playground");
const canvas = playground?.querySelector(".contact-playground__canvas");

if (playground && canvas) {
  const context = canvas.getContext("2d", { alpha: true });
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
    const gap = width < 700 ? 12 : 15;
    const columns = Math.ceil(width / gap) + 8;
    const rows = Math.ceil(height / gap) + 10;
    const nextParticles = [];

    for (let row = -5; row < rows; row += 1) {
      for (let column = -4; column < columns; column += 1) {
        const seed = row * 4099 + column * 131;
        const typeValue = seededRandom(seed + 1);
        const type = typeValue < 0.46 ? "square" : typeValue < 0.73 ? "circle" : "cross";
        const homeX = column * gap + (seededRandom(seed + 2) - 0.5) * gap * 0.82;
        const homeY = row * gap + (seededRandom(seed + 3) - 0.5) * gap * 0.82;
        const surface =
          height * 0.36 +
          Math.sin(homeX * 0.0052) * height * 0.095 +
          Math.sin(homeX * 0.012 + 1.7) * height * 0.045;

        if (homeY < surface) continue;
        nextParticles.push({
          homeX,
          homeY,
          x: homeX,
          y: homeY,
          velocityX: 0,
          velocityY: 0,
          phase: seededRandom(seed + 4) * Math.PI * 2,
          drift: 0.5 + seededRandom(seed + 5) * 0.65,
          type,
          size:
            type === "square"
              ? 5.8 + seededRandom(seed + 7) * 3
              : 3.4 + seededRandom(seed + 7) * 1.9,
          rotation: seededRandom(seed + 8) * Math.PI,
          spin: (seededRandom(seed + 9) - 0.5) * 0.012,
          opacity: 0.78 + seededRandom(seed + 10) * 0.22,
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

  function draw(time, delta = 16.67) {
    const seconds = reducedMotion ? 0 : time * 0.001;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#ffffff";

    pointer.x += (pointer.targetX - pointer.x) * 0.22;
    pointer.y += (pointer.targetY - pointer.y) * 0.22;
    const targetRadius =
      pointer.active && !reducedMotion
        ? width < 700
          ? Math.min(105, width * 0.34)
          : Math.min(165, width * 0.11)
        : 0;
    pointer.radius += (targetRadius - pointer.radius) * 0.16;
    const frameScale = Math.min(1.8, delta / 16.67);

    particles.forEach((particle) => {
      const wave =
        Math.sin(particle.homeX * 0.0054 + seconds * 0.78) * 8 +
        Math.sin(particle.homeX * 0.013 - seconds * 0.43 + particle.phase) * 3.5;
      const targetX =
        particle.homeX +
        Math.sin(seconds * particle.drift + particle.phase) * 1.8;
      const targetY = particle.homeY + wave;

      particle.velocityX += (targetX - particle.x) * 0.01 * frameScale;
      particle.velocityY += (targetY - particle.y) * 0.01 * frameScale;

      const deltaX = particle.x - pointer.x;
      const deltaY = particle.y - pointer.y;
      const distance = Math.hypot(deltaX, deltaY) || 1;

      if (distance < pointer.radius && pointer.radius > 1) {
        const force = Math.pow(1 - distance / pointer.radius, 2);
        const impulse = 4.4 + Math.min(12, Math.hypot(pointer.velocityX, pointer.velocityY) * 0.11);
        particle.velocityX +=
          ((deltaX / distance) * impulse + pointer.velocityX * 0.1) * force * frameScale;
        particle.velocityY +=
          ((deltaY / distance) * impulse + pointer.velocityY * 0.1) * force * frameScale;
        particle.spin +=
          (pointer.velocityX * deltaY - pointer.velocityY * deltaX) *
          0.000003 *
          force;
      }

      const damping = Math.pow(0.94, frameScale);
      particle.velocityX *= damping;
      particle.velocityY *= damping;
      particle.x += particle.velocityX * frameScale;
      particle.y += particle.velocityY * frameScale;
      particle.rotation += particle.spin * frameScale;
      particle.spin *= Math.pow(0.975, frameScale);

      drawShape(particle, particle.x, particle.y, particle.opacity);
    });

    context.globalAlpha = 1;
  }

  function animate(time) {
    const delta = Math.min(32, time - previousTime);
    previousTime = time;
    pointer.velocityX *= Math.pow(0.86, delta / 16.67);
    pointer.velocityY *= Math.pow(0.86, delta / 16.67);
    draw(time, delta);
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
