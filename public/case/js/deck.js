(() => {
  const slides = Array.from(document.querySelectorAll(".slide"));
  const deck = document.getElementById("deck");
  const counter = document.getElementById("counter");
  const progress = document.getElementById("progress");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const presenter = document.getElementById("presenter");
  const presenterNotes = document.getElementById("presenter-notes");
  const presenterNext = document.getElementById("presenter-next");
  const closeNotes = document.getElementById("close-notes");
  const infoBtn = document.getElementById("info-btn");

  let index = 0;
  const total = slides.length;

  const pad = (n) => String(n).padStart(2, "0");

  const titleOf = (slide) => {
    const el =
      slide.querySelector(".display") ||
      slide.querySelector(".statement") ||
      slide.querySelector(".title") ||
      slide.querySelector(".kicker");
    return el ? el.textContent.replace(/\s+/g, " ").trim() : "—";
  };

  const updatePresenter = () => {
    const notes = slides[index].querySelector(".notes");
    presenterNotes.textContent = notes
      ? notes.textContent.replace(/\s+/g, " ").trim()
      : "Sem notas para este slide.";

    if (index < total - 1) {
      presenterNext.textContent = titleOf(slides[index + 1]);
    } else {
      presenterNext.textContent = "Fim da apresentação";
    }
  };

  const goTo = (nextIndex) => {
    if (nextIndex < 0 || nextIndex >= total || nextIndex === index) {
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index === total - 1;
      return;
    }

    const current = slides[index];
    const next = slides[nextIndex];

    current.classList.remove("is-active");
    current.classList.add("is-exit");
    window.setTimeout(() => current.classList.remove("is-exit"), 450);

    next.classList.add("is-active");
    index = nextIndex;

    counter.textContent = `${pad(index + 1)} / ${pad(total)}`;
    progress.style.width = `${((index + 1) / total) * 100}%`;
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === total - 1;

    history.replaceState(null, "", `#${index + 1}`);
    updatePresenter();
  };

  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  const toggleNotes = () => {
    const open = presenter.hasAttribute("hidden");
    if (open) {
      presenter.removeAttribute("hidden");
      updatePresenter();
    } else {
      presenter.setAttribute("hidden", "");
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      /* fullscreen may be blocked by browser policy */
    }
  };

  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);
  closeNotes.addEventListener("click", () => presenter.setAttribute("hidden", ""));

  const setInfoOpen = (open) => {
    infoBtn.setAttribute("aria-expanded", open ? "true" : "false");
  };

  infoBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    const open = infoBtn.getAttribute("aria-expanded") !== "true";
    setInfoOpen(open);
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".info")) setInfoOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    const tag = event.target && event.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;

    switch (event.key) {
      case "ArrowRight":
      case "PageDown":
      case " ":
        event.preventDefault();
        next();
        break;
      case "ArrowLeft":
      case "PageUp":
        event.preventDefault();
        prev();
        break;
      case "Home":
        event.preventDefault();
        goTo(0);
        break;
      case "End":
        event.preventDefault();
        goTo(total - 1);
        break;
      case "p":
      case "P":
        toggleNotes();
        break;
      case "f":
      case "F":
        toggleFullscreen();
        break;
      case "Escape":
        setInfoOpen(false);
        if (!presenter.hasAttribute("hidden")) {
          presenter.setAttribute("hidden", "");
        }
        break;
      default:
        break;
    }
  });

  // Click on right/left halves to navigate (ignores buttons/links)
  deck.addEventListener("click", (event) => {
    if (event.target.closest("button, a, .presenter, .chrome")) return;
    const mid = window.innerWidth / 2;
    if (event.clientX >= mid) next();
    else prev();
  });

  // Touch swipe
  let touchX = null;
  deck.addEventListener(
    "touchstart",
    (event) => {
      touchX = event.changedTouches[0].screenX;
    },
    { passive: true }
  );

  deck.addEventListener(
    "touchend",
    (event) => {
      if (touchX === null) return;
      const dx = event.changedTouches[0].screenX - touchX;
      touchX = null;
      if (Math.abs(dx) < 50) return;
      if (dx < 0) next();
      else prev();
    },
    { passive: true }
  );

  // Boot from hash
  const hashIndex = Number.parseInt(location.hash.replace("#", ""), 10);
  const start = Number.isFinite(hashIndex) && hashIndex >= 1 && hashIndex <= total
    ? hashIndex - 1
    : 0;

  slides.forEach((slide, i) => {
    slide.classList.toggle("is-active", i === start);
  });
  index = start;
  counter.textContent = `${pad(index + 1)} / ${pad(total)}`;
  progress.style.width = `${((index + 1) / total) * 100}%`;
  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === total - 1;
  updatePresenter();

  deck.focus({ preventScroll: true });
})();
