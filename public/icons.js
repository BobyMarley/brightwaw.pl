// Автоматическая замена Font Awesome иконок на SVG
(function() {
  const iconMap = {
    'fa-hand-holding-dollar': 'icon-hand-holding-dollar',
    'fa-gift': 'icon-gift',
    'fa-bolt-lightning': 'icon-bolt-lightning',
    'fa-broom': 'icon-broom',
    'fa-sparkles': 'icon-sparkles',
    'fa-couch': 'icon-couch',
    'fa-door-open': 'icon-door-open',
    'fa-kitchen-set': 'icon-kitchen-set',
    'fa-bath': 'icon-bath',
    'fa-bolt': 'icon-bolt',
    'fa-trophy': 'icon-trophy',
    'fa-shield-halved': 'icon-shield-halved',
    'fa-people-roof': 'icon-people-roof',
    'fa-star': 'icon-star',
    'fa-chevron-down': 'icon-chevron-down',
    'fa-check': 'icon-check',
    'fa-arrow-right': 'icon-arrow-right'
  };

  function replaceIcons() {
    document.querySelectorAll('.fa-solid').forEach(el => {
      for (const [faClass, iconId] of Object.entries(iconMap)) {
        if (el.classList.contains(faClass)) {
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.classList.add('icon', 'fa-solid', faClass);
          const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
          use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `/public/icons-sprite.svg#${iconId}`);
          svg.appendChild(use);
          el.replaceWith(svg);
          break;
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', replaceIcons);
  } else {
    replaceIcons();
  }
})();
