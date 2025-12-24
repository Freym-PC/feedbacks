
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { connectAuthEmulator } from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check"; 

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

// Initialize Firebase
let app: FirebaseApp | undefined = undefined;
let auth: Auth | undefined = undefined;
let db: Firestore | undefined = undefined;

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error(
    "Firebase initialization failed: Missing API Key or Project ID. " +
    "Please ensure NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID " +
    "are correctly set in your .env.local file and that the Next.js development server " +
    "has been restarted after changes to .env.local."
  );
} else {
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
    } catch (e) {
      console.error("Error initializing Firebase app. This can happen if the Firebase config is invalid.", e);
    }
  } else {
    app = getApp();
  }

  if (app) {
    try {
      auth = getAuth(app);
      db = getFirestore(app);

      // Connect to emulators in development mode on the client side
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        if (process.env.NEXT_PUBLIC_USE_EMULATOR === 'true') {
          try {
            // Check if emulator is already connected to avoid errors
            const authSettings = auth.settings;
            if (!authSettings?.emulatorConfig) {
              connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
              console.log("✅ Auth Emulator connected on port 9099");
            }
          } catch (error: any) {
            if (!error.message?.includes('already connected')) {
              console.warn("Auth Emulator connection warning:", error.message);
            }
          }

          try {
            // Check if Firestore emulator is already connected
            if ((db as any)._settings?.host === 'localhost') {
              console.log("ℹ️  Firestore already connected to emulator");
            } else {
              connectFirestoreEmulator(db, 'localhost', 8080);
              console.log("✅ Firestore Emulator connected on port 8080");
            }
          } catch (error: any) {
            if (!error.message?.includes('already called')) {
              console.warn("Firestore Emulator connection warning:", error.message);
            }
          }
        }
      }

      // Initialize App Check only on the client side to avoid SSR errors
      if (typeof window !== 'undefined') {
        if (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
          initializeAppCheck(app, {
            provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY),
            isTokenAutoRefreshEnabled: true, 
          });
          console.log("Firebase App Check initialized with reCAPTCHA v3.");

          if (process.env.NODE_ENV === 'development') {
            (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
            console.log(
                "Firebase App Check: Development mode, attempting to use auto-generated debug token. " +
                "Ensure your development domain (e.g., Cloud Workstation URL) is added to your reCAPTCHA v3 authorized domains in Google Cloud Console. " +
                "If requests are still blocked by App Check with a 403 error, you may need to: " +
                "1. Look for a specific App Check debug token logged by the SDK in the browser console (it might appear as 'Firebase App Check debug token: ...'). " +
                "2. Or inspect a blocked network request's headers for 'X-Firebase-AppCheck-Debug-Token'. " +
                "3. Register this token in Firebase Console > App Check > Your Web App > Manage debug tokens. " +
                "Once registered, requests from this browser/environment should pass App Check."
            );
          }
        } else {
          console.warn(
            "Firebase App Check: NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set. " +
            "App Check will not be initialized. This is normal for initial setup or if App Check is not used, " +
            "but required if you intend to enforce App Check for Firebase services."
          );
        }
      }
    } catch (e) {
      console.error("Error getting Auth, Firestore, or initializing App Check from Firebase app:", e);
    }
  } else {
      console.error("Firebase app could not be initialized or retrieved, so Firebase services cannot be accessed.");
  }
}

export { app, auth, db };
