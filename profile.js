// ==========================================
// 1. رابط التطبيق (Google Apps Script)
// ==========================================
const scriptURL = 'https://script.google.com/macros/s/AKfycbwG1ePJNx3cHOTbe95CCrTQ18Pd7XHaJIWkPch5aCpQxFSAWZXj9KYh9DVEzTk6gGzZSw/exec'; // استبدل برابطك

// ==========================================
// 2. بيانات المستخدم من localStorage
// ==========================================
const isLoggedIn = localStorage.getItem('userLoggedIn');
const userEmail = localStorage.getItem('userEmail');
const userName = localStorage.getItem('userName') || 'يا صديقي';
const userAge = localStorage.getItem('userAge') || '?';
const userCountry = localStorage.getItem('userCountry') || '';

let serverMessage = "";

// ==========================================
// 3. التحقق من تسجيل الدخول
// ==========================================
if (isLoggedIn !== 'true' || !userEmail) {
    window.location.href = 'index.html';
} else {
    function checkBanStatus() {
        const formData = new FormData();
        formData.append('action', 'check_status');
        formData.append('email', userEmail);

        fetch(scriptURL, { method: 'POST', body: formData })
            .then(response => response.text())
            .then(result => {
                if (result === 'Banned') {
                    alert('⚠️ لقد تم حظر حسابك للتو من قبل الإدارة. سيتم تسجيل خروجك فوراً.');
                    localStorage.clear();
                    window.location.href = 'index.html';
                } else if (result === 'Suspended') {
                    alert('⏳ تم تعليق حسابك مؤقتاً لمدة 5 دقائق. سيتم تسجيل خروجك الآن.');
                    localStorage.clear();
                    window.location.href = 'index.html';
                } else if (result === 'NotFound') {
                    alert('⚠️ تم حذف حسابك من النظام. سيتم تسجيل خروجك.');
                    localStorage.clear();
                    window.location.href = 'index.html';
                } else if (result.startsWith('Success')) {
                    const parts = result.split('|');
                    const messageFromServer = parts[3] ? parts[3].trim() : "";
                    serverMessage = messageFromServer;
                    displayTickerMessage(serverMessage);
                }
            })
            .catch(error => {
                console.log('خطأ في الاتصال بالخادم، سيتم إعادة المحاولة لاحقاً...', error);
            });
    }

    checkBanStatus();
    setInterval(checkBanStatus, 10000);
}

// ==========================================
// 4. دالة تسجيل الخروج
// ==========================================
function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

// ==========================================
// 5. دالة عرض الرسالة في الشريط المتحرك
// ==========================================
function displayTickerMessage(message) {
    const tickerBox = document.getElementById('ticker-box');
    const tickerMessage = document.getElementById('ticker-message');
    if (!tickerBox || !tickerMessage) return;
    if (message && message !== "") {
        tickerMessage.innerText = message;
        tickerBox.style.display = 'block';
    } else {
        tickerBox.style.display = 'none';
        tickerMessage.innerText = "";
    }
}

// ==========================================
// 6. كود التطبيق (الدردشة، الفيديو، PeerJS)
// ==========================================
const user = {
    name: userName,
    age: userAge,
    email: userEmail,
    country: userCountry
};

const displayNameEl = document.getElementById("displayName");
const displayAgeEl = document.getElementById("displayAge");
if (displayNameEl) displayNameEl.innerText = user.name;
if (displayAgeEl) displayAgeEl.innerText = user.age;

