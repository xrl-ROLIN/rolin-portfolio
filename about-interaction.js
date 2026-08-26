const section = document.querySelector(".contact-playground");
const stage = section?.querySelector(".contact-playground__stage");
const canvas = section?.querySelector(".contact-playground__canvas");

if (section && stage && canvas) {
  const context = canvas.getContext("2d", { alpha: true });
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = matchMedia("(pointer: coarse)").matches;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const fit = (value, min, max, outMin, outMax) =>
    outMin + ((clamp(value, min, max) - min) / (max - min)) * (outMax - outMin);

  class FluidParticles {
    constructor() {
      this.particles = [];
      this.hash = new Map();
      this.emitCarry = 0;
      this.flushing = false;
      this.emitterA = { x: 0, y: 0 };
      this.emitterB = { x: 0, y: 0 };
    }

    reset(width, height) {
      this.width = width;
      this.height = height;
      const resolution = Math.ceil(fit(width, 320, 2560, 20, 90) * 0.4);
      const countX = Math.ceil(fit(width, 320, 2560, 20, 80) * 0.4);
      const countY = Math.ceil((countX * height) / width);
      this.maxParticles =
        Math.ceil((countX * countY * 1.2) / 3) * 3;
      this.radius = (width / resolution) * 0.2;
      this.minimumDistance = this.radius * 3;
      this.hashSize = this.minimumDistance;
      const aspectGravity = clamp(
        height / width / 0.75,
        0.42,
        1,
      );
      this.gravity =
        Math.abs(
          Math.ceil(fit(width, 320, 2560, -15, -3)) *
            1.5 *
            (width / 2),
        ) * aspectGravity;
      this.particles.length = 0;
      this.emitCarry = 0;
      this.flushing = false;
      this.setEmitter(width * 0.5, height * 0.5, width * 0.5, height * 0.5);
    }

    setEmitter(ax, ay, bx, by) {
      this.emitterA.x = ax;
      this.emitterA.y = ay;
      this.emitterB.x = bx;
      this.emitterB.y = by;
    }

    emit(deltaTime) {
      this.emitCarry += 2000 * deltaTime;
      let amount = Math.floor(this.emitCarry);
      this.emitCarry -= amount;

      while (amount > 0 && this.particles.length < this.maxParticles) {
        const ratio = Math.random();
        const x =
          this.emitterA.x +
          (this.emitterB.x - this.emitterA.x) * ratio +
          (Math.random() - 0.5) * this.radius;
        const y =
          this.emitterA.y +
          (this.emitterB.y - this.emitterA.y) * ratio +
          (Math.random() - 0.5) * this.radius;
        this.particles.push({
          x,
          y,
          previousX: x,
          previousY: y,
          velocityX: 0,
          velocityY: (2 + Math.pow(Math.random(), 2) * 3) * this.gravity * 0.1,
          angle: Math.random() * Math.PI * 2,
          angularVelocity: 0,
          direction: Math.PI * 0.5,
          shape: this.particles.length % 3,
        });
        amount -= 1;
      }
    }

    rebuildHash() {
      this.hash.clear();
      const inverse = 1 / this.hashSize;
      this.particles.forEach((particle, index) => {
        const x = Math.floor(particle.x * inverse);
        const y = Math.floor(particle.y * inverse);
        const key = `${x}:${y}`;
        const bucket = this.hash.get(key);
        if (bucket) bucket.push(index);
        else this.hash.set(key, [index]);
      });
    }

    separate() {
      const minimum = this.minimumDistance;
      const minimumSquared = minimum * minimum;
      const inverse = 1 / this.hashSize;

      for (let pass = 0; pass < 4; pass += 1) {
        this.rebuildHash();
        this.particles.forEach((particle, index) => {
          const cellX = Math.floor(particle.x * inverse);
          const cellY = Math.floor(particle.y * inverse);

          for (let x = cellX - 1; x <= cellX + 1; x += 1) {
            for (let y = cellY - 1; y <= cellY + 1; y += 1) {
              const bucket = this.hash.get(`${x}:${y}`);
              if (!bucket) continue;

              bucket.forEach((otherIndex) => {
                if (otherIndex <= index) return;
                const other = this.particles[otherIndex];
                let deltaX = other.x - particle.x;
                let deltaY = other.y - particle.y;
                let distanceSquared = deltaX * deltaX + deltaY * deltaY;

                if (distanceSquared >= minimumSquared) return;
                if (distanceSquared < 0.0001) {
                  deltaX = (Math.random() - 0.5) * 0.01;
                  deltaY = (Math.random() - 0.5) * 0.01;
                  distanceSquared = deltaX * deltaX + deltaY * deltaY;
                }

                const distance = Math.sqrt(distanceSquared);
                const correction = (minimum - distance) / distance * 0.5;
                deltaX *= correction;
                deltaY *= correction;
                particle.x -= deltaX;
                particle.y -= deltaY;
                other.x += deltaX;
                other.y += deltaY;
              });
            }
          }
        });
      }
    }

    collide(particle, obstacle, deltaTime) {
      const minimumX = this.radius;
      const maximumX = this.width - this.radius;
      const minimumY = this.radius;
      const maximumY = this.height - this.radius;
      const deltaX = particle.x - obstacle.x;
      const deltaY = particle.y - obstacle.y;
      const collisionRadius = obstacle.radius + this.radius;
      const distanceSquared = deltaX * deltaX + deltaY * deltaY;
      const distance = Math.sqrt(distanceSquared);
      const pointerSpeed = Math.hypot(
        obstacle.velocityX,
        obstacle.velocityY,
      );

      if (
        obstacle.radius > 0 &&
        distanceSquared > 0 &&
        distanceSquared < collisionRadius * collisionRadius
      ) {
        const correction = (collisionRadius - distance) / distance;
        particle.x += deltaX * correction;
        particle.y += deltaY * correction;
      }

      const waveRadius = collisionRadius * 2.1;
      if (
        obstacle.radius > 0 &&
        distanceSquared > 0 &&
        distance < waveRadius
      ) {
        const normalX = deltaX / distance;
        const normalY = deltaY / distance;
        const tangentX = -normalY;
        const tangentY = normalX;
        const direction =
          Math.sign(
            obstacle.velocityX * deltaY -
              obstacle.velocityY * deltaX,
          ) || 1;
        const falloff = Math.pow(1 - distance / waveRadius, 2);
        const spray = Math.min(
          this.width * 1.5,
          180 + pointerSpeed * 0.7,
        );
        const waveVelocityX =
          obstacle.velocityX * 0.5 +
          normalX * spray * 0.55 +
          tangentX * direction * spray * 0.24;
        const waveVelocityY =
          obstacle.velocityY * 0.22 +
          normalY * spray * 0.3 +
          tangentY * direction * spray * 0.12 -
          spray * 0.78;
        particle.previousX =
          particle.x - waveVelocityX * falloff * deltaTime;
        particle.previousY =
          particle.y - waveVelocityY * falloff * deltaTime;
      }

      if (particle.x < minimumX) {
        particle.x = minimumX;
        particle.previousX = particle.x;
      } else if (particle.x > maximumX) {
        particle.x = maximumX;
        particle.previousX = particle.x;
      }

      if (particle.y < minimumY) {
        particle.y = minimumY;
        particle.previousY = particle.y;
      } else if (particle.y > maximumY) {
        if (this.flushing) {
          particle.remove = true;
        } else {
          particle.y = maximumY;
          particle.previousY = particle.y;
        }
      }
    }

    simulate(deltaTime, obstacle) {
      const dt = Math.min(deltaTime, 1 / 60);
      this.emit(dt);

      this.particles.forEach((particle) => {
        particle.previousX = particle.x;
        particle.previousY = particle.y;
        particle.velocityY += this.gravity * dt;
        particle.x += particle.velocityX * dt;
        particle.y += particle.velocityY * dt;
      });

      this.separate();

      this.particles.forEach((particle) => {
        this.collide(particle, obstacle, dt);
        particle.velocityX =
          ((particle.x - particle.previousX) / dt) * 0.985;
        particle.velocityY =
          ((particle.y - particle.previousY) / dt) * 0.985;
        const speed = Math.hypot(particle.velocityX, particle.velocityY);
        if (speed > 0.01) {
          const direction = Math.atan2(
            particle.velocityY,
            particle.velocityX,
          );
          let change = direction - particle.direction;
          while (change > Math.PI) change -= Math.PI * 2;
          while (change < -Math.PI) change += Math.PI * 2;
          particle.angularVelocity += speed * change * 0.002;
          particle.angularVelocity *= Math.exp(-4 * dt);
          particle.angle += particle.angularVelocity * dt;
          particle.direction = direction;
        }
      });

      if (this.flushing) {
        this.particles = this.particles.filter((particle) => !particle.remove);
      }
    }

    draw(context) {
      context.fillStyle = "#fff";
      const baseSize = this.radius;
      this.particles.forEach((particle) => {
        const movementScale = 1 + Math.min(1, Math.abs(particle.angularVelocity) * 0.01);
        const size = baseSize * movementScale;
        context.save();
        context.translate(particle.x, particle.y);
        context.rotate(particle.angle);

        if (particle.shape === 0) {
          const arm = size * 0.5;
          const stroke = size * 0.14;
          context.fillRect(-arm, -stroke * 0.5, arm * 2, stroke);
          context.fillRect(-stroke * 0.5, -arm, stroke, arm * 2);
        } else if (particle.shape === 1) {
          const squareSize = size;
          context.fillRect(
            -squareSize * 0.5,
            -squareSize * 0.5,
            squareSize,
            squareSize,
          );
        } else {
          context.beginPath();
          context.arc(0, 0, size * 0.4, 0, Math.PI * 2);
          context.fill();
        }
        context.restore();
      });
    }
  }

  const fluid = new FluidParticles();
  const pointer = {
    x: 0,
    y: 0,
    previousX: 0,
    previousY: 0,
    velocityX: 0,
    velocityY: 0,
    active: false,
    down: false,
  };
  let width = 1;
  let height = 1;
  let pixelRatio = 1;
  let frame = 0;
  let previousTime = performance.now();
  let visible = false;
  let layoutWidth = 0;
  let viewportResizeFrame = 0;

  function syncStableViewportHeight(force = false) {
    const nextWidth = document.documentElement.clientWidth;
    if (!force && Math.abs(nextWidth - layoutWidth) < 16) return;
    layoutWidth = nextWidth;
    section.style.setProperty("--contact-vh", `${innerHeight * 0.01}px`);
  }

  function resize() {
    const bounds = stage.getBoundingClientRect();
    const nextWidth = Math.max(1, bounds.width);
    const nextHeight = Math.max(1, bounds.height);
    if (
      Math.abs(nextWidth - width) < 1 &&
      Math.abs(nextHeight - height) < 1
    ) {
      return;
    }
    width = nextWidth;
    height = nextHeight;
    pixelRatio = Math.min(devicePixelRatio || 1, 1.6);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    fluid.reset(width, height);
    pointer.x = pointer.previousX = width * 0.5;
    pointer.y = pointer.previousY = height * 0.5;
  }

  function updateScrollState() {
    const bounds = section.getBoundingClientRect();
    const reveal = clamp((height - bounds.top) / (height * 0.75), 0, 1);
    stage.style.setProperty("--contact-reveal", reveal.toFixed(4));
  }

  function renderParticles() {
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);
    fluid.draw(context);
  }

  function animate(time) {
    const deltaTime = Math.max(
      1 / 120,
      Math.min(1 / 30, (time - previousTime) / 1000),
    );
    previousTime = time;
    pointer.velocityX = (pointer.x - pointer.previousX) / deltaTime;
    pointer.velocityY = (pointer.y - pointer.previousY) / deltaTime;
    const speed = Math.hypot(pointer.velocityX, pointer.velocityY);
    const radius =
      pointer.active && !(pointer.down && !coarsePointer)
        ? 75 * (coarsePointer && pointer.down ? 0.35 : fit(speed, 0, width, 0.2, 1))
        : 0;

    if (pointer.down && !coarsePointer) {
      fluid.flushing = true;
      fluid.setEmitter(
        pointer.previousX,
        pointer.previousY,
        pointer.x,
        pointer.y,
      );
    } else {
      fluid.flushing = false;
      fluid.setEmitter(width * 0.5, height * 0.5, width * 0.5, height * 0.5);
    }

    fluid.simulate(deltaTime, {
      x: pointer.x,
      y: pointer.y,
      radius,
      velocityX: pointer.velocityX,
      velocityY: pointer.velocityY,
    });
    pointer.previousX = pointer.x;
    pointer.previousY = pointer.y;

    renderParticles();
    updateScrollState();
    frame = requestAnimationFrame(animate);
  }

  function start() {
    if (frame) return;
    if (reducedMotion) {
      const obstacle = {
        x: -1000,
        y: -1000,
        radius: 0,
        velocityX: 0,
        velocityY: 0,
      };
      for (let index = 0; index < 90; index += 1) {
        fluid.simulate(1 / 60, obstacle);
      }
      renderParticles();
      return;
    }
    previousTime = performance.now();
    frame = requestAnimationFrame(animate);
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
  }

  function updatePointer(event) {
    const bounds = stage.getBoundingClientRect();
    pointer.x = clamp(event.clientX - bounds.left, 0, width);
    pointer.y = clamp(event.clientY - bounds.top, 0, height);
    pointer.active = true;
  }

  function resetPointer() {
    pointer.active = false;
    pointer.down = false;
    fluid.flushing = false;
  }

  function updateTouch(event) {
    const touch = event.touches[0];
    if (!touch) return;
    updatePointer(touch);
    pointer.down = true;
  }

  stage.addEventListener("pointermove", updatePointer);
  stage.addEventListener("pointerenter", updatePointer);
  stage.addEventListener("pointerleave", resetPointer);
  stage.addEventListener("pointercancel", resetPointer);
  stage.addEventListener("lostpointercapture", resetPointer);
  stage.addEventListener("pointerdown", (event) => {
    updatePointer(event);
    pointer.down = true;
    stage.setPointerCapture?.(event.pointerId);
  });
  stage.addEventListener("pointerup", (event) => {
    updatePointer(event);
    pointer.down = false;
    stage.releasePointerCapture?.(event.pointerId);
  });
  if (coarsePointer) {
    stage.addEventListener("touchstart", updateTouch, { passive: true });
    stage.addEventListener("touchmove", updateTouch, { passive: true });
    stage.addEventListener("touchend", resetPointer, { passive: true });
    stage.addEventListener("touchcancel", resetPointer, { passive: true });
  }
  addEventListener("scroll", updateScrollState, { passive: true });
  addEventListener(
    "resize",
    () => {
      cancelAnimationFrame(viewportResizeFrame);
      viewportResizeFrame = requestAnimationFrame(() => {
        syncStableViewportHeight();
        updateScrollState();
      });
    },
    { passive: true },
  );
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (visible) start();
  });
  new ResizeObserver(resize).observe(stage);
  new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    },
    { rootMargin: "60% 0px", threshold: 0 },
  ).observe(section);

  syncStableViewportHeight(true);
  resize();
  updateScrollState();
}
