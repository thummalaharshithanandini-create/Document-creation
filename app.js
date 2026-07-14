// DocGenius AI - Core Application Controller (app.js)

// Global Application State
let appState = {
  activeView: 'home',
  brandKit: null,
  apiConfig: null,
  activeDocument: null,
  isRecording: false,
  recognition: null,
  theme: 'dark'
};

// ================= INITIALIZATION & ROUTING =================
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Load configuration details globally on boot
    appState.apiConfig = await FirebaseMock.db.apiConfig.get();

    // Check auth status first
    FirebaseMock.auth.onAuthStateChanged((user) => {
      if (user) {
        // User is logged in
        document.getElementById("auth-overlay").style.display = "none";
        document.getElementById("app-layout").style.display = "flex";
        
        // Load user configurations
        initUserData();
      } else {
        // User is logged out
        document.getElementById("auth-overlay").style.display = "flex";
        document.getElementById("app-layout").style.display = "none";
        appState.activeDocument = null;
      }
    });

    // Setup layout UI listeners
    setupAuthListeners();
    setupNavigation();
    setupSidebarCollapse();
    setupDynamicFormGenerator();
    setupGenerationLogic();
    setupAssistantUtilities();
    setupBrandKitHandlers();
    setupSettingsHandlers();
    setupVoiceInput();
    setupQuickTemplates();
    setupSummaryReader();
  } catch (err) {
    const errInfo = encodeURIComponent(`Boot Error: ${err.message} at ${err.stack}`);
    fetch(`/api/log-error?msg=${errInfo}`).catch(() => {});
  }
});

// Load user brand details, API key, and documents stats
async function initUserData() {
  const user = FirebaseMock.auth.currentUser;
  
  // Set profile text avatar
  const avatar = document.getElementById("header-user-avatar");
  if (avatar && user) {
    avatar.innerText = user.fullName ? user.fullName.charAt(0).toUpperCase() : "U";
    avatar.title = `${user.fullName} (${user.email})`;
  }

  // Load Brand Kit
  appState.brandKit = await FirebaseMock.db.brandKit.get();
  updateBrandKitUI();

  // Load API Key Settings
  appState.apiConfig = await FirebaseMock.db.apiConfig.get();
  updateApiConfigUI();

  // Populate profiles forms
  populateProfileForms();

  // Render lists and stats
  refreshDashboardAndHistory();
}

// Switch between dashboard tab views
function switchView(viewName) {
  const pageViews = document.querySelectorAll(".page-view");
  pageViews.forEach(view => view.classList.remove("active-view"));

  const targetView = document.getElementById(`view-${viewName}`);
  if (targetView) {
    targetView.classList.add("active-view");
    appState.activeView = viewName;
    
    // Update Header title
    const headerTitle = document.getElementById("page-header-title");
    if (headerTitle) {
      headerTitle.innerText = viewName.charAt(0).toUpperCase() + viewName.slice(1).replace('generator', 'AI Generator').replace('brand', 'Brand Kit').replace('history', 'Documents Log');
    }
    
    // Highlight sidebar items
    const navItems = document.querySelectorAll(".sidebar-menu .sidebar-item");
    navItems.forEach(item => {
      if (item.getAttribute("data-target") === viewName) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // Specific tab loads
    if (viewName === 'home' || viewName === 'history') {
      refreshDashboardAndHistory();
    }

    document.getElementById("view-viewport").scrollTop = 0;
  }
}

function setupNavigation() {
  const navItems = document.querySelectorAll(".sidebar-menu .sidebar-item");
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      const target = item.getAttribute("data-target");
      switchView(target);
    });
  });

  const headerAvatar = document.getElementById("header-user-avatar");
  if (headerAvatar) {
    headerAvatar.addEventListener("click", () => {
      switchView("settings");
    });
  }

  const notifClose = document.getElementById("notif-close-btn");
  if (notifClose) {
    notifClose.addEventListener("click", () => {
      document.getElementById("notif-banner").style.display = "none";
    });
  }
}

function setupSidebarCollapse() {
  const sidebar = document.getElementById("app-sidebar");
  const toggleBtn = document.getElementById("sidebar-toggle");
  
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      const icon = toggleBtn.querySelector("span");
      if (sidebar.classList.contains("collapsed")) {
        icon.innerText = "menu";
      } else {
        icon.innerText = "menu_open";
      }
    });
  }

  // Mobile drawer trigger
  const mobileToggle = document.getElementById("mobile-drawer-toggle");
  if (mobileToggle) {
    mobileToggle.addEventListener("click", () => {
      sidebar.classList.toggle("mobile-visible");
    });
  }
}

// Pop up visual alert banner
function showNotification(title, message, isXp = false) {
  const banner = document.getElementById("notif-banner");
  const notifTitle = document.getElementById("notif-title-text");
  const notifBody = document.getElementById("notif-body-text");
  const notifIcon = banner.querySelector(".notif-icon");
  
  if (banner && notifTitle && notifBody) {
    notifTitle.innerText = title;
    notifBody.innerText = message;
    
    if (isXp) {
      notifIcon.innerText = "stars";
      banner.style.borderBottomColor = "var(--secondary)";
    } else {
      notifIcon.innerText = "info";
      banner.style.borderBottomColor = "var(--primary)";
    }
    
    banner.style.display = "flex";
    playHapticBeep();
    setTimeout(() => {
      banner.style.display = "none";
    }, 4500);
  }
}

function playHapticBeep() {
  if (appState.apiConfig && appState.apiConfig.soundEnabled === false) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, ctx.currentTime);
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.08);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {
    console.log("Haptic audio bypass");
  }
}

// ================= AUTHENTICATION OVERLAYS BINDING =================
function setupAuthListeners() {
  // welcome triggers
  document.getElementById("welcome-btn-signin").addEventListener("click", () => showAuthScreen("signin"));
  document.getElementById("welcome-btn-signup").addEventListener("click", () => showAuthScreen("signup"));
  document.getElementById("welcome-btn-guest").addEventListener("click", async () => {
    try {
      await FirebaseMock.auth.signInAsGuest();
    } catch(e) {
      alert("Guest login failed");
    }
  });

  // Back buttons
  document.getElementById("signin-back").addEventListener("click", () => showAuthScreen("welcome"));
  document.getElementById("signup-back").addEventListener("click", () => showAuthScreen("welcome"));
  document.getElementById("otp-back").addEventListener("click", () => showAuthScreen("signup"));
  document.getElementById("forgot-back").addEventListener("click", () => showAuthScreen("signin"));

  // Toggle visible passwords
  document.getElementById("signin-pass-toggle").addEventListener("click", () => togglePasswordVisibility("signin-password", "signin-pass-toggle"));
  document.getElementById("signup-pass-toggle").addEventListener("click", () => togglePasswordVisibility("signup-password", "signup-pass-toggle"));

  // Password strength logic
  const signupPass = document.getElementById("signup-password");
  signupPass.addEventListener("input", () => {
    const pass = signupPass.value;
    const score = FirebaseMock.checkPasswordStrength(pass);
    updatePasswordStrengthUI(score);
  });

  // Form submits
  document.getElementById("signin-submit-btn").addEventListener("click", handleSignIn);
  document.getElementById("signup-submit-btn").addEventListener("click", handleSignUp);
  document.getElementById("otp-submit-btn").addEventListener("click", handleOtpConfirm);
  document.getElementById("welcome-btn-signin").addEventListener("click", () => showAuthScreen("signin"));
  document.getElementById("signin-btn-forgot").addEventListener("click", () => showAuthScreen("forgot"));
  document.getElementById("forgot-submit-btn").addEventListener("click", handleForgotSubmit);
  document.getElementById("forgot-reset-btn").addEventListener("click", handlePasswordReset);
  
  // Terms & Privacy modal trigger
  document.getElementById("btn-show-privacy-terms").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("modal-privacy-terms").style.display = "flex";
  });
  document.getElementById("btn-close-privacy").addEventListener("click", () => {
    document.getElementById("modal-privacy-terms").style.display = "none";
  });

  // Global Sign out trigger
  document.getElementById("header-logout-btn").addEventListener("click", async () => {
    await FirebaseMock.auth.signOut();
  });

  // Google Sign In
  document.getElementById("signin-google").addEventListener("click", async () => {
    try {
      await FirebaseMock.auth.signInWithGoogle();
      showNotification("Google Login Success", "Logged in via Google verified profile!");
    } catch(e) {
      console.error("Google Auth Error:", e);
      let errMsg = e.message;
      if (e.code === 'auth/unauthorized-domain') {
        errMsg = `This domain (${window.location.host}) is not authorized in your Firebase console. Please go to Firebase Console -> Authentication -> Settings -> Authorized Domains and add this domain!`;
      } else if (e.code === 'auth/popup-blocked') {
        errMsg = "Sign-in popup was blocked by your browser. Please allow popups for this website in your browser settings.";
      } else if (e.code === 'auth/operation-not-allowed') {
        errMsg = "Google sign-in provider is disabled in your Firebase console. Please go to Authentication -> Sign-in method and enable the Google provider.";
      }
      alert("Google Sign-In Failed:\n\n" + errMsg);
    }
  });

  // Apple Sign In
  document.getElementById("signin-apple").addEventListener("click", async () => {
    try {
      await FirebaseMock.auth.signInWithApple();
      showNotification("Apple Login Success", "Logged in via Apple verified profile!");
    } catch(e) {
      console.error("Apple Auth Error:", e);
      let errMsg = e.message;
      if (e.code === 'auth/unauthorized-domain') {
        errMsg = `This domain (${window.location.host}) is not authorized in your Firebase console. Please add it to your Authorized Domains list.`;
      } else if (e.code === 'auth/popup-blocked') {
        errMsg = "Sign-in popup was blocked by your browser. Please allow popups.";
      } else if (e.code === 'auth/operation-not-allowed') {
        errMsg = "Apple sign-in provider is disabled in your Firebase console. Please enable it under Authentication -> Sign-in method.";
      }
      alert("Apple Sign-In Failed:\n\n" + errMsg);
    }
  });
}

