/* ==========================================================================
   UTILITÁRIOS
   ========================================================================== */
function animateStagger(elements, delayMs = 120, callback) {
  elements.forEach((el, index) => {
    requestAnimationFrame(() => {
      setTimeout(() => callback(el), index * delayMs);
    });
  });
}

/* ==========================================================================
   STAGGER DAS FOTOS (melhorado com requestAnimationFrame)
   ========================================================================== */
const photoSlots = document.querySelectorAll('.photo-slot');

if (photoSlots.length) {
  const photoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Aplica stagger em todos os slots visíveis de uma vez
        animateStagger(Array.from(photoSlots), 120, (slot) => {
          slot.classList.add('show');
        });
        // Desativa observer após a primeira aparição (performance)
        photoObserver.disconnect();
      }
    });
  }, { threshold: 0.15 });

  // Observa o container inteiro em vez de cada slot → mais eficiente
  const grid = document.querySelector('.portfolio-grid');
  if (grid) photoObserver.observe(grid);
  else photoSlots.forEach(slot => photoObserver.observe(slot)); // fallback
}

/* ==========================================================================
   FADE-IN DO PORTFÓLIO / SEÇÕES
   ========================================================================== */
const fadeSections = document.querySelectorAll('.fade-section');

if (fadeSections.length) {
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  fadeSections.forEach(section => fadeObserver.observe(section));
}

/* ==========================================================================
   REVEAL FOOTER NAME
   ========================================================================== */
const revealName = document.querySelector('.reveal-name');

if (revealName) {
  const nameObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        nameObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  nameObserver.observe(revealName);
}

/* ==========================================================================
   FADE-IN DAS SEÇÕES DE INTRODUÇÃO (stagger suave)
   ========================================================================== */
const introSections = document.querySelectorAll('.intro-section');

if (introSections.length) {
  const introObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('show');
        }, index * 200); // stagger de 200ms entre seções
        introObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  introSections.forEach(section => introObserver.observe(section));
}

/* ==========================================================================
   FILTROS POR CATEGORIA (atualizado com ocultar/mostrar apresentação)
   ========================================================================== */
const filterButtons = document.querySelectorAll('.filters button');
const portfolioGrid = document.querySelector('.portfolio-grid');
const introPresentation = document.querySelector('.intro-presentation');

if (filterButtons.length && portfolioGrid) {
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Atualiza estado visual dos botões
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const filterValue = button.dataset.filter;

      // Controla visibilidade da apresentação (textos + fotos genéricas)
      if (introPresentation) {
        if (filterValue === 'all') {
          introPresentation.style.display = 'block';
        } else {
          introPresentation.style.display = 'none';
        }
      }

      // Mostra o grid na primeira interação com qualquer filtro
      if (portfolioGrid.classList.contains('hidden-initial')) {
        portfolioGrid.classList.remove('hidden-initial');
        // Força stagger ao mostrar pela primeira vez
        setTimeout(() => {
          animateStagger(Array.from(photoSlots), 120, (slot) => {
            if (!slot.classList.contains('hidden')) {
              slot.classList.add('show');
            }
          });
        }, 100);
      }

      // Filtra os slots do portfólio
      photoSlots.forEach(slot => {
        const matches = (filterValue === 'all' || slot.dataset.category === filterValue);

        if (matches) {
          slot.classList.remove('hidden');
          // Animação suave de reaparição
          slot.style.opacity = '0';
          requestAnimationFrame(() => {
            slot.style.opacity = '1';
          });
        } else {
          slot.classList.add('hidden');
        }
      });
    });
  });
}

/* ==========================================================================
   LIGHTBOX (visualização ampliada + navegação)
   ========================================================================== */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeBtn = document.getElementById('lightbox-close');
const prevBtn = document.getElementById('lightbox-prev');
const nextBtn = document.getElementById('lightbox-next');

let currentIndex = 0;
const images = Array.from(document.querySelectorAll('.photo-slot img'));

if (lightbox && images.length > 0) {
  // Abre lightbox ao clicar em qualquer photo-slot
  photoSlots.forEach((slot, index) => {
    slot.addEventListener('click', (e) => {
      // Evita abrir se clicou em algo dentro (ex: futuro botão)
      if (e.target.tagName === 'IMG') {
        openLightbox(index);
      }
    });
  });

  function openLightbox(index) {
    currentIndex = Math.max(0, Math.min(index, images.length - 1));
    updateImage();
    lightbox.classList.add('show');
    document.body.style.overflow = 'hidden'; // bloqueia scroll
    lightbox.focus(); // melhora acessibilidade
  }

  function updateImage() {
    const img = images[currentIndex];
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || 'Fotografia ampliada';

    // Tratamento de erro na imagem
    lightboxImg.onerror = () => {
      lightboxImg.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gray"><path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>';
      console.warn('Erro ao carregar imagem no lightbox:', img.src);
    };

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === images.length - 1;
  }

  // Navegação
  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateImage();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentIndex < images.length - 1) {
      currentIndex++;
      updateImage();
    }
  });

  // Fechar
  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  function closeLightbox() {
    lightbox.classList.remove('show');
    document.body.style.overflow = '';
  }

  // Suporte a teclado (setas + ESC)
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('show')) return;

    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
      currentIndex--;
      updateImage();
    } else if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
      currentIndex++;
      updateImage();
    }
  });
}

// Opcional: marca .photo-slot como "loaded" após imagem carregar (pode usar no CSS)
images.forEach(img => {
  img.addEventListener('load', () => {
    img.parentElement.classList.add('loaded');
  });
  // Caso já esteja em cache
  if (img.complete) {
    img.parentElement.classList.add('loaded');
  }
});