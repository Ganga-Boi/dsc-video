document.addEventListener('DOMContentLoaded', function() {
  var CONFIG = {
    videos: {
      da: '/videos/video_da.mp4',
      ur: '/videos/video_ur.mp4',
      ar: '/videos/video_ar.mp4'
    },
    languages: {
      da: {
        name: 'Dansk',
        ui: {
          title: 'Se videoen på Dansk',
          description: 'Få adgang til denne undervisningsvideo',
          buyButton: 'Køb adgang',
          payButton: 'Betal €5,00',
          processing: 'Behandler...',
          success: 'Dansk er nu låst op!',
          product: 'Video adgang - Dansk'
        }
      },
      ur: {
        name: 'Urdu',
        ui: {
          title: 'ویڈیو اردو میں دیکھیں',
          description: 'اس تعلیمی ویڈیو تک رسائی حاصل کریں',
          buyButton: 'رسائی خریدیں',
          payButton: '€5,00 ادا کریں',
          processing: '...جاری ہے',
          success: '!اردو اب دستیاب ہے',
          product: 'ویڈیو تک رسائی - اردو'
        }
      },
      ar: {
        name: 'Arabisk',
        ui: {
          title: 'شاهد الفيديو بالعربية',
          description: 'احصل على وصول إلى هذا الفيديو التعليمي',
          buyButton: 'اشترِ الوصول',
          payButton: 'ادفع €5,00',
          processing: '...جارٍ المعالجة',
          success: '!العربية متاحة الآن',
          product: 'الوصول إلى الفيديو - العربية'
        }
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

  // Mobile: scroll input into view when focused
  [cardNumber, cardExpiry, cardCvc, cardEmail].forEach(function(input) {
    input.addEventListener('focus', function() {
      setTimeout(function() {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    });
  });

  function updateUI() {
    for (var i = 0; i < langBtns.length; i++) {
      var btn = langBtns[i];
      var lang = btn.getAttribute('data-lang');
      btn.classList.remove('active', 'locked', 'unlocked');
      if (lang === currentLang) btn.classList.add('active');
      if (purchased[lang]) btn.classList.add('unlocked');
      else btn.classList.add('locked');
    }
  }

  function showPaywall(lang) {
    var ui = CONFIG.languages[lang].ui;
    paywallTitle.textContent = ui.title;
    paywallDesc.textContent = ui.description;
    payBtn.textContent = ui.buyButton;
    paywall.classList.remove('hidden', 'rtl', 'lang-ur', 'lang-ar');
    if (lang === 'ur') paywall.classList.add('rtl', 'lang-ur');
    if (lang === 'ar') paywall.classList.add('rtl', 'lang-ar');
  }

  function hidePaywall() {
    paywall.classList.add('hidden');
  }

  function playVideo(lang) {
    currentLang = lang;
    hidePaywall();
    videoSource.src = CONFIG.videos[lang] + '?t=' + Date.now();
    player.load();
    player.play().catch(function() {});
    updateUI();
  }

  function selectLanguage(lang) {
    currentLang = lang;
    if (purchased[lang]) playVideo(lang);
    else showPaywall(lang);
    updateUI();
  }

  function openModal(lang) {
    pendingLang = lang;
    var ui = CONFIG.languages[lang].ui;
    modalProduct.textContent = ui.product;
    confirmPayBtn.textContent = ui.payButton;
    modal.classList.remove('hidden');
    cardNumber.value = '';
    cardExpiry.value = '';
    cardCvc.value = '';
    cardEmail.value = '';
    cardNumber.focus();
  }

  function closeModal() {
    modal.classList.add('hidden');
    pendingLang = null;
  }

  function processPayment() {
    if (!pendingLang) return;
    var num = cardNumber.value.replace(/\s/g, '');
    if (num.length < 16) { alert('Indtast kortnummer (16 cifre)'); return; }
    if (cardExpiry.value.length < 5) { alert('Indtast udløbsdato'); return; }
    if (cardCvc.value.length < 3) { alert('Indtast CVC'); return; }
    if (cardEmail.value.indexOf('@') === -1) { alert('Indtast email'); return; }

    var ui = CONFIG.languages[pendingLang].ui;
    var lang = pendingLang;
    confirmPayBtn.textContent = ui.processing;
    confirmPayBtn.disabled = true;

    setTimeout(function() {
      confirmPayBtn.textContent = ui.payButton;
      confirmPayBtn.disabled = false;
      closeModal();
      purchased[lang] = true;
      playVideo(lang);
      showToast('✓ ' + ui.success);
    }, 1500);
  }

  function showToast(msg) {
    var t = document.querySelector('.toast');
    if (t) t.remove();
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 3000);
  }

  for (var i = 0; i < langBtns.length; i++) {
    (function(btn) {
      btn.addEventListener('click', function() {
        selectLanguage(btn.getAttribute('data-lang'));
      });
    })(langBtns[i]);
  }

  payBtn.addEventListener('click', function() { openModal(currentLang); });
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', function(e) { if (e.target === modal) closeModal(); });
  confirmPayBtn.addEventListener('click', processPayment);

  cardNumber.addEventListener('input', function(e) {
    var v = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
    e.target.value = v;
  });

  cardExpiry.addEventListener('input', function(e) {
    var v = e.target.value.replace(/\D/g, '');
    if (v.length >= 2) v = v.slice(0,2) + '/' + v.slice(2,4);
    e.target.value = v;
  });

  selectLanguage('da');
  console.log('JS loaded');
});