function showAuthScreen(screenName) {
  const screens = document.querySelectorAll(".auth-box");
  screens.forEach(s => s.style.display = "none");
  document.getElementById(`auth-screen-${screenName}`).style.display = "block";
  
  if (screenName === "forgot") {
    document.getElementById("forgot-step-1").style.display = "block";
    document.getElementById("forgot-step-2").style.display = "none";
    document.getElementById("forgot-email").value = "";
    
    const submitBtn = document.getElementById("forgot-submit-btn");
    if (FirebaseMock.auth.isReal) {
      submitBtn.textContent = "Send Reset Link";
    } else {
      submitBtn.textContent = "Send Verification OTP";
    }
  }
}

function togglePasswordVisibility(fieldId, btnId) {
  const field = document.getElementById(fieldId);
  const icon = document.getElementById(btnId).querySelector("span");
  if (field.type === "password") {
    field.type = "text";
    icon.innerText = "visibility_off";
  } else {
    field.type = "password";
    icon.innerText = "visibility";
  }
}

function updatePasswordStrengthUI(score) {
  const text = document.getElementById("strength-text");
  const bars = [
    document.getElementById("strength-bar-1"),
    document.getElementById("strength-bar-2"),
    document.getElementById("strength-bar-3"),
    document.getElementById("strength-bar-4")
  ];

  // reset bars
  bars.forEach(b => {
    b.style.backgroundColor = "var(--outline-variant)";
  });

  const labels = ["Weak", "Medium", "Strong", "Excellent"];
  const colors = ["#cf6679", "#FF9800", "#4CAF50", "#03dac6"];

  if (score === 0) {
    text.innerText = "Password Strength: None";
    return;
  }

  text.innerText = `Password Strength: ${labels[score - 1]}`;
  for (let idx = 0; idx < score; idx++) {
    bars[idx].style.backgroundColor = colors[score - 1];
  }
}

async function sendOTPEmail(email, subject, bodyContent) {
  const config = await FirebaseMock.db.apiConfig.get();
  const user = config.smtpUser;
  const pass = config.smtpPass;
  const host = config.smtpHost || 'smtp.gmail.com';
  const port = config.smtpPort || 587;

  if (!user || !pass) {
    console.warn("SMTP credentials not configured. Bypassing email dispatch.");
    return false;
  }

  try {
    const response = await fetch('/api/send-email', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        smtp: { host, port, user, pass },
        to: email,
        subject: subject,
        body: bodyContent
      })
    });
    
    if (response.ok) {
      const res = await response.json();
      return res.status === 'success';
    }
    return false;
  } catch(e) {
    console.error("Email send failed:", e);
    return false;
  }
}

async function handleSignIn() {
  const email = document.getElementById("signin-email").value;
  const password = document.getElementById("signin-password").value;
  
  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }
  
  try {
    await FirebaseMock.auth.signIn(email, password);
  } catch(e) {
    alert(e.message);
  }
}

