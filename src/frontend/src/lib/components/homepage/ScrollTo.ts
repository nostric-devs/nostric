export const scrollTo = (target: string): void => {
  const el = document.querySelector(target);
  if (!el) return;
  el.scrollIntoView({
    behavior: "smooth",
  });
};
