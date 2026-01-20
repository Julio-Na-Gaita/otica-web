import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDrZkAJXfZq82j-f08HSnLLvSzswBGAYHQ",
  authDomain: "oticamovel-48618.firebaseapp.com",
  projectId: "oticamovel-48618",
  storageBucket: "oticamovel-48618.firebasestorage.app",
  messagingSenderId: "1066818129458",
  appId: "1:1066818129458:web:1fe0413e507e812ba3b62b"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };