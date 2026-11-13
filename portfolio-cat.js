{
  const cat = document.querySelector(".portfolio-cat");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let reactionTimer;
  let lastClick = 0;
  let clickCount = 0;
  function react(state, duration) {
    clearTimeout(reactionTimer);
    cat.dataset.reaction = state;
    reactionTimer = setTimeout(() => delete cat.dataset.reaction, duration);
  }
  document.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" || reducedMotion.matches) return;
    const box = cat.getBoundingClientRect();
    const x = event.clientX - box.left - box.width * .41;
    const y = event.clientY - box.top - box.height * .43;
    cat.style.setProperty("--look-x", (Math.tanh(x / 105) * 2.4) + "px");
    cat.style.setProperty("--look-y", (Math.tanh(y / 105) * 1.8) + "px");
  }, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) react("react", 650);
  });
  document.addEventListener("click", (event) => {
    if (event.target.closest('a[href="#project"]')) react("react", 650);
  });
  cat.addEventListener("click", () => {
    const now = performance.now();
    clickCount = now - lastClick < 650 ? clickCount + 1 : 1;
    lastClick = now;
    if (clickCount === 3) {
      clickCount = 0;
      react("surprise", 1750);
    }
  });
}
