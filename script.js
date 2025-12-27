/**
 * script.js
 * Video-spiller med betalingsmur for alle sprog.
 * Test mode: Simuleret betaling.
 * Produktion: Stripe integration.
 */

// ============ CONFIG ============

const CONFIG = {
  // Video URLs
  videos: {
    da: './videos/video_da.mp4',
    ur: './videos/video_ur.mp4',
    ar: './videos/video_ar.mp4',
  },

  // Sprog-metadata - ALLE kræver betaling
  languages: {
    da: { 
      name: 'Dansk', 
      flag: '🇩🇰', 
      price: 5,
      ui: {
        title: 'Se videoen på Dansk',
        description: 'Få adgang til denne undervisningsvideo',
        buyButton: 'Køb adgang',
        payButton: 'Betal €5,00',
        processing: 'Behandler...',
        success: 'Dansk er nu låst op!',
        product: 'Video adgang - Dansk',
      }
    },
    ur: { 
      name: 'Urdu', 
      flag: '🇵🇰', 
      price: 5,
      ui: {
        title: 'ویڈیو اردو میں دیکھیں',
        description: 'اس تعلیمی ویڈیو تک رسائی حاصل کریں',
        buyButton: 'رسائی خریدیں',
        payButton: '€5,00 ادا کریں',
        processing: '...جاری ہے',
        success: '!اردو اب دستیاب ہے',
        product: 'ویڈیو تک رسائی - اردو',
      }
    },
    ar: { 
      name: 'Arabisk', 
      flag: '🇸🇦', 
      price: 5,
      ui: {
        title: 'شاهد الفيديو بالعربية',
        description: 'احصل على وصول إلى هذا الفيديو التعليمي',
        buyButton: 'اشترِ الوصول',
        payButton: 'ادفع €5,00',
        processing: '...جارٍ المعالجة',
        success: '!العربية متاحة الآن',
        product: 'الوصول إلى الفيديو - العربية',
      }
    },
  },

  // Pris i EUR
  price: 5,

  // Storage key
  storageKey: 'dsc_video_purchased',

  // Test mode (skift til false i produktion)
  testMode: true,

  // Stripe Payment Links (til produktion)
  stripeLinks: {
    da: 'https://buy.stripe.com/YOUR_DA_LINK',
    ur: 'https://buy.stripe.com/YOUR_UR_LINK',
    ar: 'https://buy.stripe.com/YOUR_AR_LINK',
  },
};

// ============ STATE ============

let currentLang = 'da';
let pendingLang = null;
let purchasedLanguages = new Set();

// ============ DOM ELEMENTS ============

const elements = {
  player: document.getElementById('player'),
  videoSource: document.getElementById('video-source'),
  paywall: document.getElementById('paywall'),
  paywallTitle: document.getElementById('paywall-title'),
  paywallDesc: document.getElementById('paywall-desc'),
  payBtn: document.getElementById('pay-btn'),
  langBtns: document.querySelectorAll('.lang-btn'),
  
  // Modal
  modal: document.getElementById('payment-modal'),
  modalClose: document.getElementById('modal-close'),
  modalProduct: document.getElementById('modal-product'),
  cardNumber: document.getElementById('card-number'),
  cardExpiry: document.getElementById('card-expiry'),
  cardCvc: document.getElementById('card-cvc'),
  cardEmail: document.getElementById('card-email'),
  confirmPayBtn: document.getElementById('confirm-pay-btn'),
};

// ============ INIT ============

function init() {
  loadPurchases();
  checkPaymentCallback();
  setupEventListeners();
  updateUI();
  
  // Vælg dansk som default og vis paywall
  selectLanguage('da');
}

// ============ PURCHASES ============

function loadPurchases() {
  try {
    const stored = localStorage.getItem(CONFIG.storageKey);
    if (stored) {
      JSON.parse(stored).forEach(lang => purchasedLanguages.add(lang));
    }
  } catch (e) {
    console.warn('Could not load purchases:', e);
  }
}

function savePurchases() {
  try {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify([...purchasedLanguages]));
  } catch (e) {
    console.warn('Could not save purchases:', e);
  }
}

function hasPurchased(lang) {
  return purchasedLanguages.has(lang);
}

function unlockLanguage(lang) {
  purchasedLanguages.add(lang);
  savePurchases();
  updateUI();
}

// For testing: Reset alle køb
function resetPurchases() {
  purchasedLanguages.clear();
  savePurchases();
  updateUI();
  selectLanguage('da');
  console.log('Alle køb nulstillet');
}

// Expose for console testing
window.resetPurchases = resetPurchases;

// ============ PAYMENT ============

function checkPaymentCallback() {
  const params = new URLSearchParams(window.location.search);
  const paidLang = params.get('paid');

  if (paidLang && CONFIG.languages[paidLang]) {
    unlockLanguage(paidLang);
    window.history.replaceState({}, '', window.location.pathname);
    playVideo(paidLang);
    showToast(`✓ ${CONFIG.languages[paidLang].name} er nu låst op!`);
  }
}

function openPaymentModal(lang) {
  pendingLang = lang;
  const langConfig = CONFIG.languages[lang];
  const ui = langConfig.ui;
  
  elements.modalProduct.textContent = ui.product;
  elements.confirmPayBtn.textContent = ui.payButton;
  elements.modal.classList.remove('hidden');
  
  // Clear form
  elements.cardNumber.value = '';
  elements.cardExpiry.value = '';
  elements.cardCvc.value = '';
  elements.cardEmail.value = '';
  
  // Focus first field
  elements.cardNumber.focus();
}

function closePaymentModal() {
  elements.modal.classList.add('hidden');
  pendingLang = null;
}

function processPayment() {
  if (!pendingLang) return;

  const langConfig = CONFIG.languages[pendingLang];
  const ui = langConfig.ui;

  // I test mode: Simuler betaling
  if (CONFIG.testMode) {
    // Vis loading
    elements.confirmPayBtn.textContent = ui.processing;
    elements.confirmPayBtn.disabled = true;

    // Simuler API-kald
    setTimeout(() => {
      elements.confirmPayBtn.textContent = ui.payButton;
      elements.confirmPayBtn.disabled = false;
      
      closePaymentModal();
      unlockLanguage(pendingLang);
      playVideo(pendingLang);
      showToast(`✓ ${ui.success}`);
    }, 1500);
  } else {
    // Produktion: Redirect til Stripe
    const stripeUrl = CONFIG.stripeLinks[pendingLang];
    if (stripeUrl) {
      window.location.href = stripeUrl;
    }
  }
}

// ============ VIDEO PLAYER ============

function selectLanguage(lang) {
  currentLang = lang;
  
  if (hasPurchased(lang)) {
    playVideo(lang);
  } else {
    showPaywall(lang);
  }
  
  updateUI();
}

function playVideo(lang) {
  currentLang = lang;
  hidePaywall();
  
  const videoUrl = CONFIG.videos[lang];
  elements.videoSource.src = videoUrl;
  elements.player.load();
  elements.player.play().catch(() => {});
  
  updateUI();
}

function showPaywall(lang) {
  const langConfig = CONFIG.languages[lang];
  const ui = langConfig.ui;
  
  elements.paywallTitle.textContent = ui.title;
  elements.paywallDesc.textContent = ui.description;
  elements.payBtn.textContent = ui.buyButton;
  elements.paywall.classList.remove('hidden');
  
  // Fjern tidligere sprog-classes
  elements.paywall.classList.remove('rtl', 'lang-ur', 'lang-ar');
  
  // Sæt RTL og sprog-class for Urdu og Arabisk
  if (lang === 'ur') {
    elements.paywall.classList.add('rtl', 'lang-ur');
  } else if (lang === 'ar') {
    elements.paywall.classList.add('rtl', 'lang-ar');
  }
}

function hidePaywall() {
  elements.paywall.classList.add('hidden');
}

// ============ UI ============

function updateUI() {
  elements.langBtns.forEach(btn => {
    const lang = btn.dataset.lang;
    const isPurchased = hasPurchased(lang);
    const isActive = lang === currentLang;

    btn.classList.remove('active', 'locked', 'unlocked');
    
    if (isActive) {
      btn.classList.add('active');
    }
    
    if (isPurchased) {
      btn.classList.add('unlocked');
    } else {
      btn.classList.add('locked');
    }
  });
}

function setupEventListeners() {
  // Language buttons
  elements.langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      selectLanguage(btn.dataset.lang);
    });
  });

  // Pay button (in paywall)
  elements.payBtn.addEventListener('click', () => {
    openPaymentModal(currentLang);
  });

  // Modal close
  elements.modalClose.addEventListener('click', closePaymentModal);
  elements.modal.addEventListener('click', (e) => {
    if (e.target === elements.modal) {
      closePaymentModal();
    }
  });

  // Confirm payment
  elements.confirmPayBtn.addEventListener('click', processPayment);

  // Card number formatting
  elements.cardNumber.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})/g, '$1 ').trim();
    e.target.value = value;
  });

  // Expiry formatting
  elements.cardExpiry.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;
  });

  // ESC to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePaymentModal();
    }
  });
}

function showToast(text) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = text;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

// ============ START ============

init();

// Log test info
console.log('🧪 Test mode aktiv');
console.log('💡 Tip: Kør resetPurchases() i konsollen for at nulstille køb');