async function handleSignUp() {
  const name = document.getElementById("signup-name").value;
  const email = document.getElementById("signup-email").value;
  const phone = document.getElementById("signup-phone").value;
  const password = document.getElementById("signup-password").value;
  const confirm = document.getElementById("signup-confirm-password").value;
  const terms = document.getElementById("signup-terms").checked;

  if (!name || !email || !password) {
    alert("Please fill in all required fields (Name, Email, Password).");
    return;
  }
  if (password !== confirm) {
    alert("Passwords do not match.");
    return;
  }
  if (!terms) {
    alert("You must accept the terms of service.");
    return;
  }

  try {
    await FirebaseMock.auth.signUp(name, email, phone, password);
    
    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    appState.currentOTP = otp;

    // Compose HTML Email Content
    const emailSubject = "DocGenius AI - Verification Code";
    const emailBody = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 500px;">
        <h2 style="color: #9d4edd; margin: 0 0 10px 0;">Verify Your Account</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Thank you for signing up to DocGenius AI! Use the following 6-digit verification code to activate your account:</p>
        <div style="font-size: 28px; font-weight: 700; color: #9d4edd; letter-spacing: 4px; padding: 12px; background: #faf5ff; text-align: center; border-radius: 6px; margin: 20px 0; border: 1px dashed #d8b4fe;">${otp}</div>
        <p>If you did not initiate this request, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 20px;">
        <p style="font-size: 11px; color: #a5a2b8; margin: 10px 0 0 0;">DocGenius AI Smart Document Generation Platform</p>
      </div>
    `;

    document.getElementById("otp-destination-text").innerText = `Enter code sent to ${email}`;
    showAuthScreen("otp");
    startOtpCountdown();

    const sent = await sendOTPEmail(email, emailSubject, emailBody);
    if (sent) {
      alert(`A verification code has been successfully sent to ${email}. Please check your inbox (and spam folder)!`);
    } else {
      appState.currentOTP = "123456";
      alert("SMTP Server not configured. We bypassed email dispatch. For demo verification, please use code: 123456");
    }
  } catch(e) {
    alert(e.message);
  }
}

let countdownTimer;
function startOtpCountdown() {
  let seconds = 60;
  const timerLbl = document.getElementById("otp-countdown");
  const resendBtn = document.getElementById("otp-resend-btn");
  const timerText = document.getElementById("otp-timer-lbl");
  
  resendBtn.style.display = "none";
  timerText.style.display = "inline";
  timerLbl.innerText = `${seconds}s`;

  clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    seconds--;
    timerLbl.innerText = `${seconds}s`;
    if (seconds <= 0) {
      clearInterval(countdownTimer);
      timerText.style.display = "none";
      resendBtn.style.display = "inline-block";
    }
  }, 1000);
}

async function handleOtpConfirm() {
  const digits = [
    document.getElementById("otp-1").value,
    document.getElementById("otp-2").value,
    document.getElementById("otp-3").value,
    document.getElementById("otp-4").value,
    document.getElementById("otp-5").value,
    document.getElementById("otp-6").value
  ].join('');

  if (digits.length < 6) {
    alert("Please enter all 6 digits.");
    return;
  }

  try {
    const requiredOTP = appState.currentOTP || "123456";
    if (digits !== requiredOTP) {
      alert("Invalid 6-digit OTP code entered. Please try again.");
      return;
    }
    // Verify using standard mock code to bypass backend checks
    await FirebaseMock.auth.verifyOTP("123456");
    showNotification("Account Verified", "Welcome to DocGenius AI!", true);
  } catch(e) {
    alert(e.message);
  }
}

async function handleForgotSubmit() {
  const email = document.getElementById("forgot-email").value.trim();
  if (!email) {
    alert("Please enter your email.");
    return;
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  const btn = document.getElementById("forgot-submit-btn");
  const originalText = btn.textContent;
  btn.textContent = "Sending...";
  btn.disabled = true;

  try {
    const isReal = FirebaseMock.auth.isReal;
    await FirebaseMock.auth.sendPasswordResetEmail(email);

    if (isReal) {
      alert("A password reset link has been sent to your email. Please check your inbox (and Spam folder if necessary).");
      showAuthScreen("signin");
    } else {
      // Mock flow with OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      appState.currentOTP = otp;

      const emailSubject = "DocGenius AI - Password Recovery";
      const emailBody = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 500px;">
          <h2 style="color: #9d4edd; margin: 0 0 10px 0;">Reset Your Password</h2>
          <p>We received a request to reset your password. Use the following authorization code to complete your reset request:</p>
          <div style="font-size: 28px; font-weight: 700; color: #9d4edd; letter-spacing: 4px; padding: 12px; background: #faf5ff; text-align: center; border-radius: 6px; margin: 20px 0; border: 1px dashed #d8b4fe;">${otp}</div>
          <p>If you did not request a password reset, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 20px;">
          <p style="font-size: 11px; color: #a5a2b8; margin: 10px 0 0 0;">DocGenius AI Smart Document Generation Platform</p>
        </div>
      `;

      document.getElementById("forgot-step-1").style.display = "none";
      document.getElementById("forgot-step-2").style.display = "block";

      const sent = await sendOTPEmail(email, emailSubject, emailBody);
      if (sent) {
        alert(`A password recovery code has been sent to ${email}. Check your inbox!`);
      } else {
        appState.currentOTP = "123456";
        alert("SMTP Server not configured. Bypassed email recovery: please use code 123456 to authorize reset.");
      }
    }
  } catch(e) {
    console.error("Password Reset Error:", e);
    let errMsg = e.message;
    if (e.code === 'auth/invalid-email') {
      errMsg = "The email address entered is invalid or badly formatted.";
    } else if (e.code === 'auth/user-not-found') {
      errMsg = "This email address is not registered in our system.";
    } else if (e.code === 'auth/network-request-failed') {
      errMsg = "A network connection error occurred. Please check your internet connectivity.";
    }
    alert(errMsg);
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

async function handlePasswordReset() {
  const otpInput = document.getElementById("forgot-otp").value;
  const newPass = document.getElementById("forgot-new-password").value;
  if (!otpInput || newPass.length < 4) {
    alert("Please enter the 6-digit OTP and a new password (min 4 characters).");
    return;
  }
  try {
    const requiredOTP = appState.currentOTP || "123456";
    if (otpInput !== requiredOTP) {
      alert("Invalid verification code. Please check your email.");
      return;
    }
    // Verify using standard mock code to bypass backend checks
    await FirebaseMock.auth.verifyOTP("123456");
    
    const user = FirebaseMock.auth.currentUser;
    if (user) {
      await FirebaseMock.auth.changePassword(user.passwordHash, newPass);
      alert("Password reset successfully. Please sign in.");
      showAuthScreen("signin");
    }
  } catch(e) {
    alert(e.message);
  }
}

// ================= DYNAMIC FORM GENERATOR =================
function setupDynamicFormGenerator() {
  const categorySelect = document.getElementById("gen-category");
  const typeSelect = document.getElementById("gen-type");

  if (categorySelect && typeSelect) {
    // Initial load
    populateTypeOptions();
    
    categorySelect.addEventListener("change", () => {
      populateTypeOptions();
    });

    typeSelect.addEventListener("change", () => {
      renderTemplateFields();
    });
  }
}

function populateTypeOptions() {
  const category = document.getElementById("gen-category").value;
  const typeSelect = document.getElementById("gen-type");
  
  if (!typeSelect) return;
  typeSelect.innerHTML = "";

  const typesObj = DocumentDB.categories[category].types;
  Object.entries(typesObj).forEach(([typeKey, typeDetails]) => {
    const opt = document.createElement("option");
    opt.value = typeKey;
    opt.innerText = typeDetails.label;
    typeSelect.appendChild(opt);
  });

  renderTemplateFields();
}

function renderTemplateFields() {
  const category = document.getElementById("gen-category").value;
  const type = document.getElementById("gen-type").value;
  const container = document.getElementById("gen-dynamic-fields-container");

  if (!container) return;
  container.innerHTML = "";

  const fields = DocumentDB.categories[category].types[type].fields;
  fields.forEach(field => {
    const group = document.createElement("div");
    group.className = "calc-input-group";
    group.style.marginBottom = "8px";

    const label = document.createElement("label");
    label.className = "calc-label";
    label.innerText = field.label;

    let input;
    if (field.type === "textarea") {
      input = document.createElement("textarea");
      input.className = "calc-field";
      input.style.height = "60px";
      input.style.resize = "none";
      input.style.padding = "10px";
    } else {
      input = document.createElement("input");
      input.type = field.type;
      input.className = "calc-field";
    }

    input.id = `input-field-${field.id}`;
    input.placeholder = field.placeholder || "";
    input.value = field.default || "";

    group.appendChild(label);
    group.appendChild(input);
    container.appendChild(group);
  });
}

// Setup Quick template clicks on Dashboard
function setupQuickTemplates() {
  const cards = document.querySelectorAll(".template-card");
  cards.forEach(card => {
    card.addEventListener("click", () => {
      const cat = card.getAttribute("data-category");
      const type = card.getAttribute("data-type");

      // Set category and type selects
      document.getElementById("gen-category").value = cat;
      populateTypeOptions();
      document.getElementById("gen-type").value = type;
      renderTemplateFields();

      // Go to generator
      switchView("generator");
    });
  });
}

// ================= CORE GENERATOR LOGIC & GEMINI INTEGRATION =================
function setupGenerationLogic() {
  const genBtn = document.getElementById("btn-generate-doc");
  const saveBtn = document.getElementById("btn-save-doc");
  const shareBtn = document.getElementById("btn-share-doc");
  const pdfBtn = document.getElementById("btn-export-pdf");
  const wordBtn = document.getElementById("btn-export-word");

  if (genBtn) {
    genBtn.addEventListener("click", triggerDocumentGeneration);
  }
  if (saveBtn) {
    saveBtn.addEventListener("click", triggerSaveDocument);
  }
  if (shareBtn) {
    shareBtn.addEventListener("click", triggerShareLink);
  }
  if (pdfBtn) {
    pdfBtn.addEventListener("click", () => {
      const title = appState.activeDocument ? appState.activeDocument.title : "DocGenius_Export";
      exportToPDF(title, "a4-document-paper");
    });
  }
  if (wordBtn) {
    wordBtn.addEventListener("click", () => {
      const title = appState.activeDocument ? appState.activeDocument.title : "DocGenius_Export";
      const content = document.getElementById("document-content-editor").innerHTML;
      exportToWord(title, content, appState.brandKit, document.getElementById("gen-apply-brand").checked);
    });
  }

  // Monitor editor keypresses to enable save button when edited manually
  const editor = document.getElementById("document-content-editor");
  if (editor) {
    editor.addEventListener("input", () => {
      if (saveBtn) saveBtn.removeAttribute("disabled");
    });
  }

  // Monitor Apply Branding checkbox
  const brandCheck = document.getElementById("gen-apply-brand");
  if (brandCheck) {
    brandCheck.addEventListener("change", () => {
      updateBrandingOverlayOnPreview();
    });
  }
}

async function triggerDocumentGeneration() {
  const category = document.getElementById("gen-category").value;
  const type = document.getElementById("gen-type").value;
  const promptContext = document.getElementById("gen-prompt").value;
  const tone = document.getElementById("gen-tone").value;
  const language = document.getElementById("gen-language").value;
  const useBranding = document.getElementById("gen-apply-brand").checked;

  // Gather variables
  const fields = DocumentDB.categories[category].types[type].fields;
  const variables = {};
  fields.forEach(field => {
    const input = document.getElementById(`input-field-${field.id}`);
    if (input) {
      variables[field.id] = input.value;
    }
  });

  // Display loading screen
  const loading = document.getElementById("ai-loading-overlay");
  const loadingText = document.getElementById("ai-loading-status-text");
  
  if (loading) {
    loadingText.innerText = "DocGenius AI is crafting your document...";
    loading.style.display = "flex";
  }

  let generatedHtml = "";
  const apiKey = (appState.apiConfig && appState.apiConfig.apiKey) ? appState.apiConfig.apiKey.trim() : "";
  const modelName = (appState.apiConfig && appState.apiConfig.model) ? appState.apiConfig.model : "gemini-2.5-flash";

  // Build System Prompt
  const fullPrompt = DocumentDB.buildGeminiPrompt(category, type, variables, promptContext, tone, language, appState.brandKit, useBranding);

  if (apiKey) {
    // LIVE GEMINI API GENERATION
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: { temperature: 0.3 }
        })
      });

      if (!response.ok) {
        throw new Error(`API Status Code: ${response.status}`);
      }

      const resData = await response.json();
      let rawText = resData.candidates[0].content.parts[0].text;
      
      // Sanitize markdown backticks HTML wrappers
      generatedHtml = cleanMarkdownWrappers(rawText);
      showNotification("Document Crafted", "Successfully generated live content using Gemini AI!");
    } catch(e) {
      console.warn("Gemini Live Generation Failed, rolling back to Offline template engine.", e);
      generatedHtml = DocumentDB.generateOfflineMockDoc(category, type, variables, promptContext, tone, language, appState.brandKit, useBranding);
      showNotification("Offline Fallback Mode", "Live Gemini API failed. Generated document using local offline engine.");
    }
  } else {
    // OFFLINE ENGINE SIMULATOR
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
    generatedHtml = DocumentDB.generateOfflineMockDoc(category, type, variables, promptContext, tone, language, appState.brandKit, useBranding);
    showNotification("Offline Generation Mode", "Simulated document created. Configure your Gemini key in Settings for live AI.");
  }

  // Populate Preview Editor
  const editor = document.getElementById("document-content-editor");
  if (editor) {
    editor.innerHTML = generatedHtml;
  }

  // Apply visual Brand Overlay if selected
  updateBrandingOverlayOnPreview();

  // Show assist utilities panel
  document.getElementById("assist-utilities-box").style.display = "block";

  // Enable utility toolbar buttons
  document.getElementById("btn-save-doc").removeAttribute("disabled");
  document.getElementById("btn-export-pdf").removeAttribute("disabled");
  document.getElementById("btn-export-word").removeAttribute("disabled");
  document.getElementById("btn-summarize-doc").removeAttribute("disabled");

  // Since it's a new generation, clear the activeDocument id reference
  // so saving is treated as a new document draft creation
  appState.activeDocument = null;
  document.getElementById("btn-share-doc").setAttribute("disabled", "true");
  document.getElementById("version-control-sidebar").style.display = "none";

  if (loading) {
    loading.style.display = "none";
  }
}

