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

const requestedProject = new URLSearchParams(window.location.search).get("project");
const projectKey = projects[requestedProject] ? requestedProject : "bingo";
const project = projects[projectKey];
const gallery = document.querySelector(".project-gallery");
document.title = `${project.title} / Rolin Portfolio`;
gallery.setAttribute("aria-label", "Brand and packaging project images");

const section = document.createElement("section");
section.className = "project-section";
section.id = projectKey;
section.setAttribute("aria-label", project.title);

project.images.forEach(([src, alt, width, height], imageIndex) => {
  const frame = document.createElement("figure");
  frame.className = "project-frame";
  frame.style.aspectRatio = `${width} / ${height}`;

  const image = document.createElement("img");
  image.src = src;
  image.alt = alt;
  image.width = width;
  image.height = height;
  image.decoding = "async";
  image.loading = imageIndex === 0 ? "eager" : "lazy";
  image.fetchPriority = imageIndex === 0 ? "high" : "low";

  frame.append(image);
  section.append(frame);
});

gallery.append(section);

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
