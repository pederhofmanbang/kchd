/**
 * Kompetenscentrum Hälsodata - Main JavaScript
 * Hanterar navigation, dokumentfiltrering och dynamisk laddning
 */

(function() {
  'use strict';

  // ==========================================================================
  // Mobile Navigation
  // ==========================================================================

  const navToggle = document.querySelector('.nav__toggle');
  const navLinks = document.querySelector('.nav__links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('nav__links--open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('nav__links--open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('nav__links--open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ==========================================================================
  // Smooth Scroll for anchor links
  // ==========================================================================

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const navHeight = document.querySelector('.nav')?.offsetHeight || 0;
        const targetPosition = targetElement.offsetTop - navHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ==========================================================================
  // Document Loading and Filtering
  // ==========================================================================

  const documentsGrid = document.getElementById('documentsGrid');
  const filterButtons = document.querySelectorAll('.filter-btn');
  let allDocuments = [];

  /**
   * Ladda dokument från JSON-fil
   */
  async function loadDocuments() {
    if (!documentsGrid) return;

    try {
      const response = await fetch('dokument/dokument.json');
      if (!response.ok) {
        throw new Error('Kunde inte ladda dokument');
      }
      allDocuments = await response.json();
      renderDocuments(allDocuments);
    } catch (error) {
      console.warn('Dokumentladdning misslyckades:', error);
      documentsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--color-gray-500);">
          <p>Inga dokument att visa ännu.</p>
          <p style="font-size: 0.875rem; margin-top: 0.5rem;">
            Lägg till dokument i <code>dokument/dokument.json</code>
          </p>
        </div>
      `;
    }
  }

  /**
   * Rendera dokument till DOM
   */
  function renderDocuments(documents) {
    if (!documentsGrid) return;

    if (documents.length === 0) {
      documentsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--color-gray-500);">
          <p>Inga dokument matchar filtret.</p>
        </div>
      `;
      return;
    }

    documentsGrid.innerHTML = documents.map(doc => createDocumentCard(doc)).join('');
  }

  /**
   * Skapa HTML för ett dokumentkort
   */
  function createDocumentCard(doc) {
    const fileType = getFileType(doc.filnamn || doc.src || '');
    const iconClass = fileType === 'pdf' ? 'document-card__icon--pdf' : 'document-card__icon--ppt';

    // Skapa taggar
    const tags = [];
    if (doc.kategori) {
      tags.push(`<span class="document-card__tag">${doc.kategori}</span>`);
    }
    if (doc.delprojekt) {
      const delprojektArray = Array.isArray(doc.delprojekt) ? doc.delprojekt : [doc.delprojekt];
      delprojektArray.forEach(dp => {
        const tagClass = dp.startsWith('pilot') ? 'document-card__tag--pilot' : 'document-card__tag--utredning';
        tags.push(`<span class="document-card__tag ${tagClass}">${getDelprojektLabel(dp)}</span>`);
      });
    }

    const filePath = doc.src || `dokument/${doc.filnamn}`;

    return `
      <article class="document-card" data-kategori="${doc.kategori || ''}" data-delprojekt="${(Array.isArray(doc.delprojekt) ? doc.delprojekt : [doc.delprojekt]).join(' ')}">
        <div class="document-card__preview">
          ${getFileIcon(fileType)}
        </div>
        <div class="document-card__body">
          <h3 class="document-card__title">${doc.titel}</h3>
          <div class="document-card__meta">
            ${tags.join('')}
          </div>
          ${doc.datum ? `<div class="document-card__date">${formatDate(doc.datum)}</div>` : ''}
        </div>
        <div class="document-card__actions">
          <a href="${filePath}" target="_blank" rel="noopener" class="document-card__action">
            Öppna
          </a>
          <a href="${filePath}" download class="document-card__action">
            Ladda ner
          </a>
        </div>
      </article>
    `;
  }

  /**
   * Hämta filtyp från filnamn
   */
  function getFileType(filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (['ppt', 'pptx'].includes(ext)) return 'ppt';
    return 'other';
  }

  /**
   * Hämta ikon-SVG baserat på filtyp
   */
  function getFileIcon(fileType) {
    if (fileType === 'pdf') {
      return `
        <svg class="document-card__icon document-card__icon--pdf" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8.5 13H10c.55 0 1 .45 1 1v1c0 .55-.45 1-1 1H9v2H8v-5h.5zm3.5 0h1.5c.55 0 1 .45 1 1v3c0 .55-.45 1-1 1H12v-5zm4 0h2v1h-1v1h1v1h-1v2h-1v-5z"/>
        </svg>
      `;
    }
    if (fileType === 'ppt') {
      return `
        <svg class="document-card__icon document-card__icon--ppt" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM9 13h1.5c.83 0 1.5.67 1.5 1.5S11.33 16 10.5 16H10v2H9v-5zm1 2h.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5H10v1z"/>
        </svg>
      `;
    }
    return `
      <svg class="document-card__icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4z"/>
      </svg>
    `;
  }

  /**
   * Konvertera delprojekt-ID till läsbar etikett
   */
  function getDelprojektLabel(id) {
    const labels = {
      'pilot-1': 'Väntetider',
      'pilot-2': 'Ramverk',
      'utredning-1': 'Variabelharmonisering',
      'utredning-2': 'Datakatalog',
      'utredning-3': 'Juridik'
    };
    return labels[id] || id;
  }

  /**
   * Formatera datum till svenskt format
   */
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Filtrera dokument
   */
  function filterDocuments(filter) {
    if (filter === 'all') {
      renderDocuments(allDocuments);
      return;
    }

    const filtered = allDocuments.filter(doc => {
      // Kolla kategori
      if (doc.kategori === filter) return true;

      // Kolla delprojekt
      const delprojekt = Array.isArray(doc.delprojekt) ? doc.delprojekt : [doc.delprojekt];
      if (delprojekt.includes(filter)) return true;

      return false;
    });

    renderDocuments(filtered);
  }

  // Sätt upp filterknappar
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Uppdatera aktiv knapp
      filterButtons.forEach(b => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');

      // Filtrera
      const filter = btn.dataset.filter;
      filterDocuments(filter);
    });
  });

  // ==========================================================================
  // Intersection Observer for animations
  // ==========================================================================

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        fadeInObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observera element för fade-in
  document.querySelectorAll('.project-card, .about-card, .document-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    fadeInObserver.observe(el);
  });

  // CSS för is-visible
  const style = document.createElement('style');
  style.textContent = `
    .is-visible {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(style);

  // ==========================================================================
  // Initialize
  // ==========================================================================

  document.addEventListener('DOMContentLoaded', () => {
    loadDocuments();
  });

  // Om DOMContentLoaded redan har körts
  if (document.readyState !== 'loading') {
    loadDocuments();
  }

})();