function cleanMarkdownWrappers(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith("```html")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

function updateBrandingOverlayOnPreview() {
  const useBranding = document.getElementById("gen-apply-brand").checked;
  const brandHeader = document.getElementById("doc-brand-header");
  const brandFooter = document.getElementById("doc-brand-footer");
  const paper = document.getElementById("a4-document-paper");

  if (!brandHeader || !brandFooter) return;

  if (useBranding && appState.brandKit && appState.brandKit.companyName) {
    // Populate branded details
    document.getElementById("doc-brand-name").innerText = appState.brandKit.companyName;
    document.getElementById("doc-brand-tagline").innerText = appState.brandKit.tagline || "";
    document.getElementById("doc-brand-details").innerText = `${appState.brandKit.address || ''} | Phone: ${appState.brandKit.phone || ''} | Email: ${appState.brandKit.email || ''}`;
    
    if (appState.brandKit.taxNumber) {
      document.getElementById("doc-brand-tax-line").innerText = `GSTIN: ${appState.brandKit.taxNumber}`;
      document.getElementById("doc-brand-tax-line").style.display = "block";
    } else {
      document.getElementById("doc-brand-tax-line").style.display = "none";
    }

    // Logo image rendering
    const logoImg = document.getElementById("doc-brand-logo");
    const logoPlaceholder = document.getElementById("doc-brand-logo-placeholder");
    
    if (appState.brandKit.logoBase64) {
      logoImg.src = appState.brandKit.logoBase64;
      logoImg.style.display = "block";
      logoPlaceholder.style.display = "none";
    } else {
      logoImg.style.display = "none";
      logoPlaceholder.style.display = "block";
    }

    // Apply primary colors dynamically
    if (appState.brandKit.primaryColor) {
      paper.style.borderTop = `6px solid ${appState.brandKit.primaryColor}`;
    }

    brandHeader.style.display = "block";
    brandFooter.style.display = "block";
  } else {
    // Hide brand kit tags
    brandHeader.style.display = "none";
    brandFooter.style.display = "none";
    paper.style.borderTop = "none";
  }
}

// ================= ASSIST UTILITIES OPERATIONS =================
function setupAssistantUtilities() {
  document.getElementById("btn-util-rewrite").addEventListener("click", () => triggerAssistAction("rewrite"));
  document.getElementById("btn-util-summarize").addEventListener("click", () => triggerAssistAction("summarize"));
  document.getElementById("btn-util-grammar").addEventListener("click", () => triggerAssistAction("grammar"));
  document.getElementById("btn-util-translate").addEventListener("click", () => {
    const lang = document.getElementById("util-translate-lang").value;
    triggerAssistAction("translate", lang);
  });
  document.getElementById("btn-util-convert").addEventListener("click", () => {
    const targetType = document.getElementById("util-convert-target").value;
    triggerAssistAction("convert", targetType);
  });
}

async function triggerAssistAction(actionType, extraParam = "") {
  const editor = document.getElementById("document-content-editor");
  if (!editor || !editor.innerText.trim()) {
    alert("There is no content to modify. Please generate a document first.");
    return;
  }

  const currentHtml = editor.innerHTML;
  
  // Show loading
  const loading = document.getElementById("ai-loading-overlay");
  const loadingText = document.getElementById("ai-loading-status-text");
  if (loading) {
    loadingText.innerText = `AI assistant is processing ${actionType} action...`;
    loading.style.display = "flex";
  }

  let prompt = "";
  switch(actionType) {
    case "rewrite":
      prompt = `Rewrite the following text professionally. Preserve all existing HTML layout structures, bold headings, lists, or tables. Output ONLY the resulting inner HTML without markdown wrappers:\n\n${currentHtml}`;
      break;
    case "summarize":
      prompt = `Summarize the following document content while keeping its essential headings and structured format in HTML. Output ONLY the resulting inner HTML without markdown wrappers:\n\n${currentHtml}`;
      break;
    case "grammar":
      prompt = `Review the grammar, punctuation, and wording of the following document and correct any mistakes. Maintain all existing HTML structures. Output ONLY the corrected inner HTML:\n\n${currentHtml}`;
      break;
    case "translate":
      prompt = `Translate the following text content completely into ${extraParam}. Retain all HTML layout wrappers and table structures. Output ONLY the translated inner HTML:\n\n${currentHtml}`;
      break;
    case "convert":
      prompt = `Convert this document style structure from its current format into a "${extraParam}" format. Reorganize headings, table rows, and labels to fit a professional "${extraParam}" layout, while preserving details. Output ONLY the inner HTML:\n\n${currentHtml}`;
      break;
  }

  let finalHtml = "";
  const apiKey = (appState.apiConfig && appState.apiConfig.apiKey) ? appState.apiConfig.apiKey.trim() : "";
  const modelName = (appState.apiConfig && appState.apiConfig.model) ? appState.apiConfig.model : "gemini-2.5-flash";

  if (apiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3 }
        })
      });

      if (!response.ok) throw new Error("API fail");
      
      const resData = await response.json();
      let rawText = resData.candidates[0].content.parts[0].text;
      finalHtml = cleanMarkdownWrappers(rawText);
      showNotification("AI Update Complete", "Document updated successfully.");
    } catch(e) {
      console.warn("Live API Assistant failed, using mockup processing.", e);
      finalHtml = mockOfflineAssistantResult(actionType, currentHtml, extraParam);
    }
  } else {
    // Offline simulated delays
    await new Promise(resolve => setTimeout(resolve, 1000));
    finalHtml = mockOfflineAssistantResult(actionType, currentHtml, extraParam);
  }

  // Update editor
  editor.innerHTML = finalHtml;
  
  // Enable save button
  document.getElementById("btn-save-doc").removeAttribute("disabled");

  if (loading) {
    loading.style.display = "none";
  }
}

function mockOfflineAssistantResult(actionType, currentHtml, param = "") {
  showNotification("Offline Simulated Action", `Processed simulated "${actionType}" modifier.`);
  
  switch(actionType) {
    case "rewrite":
      return `<h2>(Professionally Rewritten)</h2>\n${currentHtml}`;
    case "summarize":
      return `<h2>Executive Summary Overview</h2>\n<p>This is a summarized draft of the original generated content details, compiled offline by DocGenius AI.</p>\n${currentHtml.slice(0, 300)}...`;
    case "grammar":
      return `<h2>(Grammar Corrected Draft)</h2>\n${currentHtml}`;
    case "translate":
      return `<h2>(Translated to ${param})</h2>\n${currentHtml}`;
    case "convert":
      return `<h1>Converted Document (${param.toUpperCase()})</h1>\n<p>Converted from original template to fit the ${param} layout guidelines.</p>\n${currentHtml}`;
    default:
      return currentHtml;
  }
}

// ================= SAVE, REGISTRY & VERSION CONTROL =================
async function triggerSaveDocument() {
  const editor = document.getElementById("document-content-editor");
  const content = editor.innerHTML;
  
  if (!content.trim()) {
    alert("Nothing to save. Please generate content first.");
    return;
  }

  const category = document.getElementById("gen-category").value;
  const type = document.getElementById("gen-type").value;
  
  // Prompt for title
  let title = "Generated Document";
  if (appState.activeDocument) {
    title = appState.activeDocument.title;
  } else {
    const userTitle = prompt("Enter a title for this document:", `${type.replace('_', ' ').toUpperCase()} Draft`);
    if (userTitle === null) return; // cancel
    if (userTitle.trim()) title = userTitle.trim();
  }

  const loading = document.getElementById("ai-loading-overlay");
  if (loading) {
    loading.style.display = "flex";
  }

  try {
    if (appState.activeDocument) {
      // Update existing document (Creates new version snapshot)
      const verTitle = prompt("Enter a description for this version update:", `Edit snapshot ${new Date().toLocaleTimeString()}`);
      const updatedDoc = await FirebaseMock.db.documents.update(appState.activeDocument.id, content, verTitle || undefined);
      appState.activeDocument = updatedDoc;
      showNotification("Document Saved", "Changes saved and new version snapshot registered.");
    } else {
      // Create new document draft
      const newDoc = await FirebaseMock.db.documents.add(title, category, type, content);
      appState.activeDocument = newDoc;
      showNotification("Document Created", "New draft saved to local registry logs.");
      
      // Enable sharing
      document.getElementById("btn-share-doc").removeAttribute("disabled");
    }

    // Refresh version list
    renderVersionHistoryList();
    
    // Disable save button until further edits occur
    document.getElementById("btn-save-doc").setAttribute("disabled", "true");
  } catch(e) {
    alert(e.message);
  } finally {
    if (loading) loading.style.display = "none";
  }
}

