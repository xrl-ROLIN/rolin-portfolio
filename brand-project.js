const projects = {
  bingo: {
    title: "BinGo",
    images: [
      ["./assets/optimized/brand-project-bingo-01-background-fast.webp", "BinGo brand background", 2400, 1350],
      ["./assets/optimized/brand-project-bingo-07-market-analysis-fast.webp", "BinGo market analysis", 2400, 1350],
      ["./assets/optimized/brand-project-bingo-02-slogan-fast.webp", "BinGo slogan", 2400, 1153],
      ["./assets/optimized/brand-project-bingo-03-brand-system-fast.webp", "BinGo brand system", 2400, 1524],
      ["./assets/optimized/brand-project-bingo-04-product-family-fast.webp", "BinGo product family", 2400, 1350],
      ["./assets/optimized/brand-project-bingo-05-product-scene-fast.webp", "BinGo product scene", 2400, 1350],
      ["./assets/optimized/brand-project-bingo-06-outdoor-campaign-fast.webp", "BinGo outdoor campaign", 2400, 1350],
    ],
  },
  stillwood: {
    title: "StillWood",
    images: [
      ["./assets/optimized/brand-project-stillwood-01-hero-fast.webp", "StillWood product hero", 2400, 1333],
      ["./assets/optimized/brand-project-stillwood-02-background-fast.webp", "StillWood brand background", 2400, 1684],
      ["./assets/optimized/brand-project-stillwood-03-market-analysis-fast.webp", "StillWood market analysis", 2400, 1347],
      ["./assets/optimized/brand-project-stillwood-04-brand-title-fast.webp", "StillWood brand title", 2400, 1102],
      ["./assets/optimized/brand-project-stillwood-05-rendering-fast.webp", "StillWood packaging rendering", 2400, 1148],
    ],
  },
  logo: {
    title: "Logo",
    images: [["./assets/optimized/brand-project-logo-01-logo-v2-fast.webp", "Logo project", 2400, 3925]],
  },
  lkk: {
    title: "LKK",
    images: [["./assets/optimized/brand-project-lkk-01-lkk-fast.webp", "LKK project", 2400, 4431]],
  },
};

const pageParams = new URLSearchParams(window.location.search);
const requestedProject = pageParams.get("project");
const projectKey = projects[requestedProject] ? requestedProject : "bingo";
const projectOrder = ["bingo", "stillwood", "logo", "lkk"];
const entryProjectIndex = projectOrder.indexOf(projectKey);
const shouldPlayEntryTour =
  pageParams.get("intro") === "1" &&
  entryProjectIndex > 0 &&
  !matchMedia("(prefers-reduced-motion: reduce)").matches;
const gallery = document.querySelector(".project-gallery");
document.title = `${projects[projectKey].title} / Rolin Portfolio`;
gallery.setAttribute("aria-label", "Brand and packaging project images");
history.scrollRestoration = "manual";

const renderedSections = projectOrder.map((currentProjectKey) => {
  const currentProject = projects[currentProjectKey];
  const section = document.createElement("section");
  section.className = "project-section";
  section.classList.toggle("is-entry", currentProjectKey === projectKey);
  section.id = currentProjectKey;
  section.dataset.project = currentProjectKey;
  section.setAttribute("aria-label", currentProject.title);

  currentProject.images.forEach(([src, alt, width, height], imageIndex) => {
    const frame = document.createElement("figure");
    frame.className = "project-frame";
    frame.style.aspectRatio = `${width} / ${height}`;

    const image = document.createElement("img");
    const isEntryImage = currentProjectKey === projectKey && imageIndex === 0;
    const isTourImage =
      shouldPlayEntryTour &&
      projectOrder.indexOf(currentProjectKey) <= entryProjectIndex;
    image.src = src;
    image.alt = alt;
    image.width = width;
    image.height = height;
    image.decoding = "async";
    image.loading = isEntryImage || isTourImage ? "eager" : "lazy";
    image.fetchPriority =
      isEntryImage || (isTourImage && imageIndex === 0) ? "high" : "low";

    frame.append(image);
    section.append(frame);
  });

  gallery.append(section);
  return section;
});

const entrySection = renderedSections.find(
  (section) => section.dataset.project === projectKey,
);
let initialPositionComplete = false;
let userHasScrolled = false;
let entryTourStarted = false;
let entryTourActive = false;
let entryTourFrame = 0;
let entryTourTimer = 0;
let previousRootScrollBehavior = "";

function positionEntryProject() {
  if (!entrySection || userHasScrolled) return;
  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  document.scrollingElement.scrollTop = entrySection.offsetTop;
  root.style.scrollBehavior = previousBehavior;
}

function updateActiveProject(projectName, removeIntro = false) {
  const activeProject = projects[projectName];
  document.title = `${activeProject.title} / Rolin Portfolio`;
  const activeUrl = new URL(window.location.href);
  activeUrl.searchParams.set("project", projectName);
  if (removeIntro) activeUrl.searchParams.delete("intro");
  history.replaceState(null, "", activeUrl);
}

function finalizeEntryPosition() {
  positionEntryProject();
  initialPositionComplete = true;
}

