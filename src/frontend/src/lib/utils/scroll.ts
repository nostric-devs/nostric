export const scroll = (target: string): void => {
  const el: Element | null = document.querySelector(target);
  if (!el) return;
  el.scrollIntoView({
    behavior: "smooth",
  });
};