// ---------- Firebase ----------
const firebaseConfig = {
    apiKey: "AIzaSyAihDkvyBa8XaDJRNvuPHo2n-_sY3KsR-k",
    authDomain: "testy-87676.firebaseapp.com",
    databaseURL: "https://testy-87676-default-rtdb.firebaseio.com",
    projectId: "testy-87676",
    storageBucket: "testy-87676.firebasestorage.app",
    messagingSenderId: "281875165600",
    appId: "1:281875165600:web:41263c687d86e8d7e074c5"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const onlineRef = db.ref("online-users");

// ---------- إعدادات PeerJS مع خوادم TURN من ExpressTURN (مع secure) ----------
const peer = new Peer({
    secure: true,   // استخدام HTTPS
    config: {
        'iceServers': [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
            { urls: 'stun:stun.stunprotocol.org:3478' },
            // خادم TURN من ExpressTURN
            {
                urls: 'turn:free.expressturn.com:3478',
                username: '000000002089553375',
                credential: 'JbH5oi23aNVXfIro2WjTMf9t8m8'
            },
            {
                urls: 'turn:free.expressturn.com:443?transport=tcp',
                username: '000000002089553375',
                credential: 'JbH5oi23aNVXfIro2WjTMf9t8m8'
            }
        ]
    }
});

// ---------- عناصر الصفحة ----------
const remoteVideo = document.getElementById("remote");
const localVideo = document.getElementById("local");
const myIdSpan = document.getElementById("myId");
const onlineListDiv = document.getElementById("onlineList");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const messagesDiv = document.getElementById("messages");
const muteBtn = document.getElementById("muteBtn");
const flipBtn = document.getElementById("flip");
const resolutionSelect = document.getElementById("resolution");
const endCallBtn = document.getElementById("endCallBtn");
const logoutBtn = document.getElementById("logout");
const logoutDialog = document.getElementById("logoutDialog");
const confirmLogoutBtn = document.getElementById("confirmLogout");
const cancelLogoutBtn = document.getElementById("cancelLogout");
const suspendedDialog = document.getElementById("suspendedDialog");
const suspendedOkBtn = document.getElementById("suspendedOkBtn");
const emojiBtn = document.getElementById("emojiBtn");
const emojiPicker = document.getElementById("emojiPicker");
const emojis = document.querySelectorAll(".emoji");

// ---------- نظام تبديل الوضع ----------
const themeToggle = document.getElementById("themeToggle");
let currentTheme = localStorage.getItem("theme") || "dark";
function setTheme(theme) {
    if (theme === "light") {
        document.body.classList.add("light-mode");
        if (themeToggle) themeToggle.innerText = "☀️";
    } else {
        document.body.classList.remove("light-mode");
        if (themeToggle) themeToggle.innerText = "🌙";
    }
    localStorage.setItem("theme", theme);
}
if (themeToggle) {
    themeToggle.addEventListener("click", function() {
        const newTheme = document.body.classList.contains("light-mode") ? "dark" : "light";
        setTheme(newTheme);
    });
}
setTheme(currentTheme);

// ---------- متغيرات عامة ----------
let localStream = null;
let currentCall = null;
let currentConnection = null;
let currentCallPeerId = null;
let useFrontCamera = true;
let isMuted = false;
let myPeerId = null;
let heartbeatInterval = null;

let currentResolution = {
    width: { ideal: 854 },
    height: { ideal: 480 }
};

if (endCallBtn) endCallBtn.classList.add("hidden");

let isCameraInitializing = false;

function getResolutionConstraints(resValue) {
    switch (resValue) {
        case "144": return { width: { ideal: 256 }, height: { ideal: 144 } };
        case "240": return { width: { ideal: 426 }, height: { ideal: 240 } };
        case "360": return { width: { ideal: 640 }, height: { ideal: 360 } };
        case "480": return { width: { ideal: 854 }, height: { ideal: 480 } };
        case "720": return { width: { ideal: 1280 }, height: { ideal: 720 } };
        case "1080": return { width: { ideal: 1920 }, height: { ideal: 1080 } };
        default: return { width: { ideal: 854 }, height: { ideal: 480 } };
    }
}

async function initCamera() {
    if (isCameraInitializing) {
        console.log("⚠️ جاري تهيئة الكاميرا بالفعل، انتظر...");
        return;
    }
    isCameraInitializing = true;
    try {
        if (localStream) {
            console.log("🛑 إيقاف التيار القديم...");
            localStream.getTracks().forEach(track => track.stop());
            localStream = null;
            if (localVideo) localVideo.srcObject = null;
        }
        await new Promise(resolve => setTimeout(resolve, 200));

        const constraints = {
            video: {
                facingMode: useFrontCamera ? "user" : "environment",
                width: currentResolution.width,
                height: currentResolution.height
            },
            audio: true
        };
        console.log("📷 طلب الكاميرا...");
        localStream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log("✅ تم الحصول على التيار");

        if (localVideo) {
            localVideo.srcObject = localStream;
            localVideo.muted = true;
            localVideo.style.transform = useFrontCamera ? "scaleX(-1)" : "scaleX(1)";
            localVideo.play().catch(e => console.warn("خطأ في تشغيل الفيديو المحلي:", e));
        }

        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) audioTrack.enabled = !isMuted;

        console.log("✅ الكاميرا تعمل بالدقة:", resolutionSelect?.value);
        return localStream;
    } catch (err) {
        console.error("❌ خطأ في الكاميرا:", err.name, err.message);
        alert("خطأ في تشغيل الكاميرا: " + (err.message || err.name) + "\nتأكد من منح الإذن للكاميرا.");
        throw err;
    } finally {
        isCameraInitializing = false;
    }
}

