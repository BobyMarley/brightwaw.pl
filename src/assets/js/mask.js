document.addEventListener('DOMContentLoaded', function() {
  var phoneInput = document.getElementById('phone');
  
  if (phoneInput && typeof IMask !== 'undefined') {
    phoneInput.style.color = '#2c3e50';
    phoneInput.style.caretColor = '#0f85c9';
    
    var phoneMask = IMask(phoneInput, {
      mask: '+48 000 000 000',
      lazy: false,
      placeholderChar: '_'
    });
    
    phoneInput.addEventListener('focus', function() {
      if (phoneMask.unmaskedValue === '') {
        phoneMask.updateValue();
      }
    });
    
    phoneInput.addEventListener('input', function() {
      const filled = phoneMask.unmaskedValue.length;
      const total = 11;
      if (filled < total) {
        phoneInput.style.background = 'linear-gradient(90deg, #fff ' + (filled/total*100) + '%, #fff5e6 ' + (filled/total*100) + '%)';
      } else {
        phoneInput.style.background = '#e8f5e9';
      }
    });
  }
});