function setTourScroll(top) {
  document.scrollingElement.scrollTop = top;
}

function finishEntryTour() {
  if (!entryTourActive && !entryTourStarted) return;
  entryTourActive = false;
  cancelAnimationFrame(entryTourFrame);
  window.clearTimeout(entryTourTimer);
  setTourScroll(entrySection.offsetTop);
  document.documentElement.style.scrollBehavior = previousRootScrollBehavior;
  document.body.classList.remove("is-entry-tour");
  initialPositionComplete = true;
  updateActiveProject(projectKey, true);
  window.removeEventListener("wheel", finishEntryTour);
  window.removeEventListener("touchstart", finishEntryTour);
  window.removeEventListener("pointerdown", finishEntryTour);
  window.removeEventListener("keydown", finishEntryTour);
}

function animateTourSegment(targetTop, duration, onComplete) {
  const startTop = document.scrollingElement.scrollTop;
  const distance = targetTop - startTop;
  const startedAt = performance.now();

  const renderFrame = (now) => {
    if (!entryTourActive) return;
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased =
      progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    setTourScroll(startTop + distance * eased);
    if (progress < 1) {
      entryTourFrame = requestAnimationFrame(renderFrame);
    } else {
      onComplete();
    }
  };

  entryTourFrame = requestAnimationFrame(renderFrame);
}

function startEntryTour() {
  if (entryTourStarted) return;
  entryTourStarted = true;
  entryTourActive = true;
  previousRootScrollBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = "auto";
  document.body.classList.add("is-entry-tour");
  setTourScroll(0);

  ["wheel", "touchstart", "pointerdown", "keydown"].forEach((eventName) => {
    window.addEventListener(eventName, finishEntryTour, {
      passive: true,
    });
  });

  const stops = renderedSections
    .slice(1, entryProjectIndex + 1)
    .map((section) => section.offsetTop);
  const totalDuration = entryProjectIndex === 1 ? 1700 : entryProjectIndex === 2 ? 2600 : 3000;
  const openingHold = 260;
  const pagePause = 110;
  const segmentDuration =
    (totalDuration - openingHold - pagePause * (stops.length - 1)) /
    stops.length;
  let stopIndex = 0;

  const playNextSegment = () => {
    animateTourSegment(stops[stopIndex], segmentDuration, () => {
      stopIndex += 1;
      if (stopIndex >= stops.length) {
        finishEntryTour();
        return;
      }
      entryTourTimer = window.setTimeout(playNextSegment, pagePause);
    });
  };

  entryTourTimer = window.setTimeout(playNextSegment, openingHold);
}

if (shouldPlayEntryTour) {
  setTourScroll(0);
  const tourImages = [
    ...gallery.querySelectorAll(
      projectOrder
        .slice(0, entryProjectIndex + 1)
        .map((key) => `#${key} img`)
        .join(","),
    ),
  ];
  const decoded = Promise.allSettled(
    tourImages.map((image) =>
      image.decode ? image.decode().catch(() => {}) : Promise.resolve(),
    ),
  );
  Promise.race([
    decoded,
    new Promise((resolve) => window.setTimeout(resolve, 1100)),
  ]).then(startEntryTour);
} else {
  positionEntryProject();
  requestAnimationFrame(() => {
    positionEntryProject();
    requestAnimationFrame(positionEntryProject);
  });
  window.addEventListener("load", finalizeEntryPosition, { once: true });
  window.addEventListener(
    "pageshow",
    () => {
      requestAnimationFrame(finalizeEntryPosition);
    },
    { once: true },
  );
  window.setTimeout(finalizeEntryPosition, 700);

  ["wheel", "touchstart", "pointerdown", "keydown"].forEach((eventName) => {
    window.addEventListener(
      eventName,
      () => {
        userHasScrolled = true;
        initialPositionComplete = true;
      },
      { once: true, passive: true },
    );
  });
}

const activeProjectObserver = new IntersectionObserver(
  (entries) => {
    if (!initialPositionComplete) return;
    const activeEntry = entries.find((entry) => entry.isIntersecting);
    if (!activeEntry) return;
    const activeKey = activeEntry.target.dataset.project;
    updateActiveProject(activeKey);
  },
  {
    rootMargin: "-46% 0px -46%",
    threshold: 0,
  },
);

renderedSections.forEach((section) => activeProjectObserver.observe(section));

const nextLink = document.querySelector(".project-next");
const transition = document.querySelector(".project-transition");
const transitionVideo = transition.querySelector("video");
let transitionStarted = false;

nextLink.addEventListener("click", (event) => {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  event.preventDefault();
  if (transitionStarted) return;
  transitionStarted = true;

  const destination = nextLink.href;
  let navigationTimer = 0;
  const navigate = () => {
    window.clearTimeout(navigationTimer);
    window.location.assign(destination);
  };

  transitionVideo.currentTime = 0;
  transitionVideo.playbackRate = 1;
  document.body.classList.add("is-project-transition");
  transitionVideo.play().catch(navigate);
  transitionVideo.addEventListener("ended", navigate, { once: true });
  navigationTimer = window.setTimeout(navigate, 5600);
});
