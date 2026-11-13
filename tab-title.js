const activeTabTitle = document.title;

document.addEventListener("visibilitychange", () => {
  document.title = document.hidden ? "Hey, come back! 👀" : activeTabTitle;
});
