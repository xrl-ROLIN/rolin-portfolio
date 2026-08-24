const projects = {
  bingo: {
    title: "BinGo",
    images: [
      ["./assets/brand-projects/bingo/01-background.webp", "BinGo brand background", 3200, 1800],
      ["./assets/brand-projects/bingo/02-slogan.webp", "BinGo slogan", 3200, 1537],
      ["./assets/brand-projects/bingo/03-brand-system.webp", "BinGo brand system", 3200, 2032],
      ["./assets/brand-projects/bingo/04-product-family.webp", "BinGo product family", 3200, 1800],
      ["./assets/brand-projects/bingo/05-product-scene.webp", "BinGo product scene", 3200, 1800],
      ["./assets/brand-projects/bingo/06-outdoor-campaign.webp", "BinGo outdoor campaign", 3200, 1800],
      ["./assets/brand-projects/bingo/07-market-analysis.webp", "BinGo market analysis", 3200, 1800],
    ],
  },
  stillwood: {
    title: "StillWood",
    images: [
      ["./assets/brand-projects/stillwood/01-hero.webp", "StillWood product hero", 3200, 1777],
      ["./assets/brand-projects/stillwood/02-background.webp", "StillWood brand background", 3200, 2245],
      ["./assets/brand-projects/stillwood/03-market-analysis.webp", "StillWood market analysis", 3200, 1795],
      ["./assets/brand-projects/stillwood/04-brand-title.webp", "StillWood brand title", 3200, 1469],
      ["./assets/brand-projects/stillwood/05-rendering.webp", "StillWood packaging rendering", 3200, 1530],
    ],
  },
  logo: {
    title: "Logo",
    images: [["./assets/brand-projects/logo/01-logo-v2.jpg", "Logo project", 3200, 5233]],
  },
  lkk: {
    title: "LKK",
    images: [["./assets/brand-projects/lkk/01-lkk.webp", "LKK project", 3200, 5908]],
  },
};

const requestedProject = new URLSearchParams(window.location.search).get("project");
const projectKey = projects[requestedProject] ? requestedProject : "bingo";
const project = projects[projectKey];
const gallery = document.querySelector(".project-gallery");
const projectOrder = ["bingo", "stillwood", "logo", "lkk"];

document.title = `${project.title} / Rolin Portfolio`;
gallery.setAttribute("aria-label", "Brand and packaging project images");

projectOrder.forEach((key) => {
  const currentProject = projects[key];
  const section = document.createElement("section");
  section.className = "project-section";
  section.id = key;
  section.setAttribute("aria-label", currentProject.title);

  currentProject.images.forEach(([src, alt, width, height], imageIndex) => {
    const frame = document.createElement("figure");
    frame.className = "project-frame";

    const image = document.createElement("img");
    image.src = src;
    image.alt = alt;
    image.width = width;
    image.height = height;
    image.decoding = "async";
    image.loading = key === projectKey && imageIndex === 0 ? "eager" : "lazy";
    if (key === projectKey && imageIndex === 0) image.fetchPriority = "high";

    frame.append(image);
    section.append(frame);
  });

  if (key === "bingo") {
    const marketAnalysis = section.querySelector(
      'img[src="./assets/brand-projects/bingo/07-market-analysis.webp"]',
    );
    if (marketAnalysis) {
      const originalFrame = marketAnalysis.parentElement;
      section.insertBefore(marketAnalysis, section.children[1] || null);
      originalFrame.remove();
    }
  }

  gallery.append(section);
});

const targetSection = document.getElementById(projectKey);
if (projectKey !== "bingo") {
  const moveToProject = () => window.scrollTo(0, targetSection.offsetTop);
  requestAnimationFrame(moveToProject);
  window.addEventListener("load", moveToProject, { once: true });
}

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
