import { getApps, getApp, FirebaseOptions, FirebaseApp, initializeApp } from 'firebase/app'
import { getFirestore, initializeFirestore } from 'firebase/firestore';

// TODO: Replace the following with your app's Firebase project configuration
/**
 * @see: {@link https://firebase.google.com/docs/web/learn-more#config-object}<br>
 * @see: Use template literal for error like below<br>
 *       Firebase: Error (auth/invalid-api-key).<br>
 * ＠link: {https://stackoverflow.com/questions/72347849/using-the-environment-variable-firebase-invalid-api-key-error-in-console}<br>
 * ＠link: {https://stackoverflow.com/questions/63257107/nextjs-environment-variables-arent-working}<br>
 */
const firebaseConfig: FirebaseOptions = {
  apiKey: `${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
  projectId: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`,
  appId: `${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}`,
  // authDomain: process.env.REACT_APP_FIREBASE_DOMAIN,
  // databaseURL: process.env.REACT_APP_FIREBASE_DATABASE,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  // messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID,
};

const app = initializeApp(firebaseConfig)

export const getFirebaseApp = (): FirebaseApp => {
  return !getApps().length ? app : getApp()
}

export const getDB = () => {
  return initializeFirestore(app, {
    ignoreUndefinedProperties: true
  })
}
