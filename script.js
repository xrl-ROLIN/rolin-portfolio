const projectCursor = document.querySelector(".project-cursor");
const scrollBird = document.querySelector(".scroll-bird");
const intro = document.querySelector(".intro");
const enterButton = document.querySelector(".enter-site");
const storySquare = document.querySelector(".story-square");
const jumpShadow = document.querySelector(".jump-shadow");
const jumpRibbon = document.querySelector(".jump-ribbon");
const jumpRibbonPath = document.querySelector(".jump-ribbon-path");
const squareScene = document.querySelector(".scene-square");
const playerScene = document.querySelector(".scene-player");
const wipeScene = document.querySelector(".scene-wipe");
const cubeScene = document.querySelector(".scene-cube");
const volleyballContainer = document.querySelector(".volleyball-motion");
const networkCopy = document.querySelector(".network-copy");
const cubeStage = document.querySelector(".cube-stage");
const progressBar = document.querySelector(".intro-progress i");
const progressNumber = document.querySelector(".progress-number");
const projectSection = document.querySelector("#project");
const siteBack = document.querySelector(".site-back");
const directorySlides = [...document.querySelectorAll(".directory-slide")];
const directoryCategoryEn = document.querySelector(".directory-category-en");
const directoryCategoryCn = document.querySelector(".directory-category-cn");
const directoryHome = document.querySelector(".directory-home");
const legacyBirdMotion = false;

let mouseX = -120;
let mouseY = -120;
let cursorX = -120;
let cursorY = -120;
let projectCursorVisible = false;
let birdTimer = 0;
let lastBirdPoint = null;
let birdDirection = 1;
let birdTargetX = -120;
let birdTargetY = -120;
let birdCurrentX = -120;
let birdCurrentY = -120;
let birdTargetRotation = 0;
let birdCurrentRotation = 0;
let birdTargetScale = 1;
let birdCurrentScale = 1;
let birdTargetYaw = 0;
let birdCurrentYaw = 0;
let birdInputVelocityX = 0;
let birdInputVelocityY = 0;
let birdVelocityX = 0;
let birdVelocityY = 0;
let birdLastFrameTime = performance.now();
let birdNeedsReset = true;

window.addEventListener("pointermove", (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
  projectCursorVisible = Boolean(event.target.closest?.(".directory-slide"));
  projectCursor.classList.toggle("is-visible", projectCursorVisible);
  if (legacyBirdMotion) animateMouseBird(event, projectCursorVisible);
});

window.addEventListener("pointerleave", () => {
  projectCursorVisible = false;
  projectCursor.classList.remove("is-visible");
  if (legacyBirdMotion) hideMouseBird(true);
});

function animateCursor() {
  cursorX += (mouseX - cursorX) * 0.32;
  cursorY += (mouseY - cursorY) * 0.32;
  projectCursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
  requestAnimationFrame(animateCursor);
}
animateCursor();

function animateBirdFlight(now) {
  const delta = Math.min(0.034, Math.max(0.001, (now - birdLastFrameTime) / 1000));
  birdLastFrameTime = now;
  const positionFollow = 1 - Math.exp(-delta * 15);
  const rotationFollow = 1 - Math.exp(-delta * 9);
  const yawFollow = 1 - Math.exp(-delta * 8);
  const velocityFollow = 1 - Math.exp(-delta * 11);

  birdVelocityX += (birdInputVelocityX - birdVelocityX) * velocityFollow;
  birdVelocityY += (birdInputVelocityY - birdVelocityY) * velocityFollow;
  birdCurrentX += (birdTargetX - birdCurrentX) * positionFollow;
  birdCurrentY += (birdTargetY - birdCurrentY) * positionFollow;
  birdCurrentRotation += (birdTargetRotation - birdCurrentRotation) * rotationFollow;
  birdCurrentScale += (birdTargetScale - birdCurrentScale) * rotationFollow;
  birdCurrentYaw += (birdTargetYaw - birdCurrentYaw) * yawFollow;

  scrollBird?.style.setProperty("--bird-x", `${birdCurrentX}px`);
  scrollBird?.style.setProperty("--bird-y", `${birdCurrentY}px`);
  scrollBird?.style.setProperty("--bird-rotation", `${birdCurrentRotation}deg`);
  scrollBird?.style.setProperty("--bird-scale", String(birdCurrentScale));
  scrollBird?.style.setProperty("--bird-yaw", `${birdCurrentYaw}deg`);
  requestAnimationFrame(animateBirdFlight);
}
if (legacyBirdMotion) requestAnimationFrame(animateBirdFlight);

