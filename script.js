// ================== رابط Google Apps Script ==================
const scriptURL = 'https://script.google.com/macros/s/AKfycbwG1ePJNx3cHOTbe95CCrTQ18Pd7XHaJIWkPch5aCpQxFSAWZXj9KYh9DVEzTk6gGzZSw/exec'; // استبدل برابطك

// ================== إدارة الوضع الداكن/الفاتح ==================
const themeCheckbox = document.getElementById('themeCheckbox');
const currentTheme = localStorage.getItem('theme') || 'light';

if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (themeCheckbox) themeCheckbox.checked = true;
} else {
    document.documentElement.setAttribute('data-theme', 'light');
    if (themeCheckbox) themeCheckbox.checked = false;
}

if (themeCheckbox) {
    themeCheckbox.addEventListener('change', function(e) {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });
}

// ================== عناصر النماذج ==================
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const verifyForm = document.getElementById('verify-form');
const showRegisterBtn = document.getElementById('show-register');
const showLoginBtn = document.getElementById('show-login');
const backToRegisterBtn = document.getElementById('back-to-register');
const errorMsg = document.getElementById('error-message');
const loginErrorMsg = document.getElementById('login-error-message');
const verifyErrorMsg = document.getElementById('verify-error-message');
const verifyTextInfo = verifyForm?.querySelector('p');

let tempUserName = '';
let tempUserEmail = '';
let tempUserAge = '';
let tempUserCountry = '';
let generatedOTP = '';

function switchForms(formToHide, formToShow) {
    formToHide.classList.remove('form-active');
    formToHide.classList.add('form-hidden');
    formToShow.classList.remove('form-hidden');
    formToShow.classList.add('form-active');
}

if (showRegisterBtn) {
    showRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginErrorMsg.style.display = 'none';
        switchForms(loginForm, registerForm);
    });
}
if (showLoginBtn) {
    showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        errorMsg.style.display = 'none';
        switchForms(registerForm, loginForm);
    });
}
if (backToRegisterBtn) {
    backToRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        verifyErrorMsg.style.display = 'none';
        switchForms(verifyForm, registerForm);
    });
}

// ================== تسجيل الدخول ==================
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        loginErrorMsg.style.display = 'none';
        const loginEmail = document.getElementById('login-email').value.trim();
        const loginPassword = document.getElementById('login-password').value.trim();
        const loginBtn = document.getElementById('login-btn');
        const originalText = loginBtn.innerText;
        loginBtn.innerText = 'جاري التحقق...';
        loginBtn.disabled = true;

        const formData = new FormData();
        formData.append('action', 'login');
        formData.append('email', loginEmail);
        formData.append('password', loginPassword);

        fetch(scriptURL, { method: 'POST', body: formData })
            .then(res => res.text())
            .then(result => {
                loginBtn.innerText = originalText;
                loginBtn.disabled = false;
                if (result.startsWith('Success')) {
                    const parts = result.split('|');
                    const userName = parts[1] || 'مستخدم';
                    const userAge = parts[2] || '?';
                    const userCountry = parts[4] || ''; // الدولة في الجزء الخامس
                    localStorage.setItem('userLoggedIn', 'true');
                    localStorage.setItem('userEmail', loginEmail);
                    localStorage.setItem('userName', userName);
                    localStorage.setItem('userAge', userAge);
                    if (userCountry) localStorage.setItem('userCountry', userCountry);
                    window.location.href = 'profile.html';
                } else if (result === 'Banned') {
                    loginErrorMsg.innerText = 'الحساب محظور.';
                    loginErrorMsg.style.display = 'block';
                } else if (result === 'Suspended') {
                    loginErrorMsg.innerText = 'الحساب معلق مؤقتاً.';
                    loginErrorMsg.style.display = 'block';
                } else if (result === 'Invalid') {
                    loginErrorMsg.innerText = 'بريد إلكتروني أو كلمة مرور غير صحيحة.';
                    loginErrorMsg.style.display = 'block';
                } else {
                    loginErrorMsg.innerText = 'حدث خطأ غير معروف.';
                    loginErrorMsg.style.display = 'block';
                }
            })
            .catch(err => {
                loginBtn.innerText = originalText;
                loginBtn.disabled = false;
                loginErrorMsg.innerText = 'خطأ في الاتصال بالخادم.';
                loginErrorMsg.style.display = 'block';
            });
    });
}

// ================== إنشاء حساب جديد ==================
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        errorMsg.style.display = 'none';
        const regName = document.getElementById('reg-name').value.trim();
        const regAge = document.getElementById('reg-age').value.trim();
        const regCountry = document.getElementById('reg-country').value.trim();
        const regEmail = document.getElementById('reg-email').value.trim();
        const regPassword = document.getElementById('reg-password').value.trim();
        const regConfirmPassword = document.getElementById('reg-confirm-password').value.trim();

        if (!regName || !regAge || !regCountry || !regEmail || !regPassword) {
            errorMsg.innerText = 'جميع الحقول مطلوبة.';
            errorMsg.style.display = 'block';
            return;
        }
        if (regPassword !== regConfirmPassword) {
            errorMsg.innerText = 'كلمتا المرور غير متطابقتين.';
            errorMsg.style.display = 'block';
            return;
        }
        if (parseInt(regAge) > 60) {
            errorMsg.innerText = 'العمر يجب ألا يتجاوز 60 عاماً.';
            errorMsg.style.display = 'block';
            return;
        }
        if (regPassword.length < 8) {
            errorMsg.innerText = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.';
            errorMsg.style.display = 'block';
            return;
        }

        generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
        tempUserName = regName;
        tempUserEmail = regEmail;
        tempUserAge = regAge;
        tempUserCountry = regCountry;

        const formData = new FormData();
        formData.append('action', 'register');
        formData.append('name', regName);
        formData.append('age', regAge);
        formData.append('email', regEmail);
        formData.append('password', regPassword);
        formData.append('otp', generatedOTP);
        formData.append('country', regCountry);

        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = 'جاري إرسال الرمز...';
        submitBtn.disabled = true;

        fetch(scriptURL, { method: 'POST', body: formData })
            .then(res => res.text())
            .then(result => {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
                if (result === 'Success') {
                    if (verifyTextInfo) verifyTextInfo.innerText = `تم إرسال رمز التحقق إلى: ${regEmail}`;
                    switchForms(registerForm, verifyForm);
                } else if (result === 'EmailExists') {
                    errorMsg.innerText = 'البريد الإلكتروني مسجل مسبقاً.';
                    errorMsg.style.display = 'block';
                } else {
                    errorMsg.innerText = 'حدث خطأ أثناء التسجيل. حاول مرة أخرى.';
                    errorMsg.style.display = 'block';
                }
            })
            .catch(err => {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
                errorMsg.innerText = 'خطأ في الاتصال بالسيرفر.';
                errorMsg.style.display = 'block';
            });
    });
}

// ================== التحقق من رمز OTP ==================
if (verifyForm) {
    verifyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        verifyErrorMsg.style.display = 'none';
        const verifyCode = document.getElementById('verify-code').value.trim();
        if (verifyCode === generatedOTP) {
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('userName', tempUserName);
            localStorage.setItem('userEmail', tempUserEmail);
            localStorage.setItem('userAge', tempUserAge);
            localStorage.setItem('userCountry', tempUserCountry);
            alert('تم تفعيل حسابك بنجاح!');
            window.location.href = 'profile.html';
        } else {
            verifyErrorMsg.innerText = 'رمز التحقق غير صحيح.';
            verifyErrorMsg.style.display = 'block';
        }
    });
}
