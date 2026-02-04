// PAK TRASLADOS - Interactividad Básica

document.addEventListener('DOMContentLoaded', function() {
  // Resaltar el enlace activo en la navegación
  highlightActiveNav();
  
  // Inicializar tooltips si existen
  initTooltips();
  
  // Manejar filtros de tablas
  initTableFilters();
});

// Resaltar enlace activo en el sidebar
function highlightActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.sidebar-nav a');
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// Inicializar tooltips simples
function initTooltips() {
  const elements = document.querySelectorAll('[data-tooltip]');
  elements.forEach(el => {
    el.addEventListener('mouseenter', function() {
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = this.getAttribute('data-tooltip');
      document.body.appendChild(tooltip);
      
      const rect = this.getBoundingClientRect();
      tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
      tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    });
    
    el.addEventListener('mouseleave', function() {
      const tooltip = document.querySelector('.tooltip');
      if (tooltip) {
        tooltip.remove();
      }
    });
  });
}

// Filtros de tabla
function initTableFilters() {
  // Filtro de búsqueda en tiempo real
  const searchInputs = document.querySelectorAll('[data-table-search]');
  searchInputs.forEach(input => {
    input.addEventListener('input', function() {
      const tableId = this.getAttribute('data-table-search');
      const table = document.getElementById(tableId);
      const searchTerm = this.value.toLowerCase();
      
      if (table) {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
          const text = row.textContent.toLowerCase();
          row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
      }
    });
  });
  
  // Filtros por select
  const filterSelects = document.querySelectorAll('[data-table-filter]');
  filterSelects.forEach(select => {
    select.addEventListener('change', function() {
      const tableId = this.getAttribute('data-table-filter');
      const column = this.getAttribute('data-filter-column');
      const table = document.getElementById(tableId);
      const filterValue = this.value.toLowerCase();
      
      if (table) {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
          if (filterValue === '' || filterValue === 'todos') {
            row.style.display = '';
          } else {
            const cells = row.querySelectorAll('td');
            const columnIndex = parseInt(column);
            if (cells[columnIndex]) {
              const text = cells[columnIndex].textContent.toLowerCase();
              row.style.display = text.includes(filterValue) ? '' : 'none';
            }
          }
        });
      }
    });
  });
}

// Función auxiliar para formatear moneda
function formatCurrency(amount) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2
  }).format(amount);
}

// Función auxiliar para formatear fechas
function formatDate(date) {
  return new Intl.DateFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date));
}