function hideMouseBird(resetPosition = false) {
  window.clearTimeout(birdTimer);
  scrollBird?.classList.remove("is-flying");
  document.body.classList.remove("bird-active");
  birdInputVelocityX = 0;
  birdInputVelocityY = 0;
  if (resetPosition) {
    lastBirdPoint = null;
    birdNeedsReset = true;
  }
}

function animateMouseBird(event, overDirectoryImage) {
  if (!scrollBird || event.pointerType && event.pointerType !== "mouse") return;

  const point = { x: event.clientX, y: event.clientY, time: performance.now() };
  if (overDirectoryImage) {
    hideMouseBird();
    lastBirdPoint = point;
    return;
  }

  if (!lastBirdPoint) {
    lastBirdPoint = point;
    birdTargetX = point.x;
    birdTargetY = point.y;
    if (birdNeedsReset) {
      birdCurrentX = point.x;
      birdCurrentY = point.y;
      birdCurrentRotation = 0;
      birdTargetRotation = 0;
      birdCurrentScale = 1;
      birdTargetScale = 1;
      birdCurrentYaw = birdDirection > 0 ? 0 : 180;
      birdTargetYaw = birdCurrentYaw;
      birdNeedsReset = false;
    }
    return;
  }

  const dx = point.x - lastBirdPoint.x;
  const dy = point.y - lastBirdPoint.y;
  const distance = Math.hypot(dx, dy);
  if (distance < 2) return;

  const elapsed = Math.max(8, point.time - lastBirdPoint.time);
  const velocityX = clampBird((dx / elapsed) * 1000, -1800, 1800);
  const velocityY = clampBird((dy / elapsed) * 1000, -1800, 1800);
  const speed = Math.hypot(velocityX, velocityY);
  const nextDirection = Math.abs(dx) > 2.5 ? Math.sign(dx) : birdDirection;
  birdDirection = nextDirection;

  window.clearTimeout(birdTimer);
  birdInputVelocityX = velocityX;
  birdInputVelocityY = velocityY;
  birdTargetX = point.x;
  birdTargetY = point.y;
  birdTargetRotation = clampBird(Math.atan2(velocityY, Math.max(Math.abs(velocityX), 90)) * 25, -24, 24);
  birdTargetScale = clampBird(0.96 + speed / 11000, 0.96, 1.07);
  birdTargetYaw = birdDirection > 0 ? 0 : 180;
  scrollBird.classList.add("is-flying");
  document.body.classList.add("bird-active");
  birdTimer = window.setTimeout(hideMouseBird, 250);
  lastBirdPoint = point;
}

function clampBird(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

document.body.classList.add("intro-active");
window.history.scrollRestoration = "manual";
window.scrollTo(0, 0);

const cubeContent = [
  ["Campaign / IP", "Moy Leon", "Art Direction / UI / Motion"],
  ["Brand & Packaging", "Catffee", "Brand Research / IP Design"],
  ["Illustration", "Sisyphe", "Narrative Design / 2026"],
  ["3D & AIGC", "Bandana", "Product Visual / Material Study"],
  ["Portfolio", "Selected Work", "Campaign / Illustration / Brand / 3D"],
  ["Focus", "Living Screens", "Playful / Precise / Memorable"],
  ["Role", "Art Direction", "UI / Motion / Visual Systems"],
  ["Interaction", "Character Led", "IP Guidance / Reward Loops"],
  ["Visual System", "Square Language", "Object / Figure / Interface"],
  ["Moy Leon", "Live Social", "Points / Rewards / Creator Moments"],
  ["Catffee", "Mascot Soul", "Identity / Packaging / Story"],
  ["Sisyphe", "Secret Garden", "Reading / Day / Night"],
];

document.querySelectorAll(".cube-face").forEach((face, faceIndex) => {
  face.innerHTML = Array.from({ length: 9 }, (_, tileIndex) => {
    const item = cubeContent[(tileIndex + faceIndex * 2) % cubeContent.length];
    return `<div class="cube-tile"><small>${item[0]}</small><strong>${item[1]}</strong><em>${item[2]}</em></div>`;
  }).join("");
});

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const mix = (start, end, amount) => start + (end - start) * amount;
const smoothstep = (start, end, value) => {
  const amount = clamp((value - start) / (end - start));
  return amount * amount * (3 - 2 * amount);
};

let volleyballAnimation = null;
let volleyballReady = false;

if (window.lottie && volleyballContainer) {
  volleyballAnimation = window.lottie.loadAnimation({
    container: volleyballContainer,
    renderer: "svg",
    loop: false,
    autoplay: false,
    path: "./assets/motion/volleyball-desktop.json",
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
      progressiveLoad: false,
    },
  });
  const markVolleyballReady = () => {
    if (volleyballReady || !volleyballAnimation?.totalFrames) return;
    volleyballReady = true;
    renderIntro(introProgress);
  };

  volleyballAnimation.addEventListener("config_ready", markVolleyballReady);
  volleyballAnimation.addEventListener("data_ready", markVolleyballReady);
  volleyballAnimation.addEventListener("DOMLoaded", markVolleyballReady);
  requestAnimationFrame(() => {
    if (volleyballContainer.querySelector("svg")) markVolleyballReady();
  });
}

