(function() {
  'use strict';

  var CONFIG = {
    videos: {
      da: 'videos/video_da.mp4',
      ur: 'videos/video_ur.mp4',
      ar: 'videos/video_ar.mp4'
    },
    languages: {
      da: {
        title: 'Se videoen på Dansk',
        desc: 'Få adgang til denne undervisningsvideo',
        buyBtn: 'Køb adgang',
        payBtn: 'Betal €5,00',
        processing: 'Behandler...',
        success: 'Dansk er nu låst op!',
        product: 'Video adgang - Dansk'
      },
      ur: {
        title: 'ویڈیو اردو میں دیکھیں',
        desc: 'اس تعلیمی ویڈیو تک رسائی حاصل کریں',
        buyBtn: 'رسائی خریدیں',
        payBtn: '€5,00 ادا کریں',
        processing: '...جاری ہے',
        success: '!اردو اب دستیاب ہے',
        product: 'ویڈیو تک رسائی - اردو'
      },
      ar: {
        title: 'شاهد الفيديو بالعربية',
        desc: 'احصل على وصول إلى هذا الفيديو التعليمي',
        buyBtn: 'اشترِ الوصول',
        payBtn: 'ادفع €5,00',
        processing: '...جارٍ المعالجة',
        success: '!العربية متاحة الآن',
        product: 'الوصول إلى الفيديو - العربية'
      }
    }
  };

  var currentLang = 'da';
  var pendingLang = null;
  var purchased = {};

  var player = document.getElementById('player');
  var videoSource = document.getElementById('video-source');
  var paywall = document.getElementById('paywall');
  var paywallTitle = document.getElementById('paywall-title');
  var paywallDesc = document.getElementById('paywall-desc');
  var payBtn = document.getElementById('pay-btn');
  var langBtns = document.querySelectorAll('.lang-btn');
  var modal = document.getElementById('payment-modal');
  var modalClose = document.getElementById('modal-close');
  var modalProduct = document.getElementById('modal-product');
  var cardNumber = document.getElementById('card-number');
  var cardExpiry = document.getElementById('card-expiry');
  var cardCvc = document.getElementById('card-cvc');
  var cardEmail = document.getElementById('card-email');
  var confirmPayBtn = document.getElementById('confirm-pay-btn');
  var toast = document.getElementById('toast');

  function updateLangButtons() {
    for (var i = 0; i < langBtns.length; i++) {
      var btn = langBtns[i];
      var lang = btn.getAttribute('data-lang');
      btn.classList.remove('active', 'locked', 'unlocked');
      if (lang === currentLang) {
        btn.classList.add('active');
      }
      if (purchased[lang]) {
        btn.classList.add('unlocked');
      } else {
        btn.classList.add('locked');
      }
    }
  }

  function showPaywall(lang) {
    var cfg = CONFIG.languages[lang];
    paywallTitle.textContent = cfg.title;
    paywallDesc.textContent = cfg.desc;
    payBtn.textContent = cfg.buyBtn;
    paywall.classList.remove('hidden', 'rtl', 'lang-ur', 'lang-ar');
    if (lang === 'ur') {
      paywall.classList.add('rtl', 'lang-ur');
    } else if (lang === 'ar') {
      paywall.classList.add('rtl', 'lang-ar');
    }
  }

  function hidePaywall() {
    paywall.classList.add('hidden');
  }

  function loadVideo(lang) {
    videoSource.src = CONFIG.videos[lang] + '?t=' + Date.now();
    player.load();
  }

  function playVideo(lang) {
    currentLang = lang;
    hidePaywall();
    loadVideo(lang);
    player.play().catch(function() {});
    updateLangButtons();
  }

  function selectLang(lang) {
    currentLang = lang;
    updateLangButtons();
    if (purchased[lang]) {
      hidePaywall();
      loadVideo(lang);
    } else {
      showPaywall(lang);
      player.pause();
    }
  }

  function openModal(lang) {
    pendingLang = lang;
    var cfg = CONFIG.languages[lang];
    modalProduct.textContent = cfg.product;
    confirmPayBtn.textContent = cfg.payBtn;
    confirmPayBtn.disabled = false;
    modal.classList.remove('hidden');
    cardNumber.value = '';
    cardExpiry.value = '';
    cardCvc.value = '';
    cardEmail.value = '';
    setTimeout(function() {
      cardNumber.focus();
    }, 100);
  }

  function closeModal() {
    if (confirmPayBtn.disabled) return;
    modal.classList.add('hidden');
    pendingLang = null;
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(function() {
      toast.classList.add('hidden');
    }, 3000);
  }

  function validateForm() {
    var num = cardNumber.value.replace(/\s/g, '');
    var exp = cardExpiry.value.replace(/\s/g, '');
    var cvc = cardCvc.value.replace(/\s/g, '');
    var email = cardEmail.value.replace(/\s/g, '');
    if (num.length !== 16) return false;
    if (exp.length < 5) return false;
    if (cvc.length < 3) return false;
    if (email.indexOf('@') === -1 || email.indexOf('.') === -1) return false;
    return true;
  }

  function processPayment() {
    if (!validateForm()) {
      alert('Udfyld alle felter korrekt.');
      return;
    }

    var lang = pendingLang;
    if (!lang) return;

    var cfg = CONFIG.languages[lang];
    confirmPayBtn.textContent = cfg.processing;
    confirmPayBtn.disabled = true;

    setTimeout(function() {
      purchased[lang] = true;
      closeModal();
      showToast(cfg.success);
      playVideo(lang);
    }, 1500);
  }

  for (var i = 0; i < langBtns.length; i++) {
    langBtns[i].addEventListener('click', function() {
      var lang = this.getAttribute('data-lang');
      selectLang(lang);
    });
  }

  payBtn.addEventListener('click', function() {
    openModal(currentLang);
  });

  modalClose.addEventListener('click', closeModal);

  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.querySelector('.modal').addEventListener('click', function(e) {
    e.stopPropagation();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });

  confirmPayBtn.addEventListener('click', processPayment);

  var inputs = [cardNumber, cardExpiry, cardCvc, cardEmail];
  for (var j = 0; j < inputs.length; j++) {
    inputs[j].addEventListener('focus', function() {
      var el = this;
      setTimeout(function() {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    });
  }

  showPaywall(currentLang);
  updateLangButtons();

})();
