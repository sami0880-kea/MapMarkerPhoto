// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAdC5ka9bW24tjgdv0rEfRsZevxt7XoSTw",
  authDomain: "mapmarkerphoto-99f44.firebaseapp.com",
  projectId: "mapmarkerphoto-99f44",
  storageBucket: "mapmarkerphoto-99f44.appspot.com",
  messagingSenderId: "132619921767",
  appId: "1:132619921767:web:b38ad48fb513b37b85a7c2"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getFirestore(app)
const storage = getStorage(app)
export { app, database, storage} 