let introTarget = 0;
let introProgress = 0;
let touchY = null;
let directoryTarget = 0;
let directoryPhase = 0;
let directoryTouchY = null;
let activeDirectoryIndex = -1;

const buildPoints = [
  { x: 14, y: 72 },
  { x: 60, y: 76 },
  { x: 77, y: 46 },
  { x: 50, y: 42 },
  { x: 64, y: 76 },
];

const hopHeights = [58, 34, 40, 44];

function setStorySquare({ x, y, size, rotation, color, opacity = 1 }) {
  storySquare.style.left = `${x}%`;
  storySquare.style.top = `${y}%`;
  storySquare.style.width = size;
  storySquare.style.background = color;
  storySquare.style.opacity = opacity;
  storySquare.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
}

function quadraticHop(start, end, height, amount) {
  const inverse = 1 - amount;
  const controlX = (start.x + end.x) / 2;
  const controlY = Math.min(start.y, end.y) - height;
  return {
    x: inverse * inverse * start.x + 2 * inverse * amount * controlX + amount * amount * end.x,
    y: inverse * inverse * start.y + 2 * inverse * amount * controlY + amount * amount * end.y,
  };
}

function renderRibbonHop(start, end, height, amount, sceneOpacity) {
  const point = quadraticHop(start, end, height, amount);
  const stretch = Math.pow(Math.sin(amount * Math.PI), 0.72);
  const segmentLength = mix(0.018, 0.38, stretch);
  const segmentStart = clamp(amount - segmentLength * 1.15, 0, 1 - segmentLength);

  const ribbonPoints = Array.from({ length: 25 }, (_, index) => {
    const ribbonProgress = segmentStart + (segmentLength * index) / 24;
    return quadraticHop(start, end, height, ribbonProgress);
  });
  jumpRibbonPath.setAttribute(
    "d",
    ribbonPoints
      .map((ribbonPoint, index) =>
        `${index === 0 ? "M" : "L"} ${ribbonPoint.x * 16} ${ribbonPoint.y * 9}`,
      )
      .join(" "),
  );
  jumpRibbonPath.removeAttribute("stroke-dasharray");
  jumpRibbonPath.removeAttribute("stroke-dashoffset");
  jumpRibbon.style.opacity = `${stretch * sceneOpacity}`;

  setStorySquare({
    x: point.x,
    y: point.y,
    size: "clamp(36px, 3.5vw, 68px)",
    rotation: amount * 180,
    color: "#f4f3ef",
    opacity: (1 - smoothstep(0.08, 0.7, stretch)) * sceneOpacity,
  });

  const landingY = mix(start.y, end.y, amount);
  jumpShadow.style.left = `${point.x}%`;
  jumpShadow.style.top = `${landingY}%`;
  jumpShadow.style.width = `${mix(6.2, 2.4, stretch)}vw`;
  jumpShadow.style.opacity = `${mix(0.3, 0.025, stretch) * sceneOpacity}`;
}

function getVolleyballFrame(progress) {
  const totalFrames = Math.max(0, volleyballAnimation.totalFrames - 1);

  if (progress <= 0.45) {
    return mix(0, totalFrames * 0.5, clamp((progress - 0.2) / 0.25));
  }
  if (progress <= 0.7) {
    return mix(totalFrames * 0.5, totalFrames * 0.58, (progress - 0.45) / 0.25);
  }
  return mix(totalFrames * 0.58, totalFrames, smoothstep(0.7, 0.86, progress));
}