async function updateVideoTrackInCall() {
    if (currentCall && currentCall.peerConnection && localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (!videoTrack) return;
        const senders = currentCall.peerConnection.getSenders();
        const videoSender = senders.find(s => s.track && s.track.kind === "video");
        if (videoSender) {
            try {
                await videoSender.replaceTrack(videoTrack);
                console.log("✅ تم تحديث مسار الفيديو");
            } catch (err) { console.error("❌ فشل تحديث مسار الفيديو:", err); }
        }
    }
}

async function updateAudioTrackInCall() {
    if (currentCall && currentCall.peerConnection && localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        if (!audioTrack) return;
        const senders = currentCall.peerConnection.getSenders();
        const audioSender = senders.find(s => s.track && s.track.kind === "audio");
        if (audioSender) {
            try {
                await audioSender.replaceTrack(audioTrack);
                console.log("✅ تم تحديث مسار الصوت");
            } catch (err) { console.error("❌ فشل تحديث مسار الصوت:", err); }
        }
    }
}

if (resolutionSelect) {
    resolutionSelect.addEventListener("change", async function(e) {
        currentResolution = getResolutionConstraints(e.target.value);
        try {
            await initCamera();
            await updateVideoTrackInCall();
            await updateAudioTrackInCall();
        } catch (err) { console.error("فشل تغيير الدقة:", err); }
    });
}

if (flipBtn) {
    flipBtn.addEventListener("click", async function() {
        useFrontCamera = !useFrontCamera;
        try {
            await initCamera();
            await updateVideoTrackInCall();
            await updateAudioTrackInCall();
        } catch (err) { console.error("فشل قلب الكاميرا:", err); }
    });
}

if (muteBtn) {
    muteBtn.addEventListener("click", function() {
        if (!localStream) return;
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
            isMuted = !isMuted;
            audioTrack.enabled = !isMuted;
            muteBtn.innerText = isMuted ? "🔇" : "🔊";
            muteBtn.classList.toggle("muted", isMuted);
            if (currentCall && currentCall.peerConnection) {
                const senders = currentCall.peerConnection.getSenders();
                const audioSender = senders.find(s => s.track && s.track.kind === "audio");
                if (audioSender) {
                    audioSender.replaceTrack(audioTrack).catch(e => console.error("فشل تحديث مسار الصوت:", e));
                }
            }
        }
    });
}

// ---------- أحداث PeerJS ----------
peer.on("open", function(id) {
    myPeerId = id;
    if (myIdSpan) myIdSpan.innerText = id;
    console.log("✅ معرفك:", id);

    const userStatusRef = onlineRef.child(myPeerId);
    userStatusRef.set({
        name: user.name,
        age: user.age,
        country: user.country,
        lastSeen: firebase.database.ServerValue.TIMESTAMP
    });
    console.log("📤 رفع بيانات المستخدم إلى Firebase:", { name: user.name, age: user.age, country: user.country });

    userStatusRef.onDisconnect().remove();

    heartbeatInterval = setInterval(function() {
        userStatusRef.update({ lastSeen: firebase.database.ServerValue.TIMESTAMP });
    }, 10000);
});

peer.on("error", function(err) {
    console.error("❌ خطأ PeerJS:", err);
    alert("خطأ في الاتصال بخادم PeerJS: " + err.type + "\nقد تحتاج إلى تحديث الصفحة.");
});

peer.on("call", function(call) {
    console.log("📞 مكالمة واردة من:", call.peer);
    if (!localStream) {
        alert("الكاميرا لم تبدأ بعد");
        return;
    }
    if (currentCall) {
        currentCall.close();
        if (currentConnection) currentConnection.close();
    }
    call.answer(localStream);
    call.on("stream", function(remoteStream) {
        console.log("✅ تم استقبال بث الفيديو");
        if (remoteVideo) remoteVideo.srcObject = remoteStream;
    });
    call.on("close", function() {
        console.log("🔚 انتهت المكالمة");
        if (remoteVideo) remoteVideo.srcObject = null;
        if (endCallBtn) endCallBtn.classList.add("hidden");
        currentCall = null;
        currentCallPeerId = null;
    });
    currentCall = call;
    currentCallPeerId = call.peer;
    if (endCallBtn) endCallBtn.classList.remove("hidden");

    const conn = peer.connect(call.peer);
    conn.on("open", function() {
        console.log("💬 اتصال دردشة مفتوح مع:", call.peer);
        currentConnection = conn;
    });
    conn.on("data", function(data) {
        displayMessage(data, "other");
    });
});

peer.on("connection", function(conn) {
    console.log("💬 اتصال دردشة واردة من:", conn.peer);
    conn.on("data", function(data) {
        displayMessage(data, "other");
    });
    currentConnection = conn;
});

