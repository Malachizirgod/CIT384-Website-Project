// public/assets/js/firebase.js
// Minimal Firebase bootstrap for a static site.
// Exposes window.FirebaseAPI.{saveOrder,saveContact} for your other JS files.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

async function saveReview(review) {
  // review = { productId, rating, title, body, name }
  await ensureAuth();
  return addDoc(collection(db, "reviews"), {
    ...review,
    createdAt: serverTimestamp()
  });
}

async function fetchReviews(productId, limitCount = 10) {
  await ensureAuth();
  const q = query(
    collection(db, "reviews"),
    where("productId", "==", productId),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function saveFeedback(payload) {
  // payload = { email?, rating?, likelihood?, comments? }
  await ensureAuth();
  return addDoc(collection(db, "feedback"), {
    ...payload,
    createdAt: serverTimestamp()
  });
}

// Expose to non-module scripts (main.js, cart.js)
window.FirebaseAPI = { saveOrder, saveContact, saveReview, fetchReviews, saveFeedback };
console.log("[Firebase] ready");