async function triggerShareLink() {
  if (!appState.activeDocument) return;
  const shareLink = `${window.location.origin}${window.location.pathname}?docId=${appState.activeDocument.id}`;
  
  try {
    await navigator.clipboard.writeText(shareLink);
    showNotification("Share Link Copied", "Simulated share link copied to clipboard!");
  } catch(e) {
    alert(`Share Link: ${shareLink}`);
  }
}

async function openDocumentInEditor(docId) {
  const doc = await FirebaseMock.db.documents.getById(docId);
  if (!doc) return;

  appState.activeDocument = doc;

  // Set selectors
  document.getElementById("gen-category").value = doc.category;
  populateTypeOptions();
  document.getElementById("gen-type").value = doc.type;
  renderTemplateFields();

  // Populate editor HTML
  const editor = document.getElementById("document-content-editor");
  if (editor) {
    editor.innerHTML = doc.content;
  }

  // Update preview branding
  updateBrandingOverlayOnPreview();

  // Enable toolbars
  document.getElementById("btn-save-doc").setAttribute("disabled", "true"); // starts unsaved/unmodified
  document.getElementById("btn-share-doc").removeAttribute("disabled");
  document.getElementById("btn-export-pdf").removeAttribute("disabled");
  document.getElementById("btn-export-word").removeAttribute("disabled");
  document.getElementById("btn-summarize-doc").removeAttribute("disabled");
  
  // Show assist utilities and version list
  document.getElementById("assist-utilities-box").style.display = "block";
  
  // Render version history list
  renderVersionHistoryList();

  // Route to editor
  switchView("generator");
}

function renderVersionHistoryList() {
  const container = document.getElementById("version-control-sidebar");
  const list = document.getElementById("version-log-list");
  
  if (!container || !list) return;

  if (!appState.activeDocument) {
    container.style.display = "none";
    return;
  }

  list.innerHTML = "";
  
  // Reverse sort versions so newest are at the top
  const sorted = [...appState.activeDocument.versions].reverse();
  sorted.forEach(v => {
    const date = new Date(v.timestamp);
    const item = document.createElement("div");
    item.className = "version-log-item";
    item.innerHTML = `
      <div class="version-title">${v.versionId} - ${v.title || 'Revision'}</div>
      <div class="version-time">${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
      <button class="version-rollback-btn" data-vid="${v.versionId}">Rollback</button>
    `;

    item.querySelector(".version-rollback-btn").addEventListener("click", () => {
      triggerRollback(v.versionId);
    });

    list.appendChild(item);
  });

  container.style.display = "flex";
}

async function triggerRollback(versionId) {
  if (!appState.activeDocument) return;
  const conf = confirm(`Are you sure you want to rollback to version ${versionId}? Unsaved edits on the current draft will be overwritten.`);
  if (!conf) return;

  try {
    const rolledDoc = await FirebaseMock.db.documents.rollback(appState.activeDocument.id, versionId);
    appState.activeDocument = rolledDoc;
    
    // Update editor
    document.getElementById("document-content-editor").innerHTML = rolledDoc.content;
    
    // Refresh branding
    updateBrandingOverlayOnPreview();
    
    // Refresh versions list
    renderVersionHistoryList();
    
    showNotification("Rollback Complete", `Successfully rolled back to version ${versionId}`);
  } catch(e) {
    alert(e.message);
  }
}

// Render Dashboard stats and Documents tables
async function refreshDashboardAndHistory() {
  const docs = await FirebaseMock.db.documents.get();
  
  // Update stats counters
  const statsCount = document.getElementById("stats-docs-count");
  if (statsCount) {
    statsCount.innerText = docs.length;
  }

  // Dashboard table
  const recentTable = document.getElementById("dashboard-recent-table");
  const recentEmpty = document.getElementById("dashboard-recent-empty");
  const recentTbody = document.getElementById("dashboard-recent-tbody");
  
  // Sort docs by newest
  const sortedDocs = [...docs].sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  if (sortedDocs.length > 0) {
    if (recentTbody) {
      recentTbody.innerHTML = "";
      sortedDocs.slice(0, 5).forEach(doc => {
        const tr = document.createElement("tr");
        const modDate = new Date(doc.updatedAt).toLocaleDateString();
        const catLabel = DocumentDB.categories[doc.category] ? DocumentDB.categories[doc.category].label.split(' ')[1] : doc.category;
        
        tr.innerHTML = `
          <td class="table-doc-title" data-id="${doc.id}">${doc.title}</td>
          <td><span class="table-badge badge-${doc.category}">${catLabel}</span></td>
          <td>${modDate}</td>
          <td>${doc.versions.length}</td>
          <td style="text-align: right;">
            <button class="top-bar-action btn-delete-row" data-id="${doc.id}" style="display:inline-flex; color: var(--error);" title="Delete"><span class="material-symbols-outlined" style="font-size:18px;">delete</span></button>
          </td>
        `;

        tr.querySelector(".table-doc-title").addEventListener("click", () => openDocumentInEditor(doc.id));
        tr.querySelector(".btn-delete-row").addEventListener("click", (e) => {
          e.stopPropagation();
          deleteDocument(doc.id);
        });

        recentTbody.appendChild(tr);
      });
    }
    if (recentTable) recentTable.style.display = "table";
    if (recentEmpty) recentEmpty.style.display = "none";
  } else {
    if (recentTable) recentTable.style.display = "none";
    if (recentEmpty) recentEmpty.style.display = "flex";
  }

  // History Registry Page table
  const regTable = document.getElementById("history-registry-table");
  const regEmpty = document.getElementById("history-registry-empty");
  const regTbody = document.getElementById("history-registry-tbody");

  // Filter and Search logic
  const searchInput = document.getElementById("history-search") ? document.getElementById("history-search").value.toLowerCase() : "";
  const filterCat = document.getElementById("history-filter-category") ? document.getElementById("history-filter-category").value : "all";
  const sortVal = document.getElementById("history-sort") ? document.getElementById("history-sort").value : "date-desc";

  let filtered = docs.filter(doc => {
    const matchSearch = doc.title.toLowerCase().includes(searchInput);
    const matchCat = filterCat === "all" || doc.category === filterCat;
    return matchSearch && matchCat;
  });

  // Sorting
  filtered.sort((a, b) => {
    if (sortVal === "date-desc") return new Date(b.updatedAt) - new Date(a.updatedAt);
    if (sortVal === "date-asc") return new Date(a.updatedAt) - new Date(b.updatedAt);
    if (sortVal === "alpha-asc") return a.title.localeCompare(b.title);
    return 0;
  });

  if (filtered.length > 0) {
    if (regTbody) {
      regTbody.innerHTML = "";
      filtered.forEach(doc => {
        const tr = document.createElement("tr");
        const modDate = new Date(doc.updatedAt).toLocaleDateString();
        const catLabel = DocumentDB.categories[doc.category] ? DocumentDB.categories[doc.category].label.split(' ')[1] : doc.category;
        const typeLabel = DocumentDB.categories[doc.category]?.types[doc.type]?.label || doc.type;
        
        tr.innerHTML = `
          <td class="table-doc-title" data-id="${doc.id}">${doc.title}</td>
          <td><span class="table-badge badge-${doc.category}">${catLabel}</span></td>
          <td>${typeLabel}</td>
          <td>${modDate}</td>
          <td>${doc.versions.length}</td>
          <td style="text-align: right; display: flex; gap: 6px; justify-content: flex-end;">
            <button class="top-bar-action btn-edit-row" data-id="${doc.id}" style="color: var(--primary);" title="Edit"><span class="material-symbols-outlined" style="font-size:18px;">edit</span></button>
            <button class="top-bar-action btn-delete-row" data-id="${doc.id}" style="color: var(--error);" title="Delete"><span class="material-symbols-outlined" style="font-size:18px;">delete</span></button>
          </td>
        `;

        tr.querySelector(".table-doc-title").addEventListener("click", () => openDocumentInEditor(doc.id));
        tr.querySelector(".btn-edit-row").addEventListener("click", () => openDocumentInEditor(doc.id));
        tr.querySelector(".btn-delete-row").addEventListener("click", () => deleteDocument(doc.id));

        regTbody.appendChild(tr);
      });
    }
    if (regTable) regTable.style.display = "table";
    if (regEmpty) regEmpty.style.display = "none";
  } else {
    if (regTable) regTable.style.display = "none";
    if (regEmpty) regEmpty.style.display = "flex";
  }

  // Bind History search and filter listeners once
  setupHistoryFilters();
}

let historyFiltersBound = false;
function setupHistoryFilters() {
  if (historyFiltersBound) return;
  
  const search = document.getElementById("history-search");
  const cat = document.getElementById("history-filter-category");
  const sort = document.getElementById("history-sort");

  if (search) search.addEventListener("input", refreshDashboardAndHistory);
  if (cat) cat.addEventListener("change", refreshDashboardAndHistory);
  if (sort) sort.addEventListener("change", refreshDashboardAndHistory);

  historyFiltersBound = true;
}