// ---------- تعبئة قائمة البلدان ----------
function populateCountryFilter() {
    const filterSelect = document.getElementById('countryFilter');
    if (!filterSelect) return;
    onlineRef.once('value', (snapshot) => {
        const users = snapshot.val();
        const countries = new Set();
        if (users) {
            Object.values(users).forEach(u => {
                if (u.country && u.country.trim() !== '') {
                    countries.add(u.country);
                }
            });
        }
        let options = '<option value="all">جميع البلدان</option>';
        Array.from(countries).sort().forEach(c => {
            options += `<option value="${c}">${c}</option>`;
        });
        filterSelect.innerHTML = options;
        if (userCountry && countries.has(userCountry)) {
            filterSelect.value = userCountry;
        }
    });
}

// ---------- استماع لتغييرات المتصلين (مع حساب العدد وتحسينات) ----------
onlineRef.on("value", function(snapshot) {
    if (!onlineListDiv) return;
    const users = snapshot.val();
    onlineListDiv.innerHTML = "";
    
    let sameCountryCount = 0;
    let totalOnline = 0;
    const now = Date.now();
    const selectedCountry = document.getElementById('countryFilter')?.value || 'all';
    const currentUserCountry = (userCountry && userCountry.trim() !== "") ? userCountry : null;

    console.log("🔍 استلام بيانات المتصلين من Firebase:", users);
    console.log("👤 بلد المستخدم الحالي:", currentUserCountry);

    if (!users) {
        onlineListDiv.innerHTML = "<span class='online-list-placeholder'>لا يوجد متصلون</span>";
    } else {
        let count = 0;
        for (const key in users) {
            if (key === myPeerId) continue;
            const u = users[key];
            const isOnline = u.lastSeen && (now - u.lastSeen < 30000);
            if (!isOnline) continue;
            
            totalOnline++;
            
            if (currentUserCountry && u.country && u.country.trim() === currentUserCountry) {
                sameCountryCount++;
                console.log(`✅ مستخدم من نفس البلد: ${u.name} (${u.country})`);
            }
            
            if (selectedCountry !== 'all' && u.country !== selectedCountry) continue;
            count++;
            const btn = document.createElement("button");
            btn.className = "user-btn";
            if (key === currentCallPeerId) btn.classList.add("active");
            btn.textContent = u.name + " (" + (u.age || "?") + ")";
            btn.onclick = (function(pid) {
                return function() { toggleCall(pid); };
            })(key);
            onlineListDiv.appendChild(btn);
        }
        if (count === 0) {
            onlineListDiv.innerHTML = "<span class='online-list-placeholder'>لا يوجد متصلون آخرون</span>";
        }
    }
    
    const onlineCountSpan = document.getElementById('onlineCount');
    if (onlineCountSpan) {
        if (currentUserCountry) {
            onlineCountSpan.innerText = `(${sameCountryCount})`;
            console.log(`📊 عدد المتصلين في بلد "${currentUserCountry}": ${sameCountryCount}`);
        } else {
            onlineCountSpan.innerText = `(${totalOnline})`;
            console.warn("⚠️ المستخدم ليس له بلد مخزن. يتم عرض إجمالي المتصلين.");
        }
    }
});

// ---------- مستمع تغيير الفلتر ----------
const filterSelect = document.getElementById('countryFilter');
if (filterSelect) {
    filterSelect.addEventListener('change', () => {
        onlineRef.once('value'); // refresh
    });
}