function renderIntro(progress) {
  const squareExit = smoothstep(0.18, 0.23, progress);
  const playerEnter = smoothstep(0.18, 0.23, progress);
  const playerExit = smoothstep(0.82, 0.88, progress);
  const cubeEnter = smoothstep(0.83, 0.89, progress);

  squareScene.style.opacity = 1 - squareExit;
  playerScene.style.opacity = playerEnter * (1 - playerExit);
  wipeScene.style.opacity = "0";
  cubeScene.style.opacity = cubeEnter;
  networkCopy.style.opacity = `${playerEnter * (1 - smoothstep(0.72, 0.8, progress))}`;
  networkCopy.style.transform = `translateY(${mix(3, 0, playerEnter)}vh)`;

  if (progress <= 0.275) {
    const build = clamp(progress / 0.275);
    const scaledHop = Math.min(buildPoints.length - 1.0001, build * (buildPoints.length - 1));
    const hopIndex = Math.floor(scaledHop);
    const hop = scaledHop - hopIndex;
    renderRibbonHop(
      buildPoints[hopIndex],
      buildPoints[hopIndex + 1],
      hopHeights[hopIndex],
      hop,
      1 - squareExit,
    );
  } else {
    storySquare.style.opacity = "0";
    jumpRibbon.style.opacity = "0";
    jumpShadow.style.opacity = "0";
  }

  if (volleyballReady) {
    volleyballAnimation.goToAndStop(getVolleyballFrame(progress), true);
  }

  const cubeTurn = clamp((progress - 0.83) / 0.17);
  const cubeScale = mix(0.45, 0.72, smoothstep(0, 0.72, cubeTurn));
  cubeStage.style.transform = `translate(-50%, -50%) rotateX(${mix(58, 34, cubeTurn)}deg) rotateY(${mix(-34, 326, cubeTurn)}deg) rotateZ(${mix(-7, 8, cubeTurn)}deg) scale(${cubeScale})`;
  cubeStage.style.opacity = "1";
  cubeScene.classList.toggle("variant-red", cubeTurn >= 0.32 && cubeTurn < 0.58);
  cubeScene.classList.toggle("variant-white", cubeTurn >= 0.58);

  progressBar.style.width = `${progress * 100}%`;
  progressNumber.textContent = String(Math.round(progress * 100)).padStart(2, "0");
}

function advanceIntro(delta) {
  if (intro.classList.contains("is-directory")) return;
  introTarget = clamp(introTarget + delta);
}

function restoreIntro() {
  intro.classList.remove("is-directory");
  document.body.classList.add("intro-active");
  introTarget = 1;
  introProgress = 1;
  renderIntro(1);
}

window.addEventListener(
  "wheel",
  (event) => {
    if (intro.classList.contains("is-directory")) {
      const projectTop = projectSection?.offsetTop ?? 0;
      const isProjectViewport = Math.abs(window.scrollY - projectTop) <= 4;
      if (isProjectViewport) {
        event.preventDefault();
        const direction = Math.sign(event.deltaY);
        const distance = Math.min(180, Math.abs(event.deltaY));
        directoryTarget += direction * Math.max(0.035, distance / Math.max(420, window.innerHeight * 0.72));
      }
      return;
    }
    event.preventDefault();
    const direction = Math.sign(event.deltaY);
    const distance = Math.min(120, Math.abs(event.deltaY));
    advanceIntro(direction * Math.max(0.006, distance / 5200));
  },
  { passive: false },
);

window.addEventListener("touchstart", (event) => {
  if (intro.classList.contains("is-directory")) {
    directoryTouchY = event.touches[0]?.clientY ?? null;
  } else {
    touchY = event.touches[0]?.clientY ?? null;
  }
});

window.addEventListener(
  "touchmove",
  (event) => {
    if (intro.classList.contains("is-directory")) {
      if (directoryTouchY === null) return;
      const projectTop = projectSection?.offsetTop ?? 0;
      if (Math.abs(window.scrollY - projectTop) > 4) return;
      event.preventDefault();
      const nextY = event.touches[0]?.clientY ?? directoryTouchY;
      directoryTarget += (directoryTouchY - nextY) / Math.max(360, window.innerHeight * 0.58);
      directoryTouchY = nextY;
      return;
    }
    if (touchY === null) return;
    event.preventDefault();
    const nextY = event.touches[0]?.clientY ?? touchY;
    advanceIntro((touchY - nextY) / 900);
    touchY = nextY;
  },
  { passive: false },
);

