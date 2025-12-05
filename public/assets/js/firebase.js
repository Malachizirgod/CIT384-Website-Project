// public/assets/js/firebase.js
// Minimal Firebase bootstrap for a static site.
// Exposes window.FirebaseAPI.{saveOrder,saveContact} for your other JS files.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 1) Paste your config from the Firebase console here:
const firebaseConfig = {
  apiKey: "AIzaSyCtREM73BOd7bmixAoXMf5uBL1sVnwgUXw",
  authDomain: "vintage-college.firebaseapp.com",
  projectId: "vintage-college",
  // Use the appspot bucket; the console lists this under Storage > Bucket
  storageBucket: "vintage-college.appspot.com",
  messagingSenderId: "123732278128",
  appId: "1:123732278128:web:b4e6fe8df20e270da92db5",
  measurementId: "G-4TWCXJ5G49"
};

// 2) Init
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// 3) Ensure we have a session (Anonymous)
async function ensureAuth() {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          await signInAnonymously(auth);
        }
        resolve();
      } catch (e) { reject(e); }
    });
  });
}

// 4) Public API used by your site
async function saveOrder(order) {
  // order = { items:[{id,name,price,qty}], subtotal, discount, total, coupon? }
  await ensureAuth();
  return addDoc(collection(db, "orders"), {
    ...order,
    createdAt: serverTimestamp()
  });
}

async function saveContact(msg) {
  // msg = { name, email, message }
  await ensureAuth();
  return addDoc(collection(db, "contact"), {
    ...msg,
    createdAt: serverTimestamp()
  });
}

// Expose to non-module scripts (main.js, cart.js)
window.FirebaseAPI = { saveOrder, saveContact };
console.log("[Firebase] ready");