async function deleteDocument(docId) {
  const conf = confirm("Are you sure you want to permanently delete this document draft?");
  if (!conf) return;
  
  await FirebaseMock.db.documents.delete(docId);
  showNotification("Document Deleted", "Removed document from registry database.");
  
  // If active document was deleted, reset editor
  if (appState.activeDocument && appState.activeDocument.id === docId) {
    appState.activeDocument = null;
    document.getElementById("document-content-editor").innerHTML = "";
    document.getElementById("btn-save-doc").setAttribute("disabled", "true");
    document.getElementById("btn-share-doc").setAttribute("disabled", "true");
    document.getElementById("btn-summarize-doc").setAttribute("disabled", "true");
    document.getElementById("version-control-sidebar").style.display = "none";
    updateBrandingOverlayOnPreview();
  }

  refreshDashboardAndHistory();
}

// ================= BRAND KIT CONFIGURES =================
function setupBrandKitHandlers() {
  const fileInput = document.getElementById("logo-file-input");
  const uploadZone = document.getElementById("logo-uploader-zone");
  const removeLogoBtn = document.getElementById("btn-remove-logo");

  if (uploadZone && fileInput) {
    uploadZone.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        processLogoFile(file);
      }
    });

    // drag and drop
    uploadZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      uploadZone.style.borderColor = "var(--primary)";
    });
    
    uploadZone.addEventListener("dragleave", () => {
      uploadZone.style.borderColor = "var(--outline)";
    });

    uploadZone.addEventListener("drop", (e) => {
      e.preventDefault();
      uploadZone.style.borderColor = "var(--outline)";
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        processLogoFile(file);
      }
    });
  }

  if (removeLogoBtn) {
    removeLogoBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      appState.brandKit.logoBase64 = "";
      updateLogoPreview(null);
    });
  }

  // Bind forms changes to Blueprint mockups
  const fields = ["brand-name", "brand-tagline", "brand-email", "brand-phone", "brand-address", "brand-tax", "brand-color"];
  fields.forEach(fid => {
    const el = document.getElementById(fid);
    if (el) {
      el.addEventListener("input", updateBrandBlueprintUI);
    }
  });

  // Save Brand Profile
  document.getElementById("btn-save-brand").addEventListener("click", saveBrandKitProfile);
}

function processLogoFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target.result;
    appState.brandKit.logoBase64 = base64;
    updateLogoPreview(base64);
  };
  reader.readAsDataURL(file);
}

function updateLogoPreview(base64) {
  const prompt = document.getElementById("logo-uploader-prompt");
  const preview = document.getElementById("logo-uploader-preview");
  const previewImg = document.getElementById("logo-preview-img");

  if (base64) {
    previewImg.src = base64;
    prompt.style.display = "none";
    preview.style.display = "flex";
  } else {
    previewImg.src = "";
    prompt.style.display = "flex";
    preview.style.display = "none";
  }
  updateBrandBlueprintUI();
}

function updateBrandBlueprintUI() {
  const name = document.getElementById("brand-name").value || "Company Name";
  const tagline = document.getElementById("brand-tagline").value || "Tagline goes here";
  const email = document.getElementById("brand-email").value || "";
  const phone = document.getElementById("brand-phone").value || "";
  const address = document.getElementById("brand-address").value || "";
  const tax = document.getElementById("brand-tax").value || "";
  const color = document.getElementById("brand-color").value || "#bb86fc";

  document.getElementById("blueprint-brand-name").innerText = name;
  document.getElementById("blueprint-brand-tagline").innerText = tagline;
  document.getElementById("blueprint-brand-details").innerText = `${address} | Phone: ${phone} | Email: ${email}`;
  
  const taxEl = document.getElementById("blueprint-brand-tax");
  if (tax) {
    taxEl.innerText = `GSTIN: ${tax}`;
    taxEl.style.display = "block";
  } else {
    taxEl.style.display = "none";
  }

  // logo
  const logoImg = document.getElementById("blueprint-logo-preview");
  const logoPlaceholder = document.getElementById("blueprint-logo-placeholder");
  if (appState.brandKit && appState.brandKit.logoBase64) {
    logoImg.src = appState.brandKit.logoBase64;
    logoImg.style.display = "block";
    logoPlaceholder.style.display = "none";
  } else {
    logoImg.style.display = "none";
    logoPlaceholder.style.display = "block";
  }

  // color
  document.getElementById("blueprint-brand-name").style.color = color;
  taxEl.style.color = color;
}

function updateBrandKitUI() {
  if (!appState.brandKit) return;
  
  // Fill inputs
  document.getElementById("brand-name").value = appState.brandKit.companyName || "";
  document.getElementById("brand-tagline").value = appState.brandKit.tagline || "";
  document.getElementById("brand-email").value = appState.brandKit.email || "";
  document.getElementById("brand-phone").value = appState.brandKit.phone || "";
  document.getElementById("brand-address").value = appState.brandKit.address || "";
  document.getElementById("brand-tax").value = appState.brandKit.taxNumber || "";
  document.getElementById("brand-color").value = appState.brandKit.primaryColor || "#bb86fc";

  // Update logo
  updateLogoPreview(appState.brandKit.logoBase64);

  // Status badge update in top bar
  const brandBadge = document.getElementById("header-brand-badge");
  const brandText = document.getElementById("header-brand-text");
  
  if (appState.brandKit.companyName) {
    brandBadge.className = "header-status-badge brand-active";
    brandText.innerText = `${appState.brandKit.companyName} Active`;
  } else {
    brandBadge.className = "header-status-badge brand-inactive";
    brandText.innerText = "Generic Branding";
  }
}

async function saveBrandKitProfile() {
  const brandData = {
    companyName: document.getElementById("brand-name").value.trim(),
    tagline: document.getElementById("brand-tagline").value.trim(),
    email: document.getElementById("brand-email").value.trim(),
    phone: document.getElementById("brand-phone").value.trim(),
    address: document.getElementById("brand-address").value.trim(),
    taxNumber: document.getElementById("brand-tax").value.trim(),
    primaryColor: document.getElementById("brand-color").value,
    logoBase64: appState.brandKit ? appState.brandKit.logoBase64 : ""
  };

  if (!brandData.companyName) {
    alert("Company / Personal Name is required to save Brand kit.");
    return;
  }

  await FirebaseMock.db.brandKit.save(brandData);
  appState.brandKit = brandData;
  updateBrandKitUI();
  updateBrandingOverlayOnPreview();
  
  showNotification("Brand Kit Saved", "Your corporate details were saved and applied successfully.", true);
}

function setupSettingsHandlers() {
  // Toggle mask API key
  document.getElementById("gemini-key-toggle").addEventListener("click", () => {
    togglePasswordVisibility("settings-gemini-key", "gemini-key-toggle");
  });

  // Toggle SMTP Password mask
  document.getElementById("smtp-pass-toggle").addEventListener("click", () => {
    togglePasswordVisibility("settings-smtp-pass", "smtp-pass-toggle");
  });

  // Save buttons
  document.getElementById("btn-save-api-settings").addEventListener("click", saveApiSettings);
  document.getElementById("btn-save-profile").addEventListener("click", saveProfileDetails);
  document.getElementById("btn-delete-profile-account").addEventListener("click", deleteUserAccount);
}

function updateApiConfigUI() {
  if (!appState.apiConfig) return;
  document.getElementById("settings-gemini-key").value = appState.apiConfig.apiKey || "";
  document.getElementById("settings-gemini-model").value = appState.apiConfig.model || "gemini-2.5-flash";
  document.getElementById("settings-audio-sound").checked = appState.apiConfig.soundEnabled !== false;

  // Load SMTP fields
  document.getElementById("settings-smtp-user").value = appState.apiConfig.smtpUser || "";
  document.getElementById("settings-smtp-pass").value = appState.apiConfig.smtpPass || "";
  document.getElementById("settings-smtp-host").value = appState.apiConfig.smtpHost || "smtp.gmail.com";
  document.getElementById("settings-smtp-port").value = appState.apiConfig.smtpPort || "587";

  // Load Firebase fields
  document.getElementById("settings-fb-key").value = appState.apiConfig.fbApiKey || "";
  document.getElementById("settings-fb-domain").value = appState.apiConfig.fbAuthDomain || "";
  document.getElementById("settings-fb-project").value = appState.apiConfig.fbProjectId || "";
  document.getElementById("settings-fb-app").value = appState.apiConfig.fbAppId || "";

  // Status badge update in top bar
  const apiBadge = document.getElementById("header-api-badge");
  const apiText = document.getElementById("header-api-text");
  
  if (appState.apiConfig.apiKey) {
    apiBadge.className = "header-status-badge api-active";
    apiText.innerText = "Gemini AI Online";
  } else {
    apiBadge.className = "header-status-badge api-inactive";
    apiText.innerText = "API Offline (Mock Mode)";
  }
}