// ---------- دالة الاتصال وإنهاء المكالمة مع معالجة أفضل للأخطاء ----------
function toggleCall(peerId) {
    if (!localStream) {
        alert("الكاميرا لم تبدأ بعد");
        return;
    }
    if (currentCall && currentCallPeerId === peerId) {
        console.log("🔚 إنهاء المكالمة مع:", peerId);
        currentCall.close();
        if (currentConnection) currentConnection.close();
        currentCall = null;
        currentConnection = null;
        currentCallPeerId = null;
        if (remoteVideo) remoteVideo.srcObject = null;
        if (endCallBtn) endCallBtn.classList.add("hidden");
        updateOnlineList();
    } else {
        console.log("📞 بدء مكالمة مع:", peerId);
        if (currentCall) {
            currentCall.close();
            if (currentConnection) currentConnection.close();
        }
        currentCall = peer.call(peerId, localStream);
        currentCallPeerId = peerId;
        currentCall.on("stream", function(remoteStream) {
            console.log("✅ تم استقبال بث الفيديو من:", peerId);
            if (remoteVideo) remoteVideo.srcObject = remoteStream;
        });
        currentCall.on("close", function() {
            console.log("🔚 انتهت المكالمة مع:", peerId);
            if (remoteVideo) remoteVideo.srcObject = null;
            currentCall = null;
            currentConnection = null;
            currentCallPeerId = null;
            if (endCallBtn) endCallBtn.classList.add("hidden");
        });
        currentCall.on("error", function(err) {
            console.error("❌ خطأ في المكالمة:", err);
            if (err.type === 'peer-unavailable') {
                alert(`الطرف الآخر (${peerId}) غير متاح. تأكد من اتصاله بالإنترنت وأن معرفه صحيح.\nإذا استمرت المشكلة، حاول تحديث الصفحة.`);
            } else {
                alert('فشل الاتصال: ' + (err.message || err.type));
            }
            currentCall = null;
            currentCallPeerId = null;
        });
        currentConnection = peer.connect(peerId);
        currentConnection.on("open", function() {
            console.log("💬 اتصال دردشة مفتوح مع:", peerId);
        });
        currentConnection.on("data", function(data) {
            displayMessage(data, "other");
        });
        if (endCallBtn) endCallBtn.classList.remove("hidden");
    }
}

function updateOnlineList() {
    onlineRef.once("value");
}

// ---------- الدردشة ----------
function displayMessage(text, sender) {
    if (!messagesDiv) return;
    const msg = document.createElement("div");
    msg.className = "message" + (sender === "me" ? " me" : "");
    msg.innerText = (sender === "me" ? "أنا: " : "صديق: ") + text;
    messagesDiv.appendChild(msg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

if (sendBtn) {
    sendBtn.addEventListener("click", function() {
        const text = chatInput?.value.trim();
        if (!text) return;
        displayMessage(text, "me");
        if (currentConnection && currentConnection.open) {
            currentConnection.send(text);
            console.log("📤 تم إرسال الرسالة:", text);
        } else {
            alert("لا يوجد اتصال دردشة نشط");
        }
        if (chatInput) chatInput.value = "";
    });
}
if (chatInput) {
    chatInput.addEventListener("keypress", function(e) {
        if (e.key === "Enter") sendBtn?.click();
    });
}
if (endCallBtn) {
    endCallBtn.addEventListener("click", function() {
        if (currentCall) {
            currentCall.close();
            if (currentConnection) currentConnection.close();
            currentCall = null;
            currentConnection = null;
            currentCallPeerId = null;
            if (remoteVideo) remoteVideo.srcObject = null;
            endCallBtn.classList.add("hidden");
        }
    });
}
if (emojiBtn) {
    emojiBtn.addEventListener("click", function() {
        if (emojiPicker) emojiPicker.classList.toggle("hidden");
    });
}
emojis.forEach(function(emo) {
    emo.addEventListener("click", function() {
        if (chatInput) chatInput.value += emo.innerText;
        if (emojiPicker) emojiPicker.classList.add("hidden");
        chatInput?.focus();
    });
});
if (logoutBtn) {
    logoutBtn.addEventListener("click", function() {
        if (logoutDialog) logoutDialog.classList.remove("hidden");
    });
}
if (confirmLogoutBtn) {
    confirmLogoutBtn.addEventListener("click", function() {
        if (myPeerId) onlineRef.child(myPeerId).remove();
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        if (localStream) localStream.getTracks().forEach(t => t.stop());
        if (peer) peer.destroy();
        logout();
    });
}
if (cancelLogoutBtn) {
    cancelLogoutBtn.addEventListener("click", function() {
        if (logoutDialog) logoutDialog.classList.add("hidden");
    });
}
if (logoutDialog) {
    logoutDialog.addEventListener("click", function(e) {
        if (e.target === logoutDialog) logoutDialog.classList.add("hidden");
    });
}
if (suspendedDialog) {
    suspendedDialog.addEventListener("click", function(e) {
        if (e.target === suspendedDialog) suspendedDialog.classList.add("hidden");
    });
}
if (suspendedOkBtn) {
    suspendedOkBtn.addEventListener("click", function() {
        suspendedDialog?.classList.add("hidden");
        logout();
    });
}

// ---------- بدء تشغيل الكاميرا ----------
initCamera().then(() => {
    console.log("✅ الكاميرا جاهزة، الفيديو المحلي يعمل.");
}).catch(err => {
    console.error("❌ فشل تشغيل الكاميرا:", err);
});

// ---------- تعبئة قائمة البلدان بعد تحميل الصفحة ----------
setTimeout(() => {
    populateCountryFilter();
}, 1000);