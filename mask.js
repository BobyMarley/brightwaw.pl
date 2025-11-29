document.addEventListener('DOMContentLoaded', function() {
  var phoneInput = document.getElementById('phone');
  
  if (phoneInput && typeof IMask !== 'undefined') {
    var phoneMask = IMask(phoneInput, {
      mask: '+48 000 000 000',
      lazy: false, // Показывать маску сразу
      placeholderChar: '0'
    });
    
    console.log('Маска телефона успешно применена');
  } else {
    console.error('Не удалось применить маску:', {
      phoneInput: !!phoneInput,
      IMask: typeof IMask !== 'undefined'
    });
  }
});