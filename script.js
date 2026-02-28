"use strict";

// Punto de entrada principal para inicializar la UI cuando el DOM esté listo.
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  const navItems = navLinks ? navLinks.querySelectorAll("a") : [];
  const year = document.getElementById("year");
  const form = document.getElementById("contactForm");
  const successMessage = document.getElementById("formSuccess");
  const progressBar = document.getElementById("scrollProgress");
  const countdownValue = document.getElementById("countdownValue");
  const hero = document.querySelector(".hero");

  // 1) Año dinámico en el footer.
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  // 2) Menú responsive accesible para mobile.
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navItems.forEach((item) => {
      item.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // 3) Animaciones de aparición por scroll (stagger suave tipo premium).
  const revealElements = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const order = Number(entry.target.dataset.revealOrder || 0);
          entry.target.style.transitionDelay = `${order * 70}ms`;
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
  );

  revealElements.forEach((element, index) => {
    element.dataset.revealOrder = String(index % 6);
    observer.observe(element);
  });

  // 4) Hover magnético para botones destacados.
  const magneticButtons = document.querySelectorAll(".magnetic");
  magneticButtons.forEach((button) => {
    button.addEventListener("mousemove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.transform = `translate(${x * 0.06}px, ${y * 0.06}px)`;
    });

    button.addEventListener("mouseleave", () => {
      button.style.transform = "translate(0, 0)";
    });
  });

  // 5) Barra de progreso de lectura/scroll para UX premium.
  window.addEventListener(
    "scroll",
    () => {
      const doc = document.documentElement;
      const maxScroll = doc.scrollHeight - doc.clientHeight;
      const ratio = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
      if (progressBar) progressBar.style.width = `${Math.min(100, ratio)}%`;

      // Micro parallax de la sección hero para sensación de lujo (muy sutil).
      if (hero && window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
        const y = Math.min(window.scrollY * 0.08, 30);
        hero.style.transform = `translateY(${y * -0.15}px)`;
      }
    },
    { passive: true }
  );

  // 6) Contador regresivo para urgencia de conversión (48h recurrente).
  initCountdown(countdownValue, 48);

  // 7) Validación de formulario orientada a conversión.
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const nombre = form.nombre.value.trim();
      const email = form.email.value.trim();
      const mensaje = form.mensaje.value.trim();

      clearError("nombre");
      clearError("email");
      clearError("mensaje");
      if (successMessage) successMessage.textContent = "";

      let isValid = true;

      if (nombre.length < 2) {
        setError("nombre", "Escribe un nombre válido (mínimo 2 caracteres).");
        isValid = false;
      }

      if (!isValidEmail(email)) {
        setError("email", "Introduce un email válido.");
        isValid = false;
      }

      if (mensaje.length < 10) {
        setError("mensaje", "Tu mensaje debe tener al menos 10 caracteres.");
        isValid = false;
      }

      if (isValid) {
        if (successMessage) {
          successMessage.textContent =
            "Mensaje enviado correctamente. Te contactaré pronto para darte acceso prioritario.";
        }
        form.reset();
      }
    });
  }
});

/**
 * Inicia un countdown de horas, almacenado localmente para mantener continuidad.
 * @param {HTMLElement | null} targetNode
 * @param {number} hours
 */
function initCountdown(targetNode, hours) {
  if (!targetNode) return;

  const storageKey = "lenk_offer_deadline";
  const now = Date.now();
  const existingDeadline = Number(localStorage.getItem(storageKey));

  let deadline = existingDeadline;
  if (!existingDeadline || existingDeadline <= now) {
    deadline = now + hours * 60 * 60 * 1000;
    localStorage.setItem(storageKey, String(deadline));
  }

  const tick = () => {
    const diff = deadline - Date.now();
    if (diff <= 0) {
      deadline = Date.now() + hours * 60 * 60 * 1000;
      localStorage.setItem(storageKey, String(deadline));
      return;
    }

    const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secondsLeft = Math.floor((diff % (1000 * 60)) / 1000);

    targetNode.textContent = `${pad(hoursLeft)}:${pad(minutesLeft)}:${pad(secondsLeft)}`;
  };

  tick();
  window.setInterval(tick, 1000);
}

/**
 * Agrega un cero a la izquierda para formato de tiempo.
 * @param {number} value
 * @returns {string}
 */
function pad(value) {
  return String(value).padStart(2, "0");
}

/**
 * Muestra un mensaje de error en el campo indicado.
 * @param {string} fieldId
 * @param {string} message
 */
function setError(fieldId, message) {
  const errorNode = document.querySelector(`.error[data-for="${fieldId}"]`);
  if (errorNode) errorNode.textContent = message;
}

/**
 * Limpia el mensaje de error en el campo indicado.
 * @param {string} fieldId
 */
function clearError(fieldId) {
  const errorNode = document.querySelector(`.error[data-for="${fieldId}"]`);
  if (errorNode) errorNode.textContent = "";
}

/**
 * Valida email con regex robusta para frontend.
 * @param {string} value
 * @returns {boolean}
 */
function isValidEmail(value) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailPattern.test(value);
}
