 // Import the functions you need from the SDKs you need
 import { initializeApp } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-app.js";
 import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-analytics.js";
 // TODO: Add SDKs for Firebase products that you want to use
 // https://firebase.google.com/docs/web/setup#available-libraries

 // Your web app's Firebase configuration
 // For Firebase JS SDK v7.20.0 and later, measurementId is optional
 const firebaseConfig = {
   apiKey: "AIzaSyB4iLqQhetQzvpCJIhczEZrRlF3daOsXJI",
   authDomain: "ip-asg3-y2s2.firebaseapp.com",
   databaseURL: "https://ip-asg3-y2s2-default-rtdb.firebaseio.com",
   projectId: "ip-asg3-y2s2",
   storageBucket: "ip-asg3-y2s2.appspot.com",
   messagingSenderId: "542637701145",
   appId: "1:542637701145:web:d4c9fafb84cb99085b9288",
   measurementId: "G-100XHEQFW6"
 };

 // Initialize Firebase
 const app = initializeApp(firebaseConfig);
 const analytics = getAnalytics(app);