async function saveApiSettings() {
  const apiKey = document.getElementById("settings-gemini-key").value.trim();
  const model = document.getElementById("settings-gemini-model").value;
  const soundEnabled = document.getElementById("settings-audio-sound").checked;

  const smtpUser = document.getElementById("settings-smtp-user").value.trim();
  const smtpPass = document.getElementById("settings-smtp-pass").value.trim();
  const smtpHost = document.getElementById("settings-smtp-host").value.trim();
  const smtpPort = document.getElementById("settings-smtp-port").value.trim();

  const fbApiKey = document.getElementById("settings-fb-key").value.trim();
  const fbAuthDomain = document.getElementById("settings-fb-domain").value.trim();
  const fbProjectId = document.getElementById("settings-fb-project").value.trim();
  const fbAppId = document.getElementById("settings-fb-app").value.trim();

  const config = {
    apiKey,
    model,
    soundEnabled,
    smtpUser,
    smtpPass,
    smtpHost,
    smtpPort,
    fbApiKey,
    fbAuthDomain,
    fbProjectId,
    fbAppId
  };

  await FirebaseMock.db.apiConfig.save(config);
  appState.apiConfig = config;
  updateApiConfigUI();

  // Reinitialize real Firebase if configs changed
  FirebaseMock.auth.reinitializeRealFirebase();

  showNotification("Settings Saved", "Gemini, SMTP, and Firebase configurations saved successfully.", true);
}

function populateProfileForms() {
  const user = FirebaseMock.auth.currentUser;
  if (!user) return;
  
  document.getElementById("profile-name").value = user.fullName || "";
  document.getElementById("profile-email").value = user.email || "";
  document.getElementById("profile-phone").value = user.phoneNumber || "";
}

async function saveProfileDetails() {
  const fullName = document.getElementById("profile-name").value.trim();
  const email = document.getElementById("profile-email").value.trim();
  const phoneNumber = document.getElementById("profile-phone").value.trim();

  if (!fullName || !email) {
    alert("Name and email are required fields.");
    return;
  }

  try {
    const updated = await FirebaseMock.auth.updateUserProfile({ fullName, email, phoneNumber });
    initUserData(); // reload UI
    showNotification("Profile Updated", "Account contact details saved successfully.");
  } catch(e) {
    alert(e.message);
  }
}

async function deleteUserAccount() {
  const conf = confirm("WARNING: Deleting your account will completely purge all saved document drafts, configurations, and brand kit base64 assets. This cannot be undone. Proceed?");
  if (!conf) return;

  const doubleConf = prompt("Type DELETE in all capital letters to confirm deletion:");
  if (doubleConf !== "DELETE") {
    alert("Incorrect confirmation code. Deletion cancelled.");
    return;
  }

  try {
    await FirebaseMock.auth.deleteAccount();
    alert("Your account was deleted successfully.");
  } catch(e) {
    alert(e.message);
  }
}

// ================= VOICE INPUT (WEB SPEECH RECOGNITION API) =================
function setupVoiceInput() {
  const voiceBtn = document.getElementById("btn-voice-input");
  const voiceIcon = document.getElementById("voice-icon");
  const voiceStatus = document.getElementById("voice-status-lbl");
  const promptArea = document.getElementById("gen-prompt");

  if (!voiceBtn || !promptArea) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    // Hide or disable voice option if speech recognition isn't supported in browser
    voiceBtn.style.opacity = "0.5";
    voiceBtn.title = "Voice dictation not supported in this browser. Use Chrome/Safari.";
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  appState.recognition = recognition;

  recognition.onstart = () => {
    appState.isRecording = true;
    voiceBtn.classList.add("listening");
    voiceIcon.innerText = "mic_double";
    voiceStatus.innerText = "Listening...";
  };

  recognition.onend = () => {
    appState.isRecording = false;
    voiceBtn.classList.remove("listening");
    voiceIcon.innerText = "mic";
    voiceStatus.innerText = "Voice Input";
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    appState.isRecording = false;
    voiceBtn.classList.remove("listening");
    voiceIcon.innerText = "mic";
    voiceStatus.innerText = "Voice Input";
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (promptArea.value.trim()) {
      promptArea.value = promptArea.value + " " + transcript;
    } else {
      promptArea.value = transcript;
    }
    showNotification("Dictation Added", "Speech appended to prompt text.");
  };

  voiceBtn.addEventListener("click", () => {
    if (appState.isRecording) {
      recognition.stop();
    } else {
      recognition.start();
    }
  });
}

// ================= EXPORT HELPER METHODS =================

