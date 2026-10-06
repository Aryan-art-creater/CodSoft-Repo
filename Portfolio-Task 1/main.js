(function () {
  const header = document.getElementById("header");
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  const links = [...document.querySelectorAll(".nav-link")];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  links.forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  const onScroll = () => {
    const y = window.scrollY + header.offsetHeight + 8;
    let current = sections[0];
    sections.forEach((section) => {
      if (section.offsetTop <= y) current = section;
    });
    links.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${current.id}`);
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const skillObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll(".skill").forEach((skill) => {
          skill.querySelector(".bar span").style.width = skill.dataset.value + "%";
        });
        skillObserver.disconnect();
      });
    },
    { threshold: 0.3 }
  );
  const skills = document.querySelector(".skill-list");
  if (skills) skillObserver.observe(skills);

  const quotes = [...document.querySelectorAll(".quote")];
  const dotsWrap = document.getElementById("dots");
  let index = 0;
  quotes.forEach((_, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", "Show testimonial " + (i + 1));
    if (i === 0) btn.classList.add("is-active");
    btn.addEventListener("click", () => show(i));
    dotsWrap.appendChild(btn);
  });
  const dots = [...dotsWrap.querySelectorAll("button")];

  function show(i) {
    quotes[index].classList.remove("is-active");
    dots[index].classList.remove("is-active");
    index = i;
    quotes[index].classList.add("is-active");
    dots[index].classList.add("is-active");
  }

  setInterval(() => show((index + 1) % quotes.length), 5600);

  const filters = document.getElementById("filters");
  const works = [...document.querySelectorAll(".work")];
  filters.addEventListener("click", (event) => {
    const btn = event.target.closest(".filter");
    if (!btn) return;
    filters.querySelectorAll(".filter").forEach((el) => el.classList.remove("is-active"));
    btn.classList.add("is-active");
    const key = btn.dataset.filter;
    works.forEach((work) => {
      work.classList.toggle("hidden", key !== "all" && work.dataset.cat !== key);
    });
  });

  const form = document.getElementById("contactForm");
  const note = document.getElementById("formNote");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
    if (!data.name || !data.email || !data.subject || !data.message) {
      note.className = "form-note err";
      note.textContent = "Please fill in every field.";
      return;
    }
    if (!emailOk) {
      note.className = "form-note err";
      note.textContent = "Please enter a valid email address.";
      return;
    }
    note.className = "form-note ok";
    note.textContent = "Thanks, " + data.name + ". Your message is ready to send — this demo form stays on the page.";
    form.reset();
  });
})();