function animateIntro() {
  if (!intro.classList.contains("is-directory")) {
    introProgress += (introTarget - introProgress) * 0.12;
    if (Math.abs(introTarget - introProgress) < 0.0001) introProgress = introTarget;
    renderIntro(introProgress);
    if (introTarget >= 1 && introProgress > 0.995) enterDirectory();
  } else {
    directoryPhase += (directoryTarget - directoryPhase) * 0.12;
    if (Math.abs(directoryTarget - directoryPhase) < 0.0001) directoryPhase = directoryTarget;
    renderDirectoryMotion();
  }
  requestAnimationFrame(animateIntro);
}

renderIntro(0);
animateIntro();

function enterDirectory() {
  projectSection?.scrollIntoView({ block: "start" });
  intro.classList.add("is-directory");
  document.body.classList.remove("intro-active");
  document.body.classList.add("directory-active");
  renderDirectoryMotion();
}

enterButton.addEventListener("click", () => {
  introTarget = 1;
  introProgress = 1;
  renderIntro(1);
  enterDirectory();
});

const isInternalProjectNavigation =
  window.location.hash === "#project" &&
  (() => {
    try {
      return new URL(document.referrer).origin === window.location.origin;
    } catch {
      return false;
    }
  })();

if (isInternalProjectNavigation) {
  introTarget = 1;
  introProgress = 1;
  renderIntro(1);
  enterDirectory();
} else if (window.location.hash === "#project") {
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${window.location.search}`,
  );
  window.scrollTo(0, 0);
}

function renderDirectoryMotion() {
  if (!projectSection || !directorySlides.length) return;

  const itemCount = directorySlides.length;
  const spacing = window.innerHeight * (window.innerWidth <= 900 ? 0.46 : 0.49);
  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  directorySlides.forEach((slide, index) => {
    const rawOffset = index - directoryPhase;
    const offset = ((rawOffset + itemCount / 2) % itemCount + itemCount) % itemCount - itemCount / 2;
    const distance = Math.abs(offset);
    const focus = 1 - smoothstep(0, 0.92, distance);
    const scale = 0.72 + focus * 0.36;
    const opacity = 1 - smoothstep(1.18, 2, distance) * 0.92;

    slide.style.transform = `translate3d(-50%, calc(-50% + ${offset * spacing}px), 0) scale(${scale})`;
    slide.style.opacity = opacity;
    slide.style.zIndex = `${Math.round(20 - distance * 5)}`;
    slide.classList.toggle("is-active", distance < 0.5);
    slide.tabIndex = distance < 0.5 ? 0 : -1;
    slide.setAttribute("aria-hidden", distance < 1.45 ? "false" : "true");

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });

  if (nearestIndex === activeDirectoryIndex) return;
  activeDirectoryIndex = nearestIndex;
  const activeSlide = directorySlides[nearestIndex];
  directoryCategoryEn.textContent = activeSlide.dataset.categoryEn;
  directoryCategoryCn.textContent = activeSlide.dataset.categoryCn;
}

window.addEventListener("resize", renderDirectoryMotion);

siteBack?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "auto" });
  intro.classList.remove("is-directory");
  document.body.classList.add("intro-active");
  document.body.classList.remove("directory-active");
  introTarget = 0;
  introProgress = 0;
  directoryTarget = 0;
  directoryPhase = 0;
  activeDirectoryIndex = -1;
  renderIntro(0);
});

directoryHome?.addEventListener("click", () => siteBack?.click());

directorySlides.forEach((slide) => {
  slide.addEventListener("click", (event) => {
    sessionStorage.setItem("portfolio-directory-category", slide.dataset.category || "campaign");
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const href = slide.href;
    slide.classList.add("is-opening");
    document.body.classList.add("work-transition");
    window.setTimeout(() => {
      window.location.href = href;
    }, 720);
  });
});

document.querySelectorAll(".work").forEach((work) => {
  work.addEventListener("click", () => {
    const categoryByLegacyKey = {
      moy: "campaign",
      sisyphe: "illustration",
      catffee: "brand",
      bandana: "three-d-aigc",
    };
    const category = categoryByLegacyKey[work.dataset.detail] || "campaign";
    window.location.href = `./work.html?category=${category}`;
  });
});