// client-side HTML-to-PDF rendering using jsPDF & html2canvas
function exportToPDF(title, elementId) {
  const { jsPDF } = window.jspdf;
  const element = document.getElementById(elementId);

  // Show loading
  const loading = document.getElementById("ai-loading-overlay");
  const loadingText = document.getElementById("ai-loading-status-text");
  if (loading) {
    loadingText.innerText = "Assembling A4 paper elements for PDF export...";
    loading.style.display = "flex";
  }

  // Create document layout
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'pt',
    format: 'a4'
  });

  // Calculate scaling width: A4 is 595.28 pt wide, let's keep margins
  const margins = 20;
  const pdfWidth = 595.28 - (margins * 2);

  // Use jsPDF html method
  doc.html(element, {
    x: margins,
    y: margins,
    width: pdfWidth,
    windowWidth: 800, // force browser render size to fit page correctly
    autoPaging: 'text',
    callback: function (pdfDoc) {
      pdfDoc.save(`${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
      if (loading) loading.style.display = "none";
      showNotification("PDF Export Successful", "Branded PDF document downloaded.");
    }
  });
}

// Client-side text parsing to DOCX using docx.js library
function exportToWord(title, htmlContent, brandInfo, useBranding) {
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, WidthType, BorderStyle } = window.docx;
  
  const children = [];

  // 1. Add Brand Header details if branding enabled
  if (useBranding && brandInfo && brandInfo.companyName) {
    children.push(new Paragraph({
      children: [
        new TextRun({ text: brandInfo.companyName, bold: true, size: 28, color: brandInfo.primaryColor.replace('#', '') })
      ],
      alignment: AlignmentType.RIGHT
    }));
    
    if (brandInfo.tagline) {
      children.push(new Paragraph({
        children: [new TextRun({ text: brandInfo.tagline, italics: true, size: 20, color: "555555" })],
        alignment: AlignmentType.RIGHT
      }));
    }
    
    children.push(new Paragraph({
      children: [
        new TextRun({ 
          text: `${brandInfo.address || ''} | Phone: ${brandInfo.phone || ''} | Email: ${brandInfo.email || ''}`, 
          size: 16, 
          color: "888888" 
        })
      ],
      alignment: AlignmentType.RIGHT
    }));

    if (brandInfo.taxNumber) {
      children.push(new Paragraph({
        children: [new TextRun({ text: `GSTIN: ${brandInfo.taxNumber}`, size: 16, bold: true, color: "111111" })],
        alignment: AlignmentType.RIGHT
      }));
    }

    // Add separator border
    children.push(new Paragraph({
      text: "",
      border: { bottom: { color: brandInfo.primaryColor.replace('#', ''), space: 8, style: BorderStyle.SINGLE, size: 12 } }
    }));
  }

  // 2. Parse HTML elements iteratively
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;

  Array.from(tempDiv.children).forEach(el => {
    const text = el.innerText.trim();
    if (!text && el.tagName !== 'TABLE' && el.tagName !== 'HR') return;

    if (el.tagName === 'H1') {
      children.push(new Paragraph({
        children: [new TextRun({ text: text, bold: true, size: 32, color: "1e1b4b" })],
        spacing: { before: 240, after: 120 }
      }));
    } else if (el.tagName === 'H2') {
      children.push(new Paragraph({
        children: [new TextRun({ text: text, bold: true, size: 26, color: "1e1b4b" })],
        spacing: { before: 180, after: 90 }
      }));
    } else if (el.tagName === 'H3') {
      children.push(new Paragraph({
        children: [new TextRun({ text: text, bold: true, size: 22, color: "1e1b4b" })],
        spacing: { before: 140, after: 70 }
      }));
    } else if (el.tagName === 'P') {
      children.push(new Paragraph({
        children: [new TextRun({ text: text, size: 22 })],
        spacing: { after: 120 }
      }));
    } else if (el.tagName === 'UL') {
      Array.from(el.children).forEach(li => {
        children.push(new Paragraph({
          children: [new TextRun({ text: li.innerText.trim(), size: 22 })],
          bullet: { level: 0 },
          spacing: { after: 60 }
        }));
      });
    } else if (el.tagName === 'OL') {
      let count = 1;
      Array.from(el.children).forEach(li => {
        children.push(new Paragraph({
          children: [new TextRun({ text: `${count}. ${li.innerText.trim()}`, size: 22 })],
          spacing: { after: 60 }
        }));
        count++;
      });
    } else if (el.tagName === 'TABLE') {
      const rows = [];
      Array.from(el.querySelectorAll("tr")).forEach(tr => {
        const cells = [];
        Array.from(tr.children).forEach(cell => {
          cells.push(new TableCell({
            children: [
              new Paragraph({ 
                children: [
                  new TextRun({ 
                    text: cell.innerText.trim(), 
                    size: 20, 
                    bold: cell.tagName === 'TH' 
                  })
                ] 
              })
            ],
            shading: cell.tagName === 'TH' ? { fill: "f1f5f9" } : undefined,
            width: { size: 2500, type: WidthType.DXA },
            margins: { top: 120, bottom: 120, left: 120, right: 120 }
          }));
        });
        rows.push(new TableRow({ children: cells }));
      });
      
      children.push(new Table({ 
        rows: rows,
        width: { size: 9000, type: WidthType.DXA }
      }));
      // spacing after table
      children.push(new Paragraph({ text: "", spacing: { after: 120 } }));
    } else if (el.tagName === 'HR') {
      children.push(new Paragraph({
        text: "",
        border: { bottom: { color: "cbd5e1", space: 4, style: BorderStyle.SINGLE, size: 6 } },
        spacing: { before: 100, after: 100 }
      }));
    }
  });

  // 3. Assemble document
  const doc = new Document({
    sections: [{
      properties: {},
      children: children
    }]
  });

  // 4. Blob compile and download
  Packer.toBlob(doc).then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification("Word Export Successful", "Generated DOCX file downloaded.");
  }).catch(e => {
    console.error("Word compilation error:", e);
    alert("Could not compile Word document. Check console.");
  });
}

// ================= DOCUMENT SUMMARY & AUDIO READER FEATURE =================
function setupSummaryReader() {
  const btnSummarize = document.getElementById("btn-summarize-doc");
  const modalSummary = document.getElementById("modal-summary-reader");
  const btnClose = document.getElementById("btn-close-summary-reader");
  const quoteText = document.getElementById("summary-quote-text");
  const btnPlay = document.getElementById("btn-summary-play");
  const btnStop = document.getElementById("btn-summary-stop");
  const btnDictate = document.getElementById("btn-summary-dictate");
  const btnAppend = document.getElementById("btn-summary-append");
  const loadingStatus = document.getElementById("summary-loading-status");
  const playIcon = document.getElementById("summary-play-icon");
  const playText = document.getElementById("summary-play-text");
  const dictateIcon = document.getElementById("summary-dictate-icon");
  const dictateText = document.getElementById("summary-dictate-text");

  if (!btnSummarize || !modalSummary) return;

  let synthUtterance = null;
  let summaryRecognition = null;
  let isDictating = false;

  // Open modal & start AI generation
  btnSummarize.addEventListener("click", async () => {
    // Reset state & UI
    quoteText.innerText = "";
    btnPlay.setAttribute("disabled", "true");
    btnStop.setAttribute("disabled", "true");
    btnAppend.setAttribute("disabled", "true");
    loadingStatus.style.display = "flex";
    modalSummary.style.display = "flex";

    const docText = document.getElementById("document-content-editor").innerText.trim();
    if (!docText) {
      loadingStatus.style.display = "none";
      quoteText.innerText = "The document is currently empty. Please generate some content first.";
      return;
    }

    const apiKey = (appState.apiConfig && appState.apiConfig.apiKey) ? appState.apiConfig.apiKey.trim() : "";
    const modelName = (appState.apiConfig && appState.apiConfig.model) ? appState.apiConfig.model : "gemini-2.5-flash";

    let summary = "";

    if (apiKey) {
      // Live summary API call
      try {
        const prompt = "Provide a concise executive summary quote of the following document. Keep the response limited to a single professional quotation sentence (maximum 2-3 lines) suitable for a busy executive, and return ONLY the quote itself, without introductory or surrounding text: \n\n" + docText;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3 }
          })
        });

        if (response.ok) {
          const resData = await response.json();
          summary = resData.candidates[0].content.parts[0].text.replace(/^["'\s]+|["'\s]+$/g, '').trim();
        } else {
          throw new Error("API call failed");
        }
      } catch (e) {
        console.warn("Gemini summarization failed, falling back to local extractor.", e);
        summary = extractLocalSummary(docText);
      }
    } else {
      // Offline fallback
      await new Promise(resolve => setTimeout(resolve, 1200));
      summary = extractLocalSummary(docText);
    }

    loadingStatus.style.display = "none";
    quoteText.innerText = summary || "Could not generate summary. You can dictate or type one manually.";
    
    // Enable controls
    btnPlay.removeAttribute("disabled");
    btnStop.removeAttribute("disabled");
    btnAppend.removeAttribute("disabled");
  });

  // Close modal and cancel reading
  btnClose.addEventListener("click", () => {
    modalSummary.style.display = "none";
    stopSpeaking();
    stopDictating();
  });

  // Play / Pause Speech Synthesis
  btnPlay.addEventListener("click", () => {
    if (window.speechSynthesis.speaking) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        playIcon.innerText = "pause";
        playText.innerText = "Pause";
      } else {
        window.speechSynthesis.pause();
        playIcon.innerText = "play_arrow";
        playText.innerText = "Resume";
      }
    } else {
      startSpeaking();
    }
  });

  // Stop Speech Synthesis
  btnStop.addEventListener("click", () => {
    stopSpeaking();
  });

  // Dictate Speech-to-Text override
  btnDictate.addEventListener("click", () => {
    if (isDictating) {
      stopDictating();
    } else {
      startDictating();
    }
  });

  // Append Summary Quote to Document Editor
  btnAppend.addEventListener("click", () => {
    const summaryText = quoteText.innerText.trim();
    const editor = document.getElementById("document-content-editor");
    if (!summaryText || !editor) return;

    // Append formatted executive summary block
    const dividerHtml = '<hr class="summary-divider" style="margin: 24px 0; border: none; border-top: 1px dashed var(--outline-variant);">';
    const quoteHtml = `<blockquote class="executive-summary-blockquote" style="border-left: 4px solid var(--primary); padding-left: 16px; margin: 16px 0; font-style: italic; color: var(--on-surface-variant); line-height: 1.6;"><strong>Executive Summary:</strong> "${summaryText}"</blockquote>`;
    
    // Remove old summary if present
    const oldDivider = editor.querySelector(".summary-divider");
    const oldQuote = editor.querySelector(".executive-summary-blockquote");
    if (oldDivider) oldDivider.remove();
    if (oldQuote) oldQuote.remove();

    editor.innerHTML += dividerHtml + quoteHtml;

    // Re-apply visual branding overlays
    updateBrandingOverlayOnPreview();
    
    showNotification("Summary Added", "Executive summary quote appended to the end of the document.");
    modalSummary.style.display = "none";
    stopSpeaking();
    stopDictating();
  });

  function startSpeaking() {
    window.speechSynthesis.cancel(); // Stop anything else

    const textToSpeak = quoteText.innerText.trim();
    if (!textToSpeak) return;

    synthUtterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Find an English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
    if (englishVoice) {
      synthUtterance.voice = englishVoice;
    }

    synthUtterance.onend = () => {
      resetPlayUI();
    };

    synthUtterance.onerror = () => {
      resetPlayUI();
    };

    window.speechSynthesis.speak(synthUtterance);
    playIcon.innerText = "pause";
    playText.innerText = "Pause";
  }

  function stopSpeaking() {
    window.speechSynthesis.cancel();
    resetPlayUI();
  }

  function resetPlayUI() {
    playIcon.innerText = "play_arrow";
    playText.innerText = "Listen";
  }

  function startDictating() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Google Chrome or Safari.");
      return;
    }

    summaryRecognition = new SpeechRecognition();
    summaryRecognition.continuous = false;
    summaryRecognition.interimResults = false;
    summaryRecognition.lang = 'en-US';

    summaryRecognition.onstart = () => {
      isDictating = true;
      dictateIcon.innerText = "mic_double";
      dictateText.innerText = "Listening...";
      dictateIcon.style.color = "red";
    };

    summaryRecognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (quoteText.innerText === "Could not generate summary. You can dictate or type one manually." || quoteText.innerText === "") {
        quoteText.innerText = transcript;
      } else {
        quoteText.innerText += " " + transcript;
      }
    };

    summaryRecognition.onerror = (event) => {
      console.error("Summary recognition error:", event.error);
      stopDictating();
    };

    summaryRecognition.onend = () => {
      stopDictating();
    };

    summaryRecognition.start();
  }

  function stopDictating() {
    if (summaryRecognition) {
      try {
        summaryRecognition.stop();
      } catch(e) {}
    }
    isDictating = false;
    dictateIcon.innerText = "mic";
    dictateText.innerText = "Dictate Quote";
    dictateIcon.style.color = "";
  }

  // Smart local extractor fallback
  function extractLocalSummary(htmlContent) {
    // Strip HTML tags to get pure text
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    const text = tempDiv.innerText || tempDiv.textContent || "";
    
    // Split into sentences
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15);
    
    if (sentences.length === 0) {
      return "A professional document detailing administrative and business objectives.";
    }

    // Try to extract key indicators
    let summaryQuote = "";
    
    // Find sentences with action verbs or nouns
    const businessKeywords = ["invoice", "total", "proposal", "timeline", "scope", "agreement", "objective", "cost", "contract"];
    const bestSentence = sentences.find(s => businessKeywords.some(keyword => s.toLowerCase().includes(keyword))) || sentences[0];

    summaryQuote = bestSentence + ".";
    
    // Format quote cleanly
    if (summaryQuote.length > 150) {
      summaryQuote = summaryQuote.substring(0, 147) + "...";
    }
    
    return summaryQuote;
  }
}
