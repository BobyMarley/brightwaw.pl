# Firebase Integration Guide for Expo Application

## 1. Firebase Console Setup
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create a new project (or use existing).
3. **Important**: You do NOT need separate databases for Web, iOS, and Android. You create **ONE Project** and add multiple **Apps** to it.
   - The Database (Firestore) and Authentication users are shared across all apps in the project.

## 2. Register Apps
In your Firebase Project settings ("Project Overview" -> Gear icon -> "Project settings"):
1. **Web**: Click the `</>` icon. Register app with nickname "BrightApp Web". Copy the `firebaseConfig`.
2. **Android**: Click the Android icon. 
   - Package name: `com.brighthouse.app` (or whatever is in your `app.json` under `android.package`).
   - Download `google-services.json` and place it in the root of your Expo project.
3. **iOS**: Click the iOS icon.
   - Bundle ID: `com.brighthouse.app` (must match `ios.bundleIdentifier`).
   - Download `GoogleService-Info.plist` and place it in the root.

## 3. Configure App in `src/config/firebase.js`
Since we are using Expo, the easiest way to start is using the **Web SDK** which works on all platforms (JS based).
Create a file `src/config/firebase.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

To support Native Login (Google Sign-In) later, you will need the native config files (`google-services.json`), but for email/password auth, the JS SDK is enough to start.

## 4. Update AuthContext.js
Replace the mock logic with real Firebase calls:

```javascript
import { auth, db } from '../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

const login = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};
```

## 5. Build Configuration (app.json)
Ensure your `app.json` references the native config files for production builds:

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json",
      "package": "com.brighthouse.app"
    },
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist",
      "bundleIdentifier": "com.brighthouse.app"
    }
  }
}
```

## Summary
- **Database**: Shared (Firestore).
- **Users**: Shared (Firebase Auth).
- **Config**: Unique keys for web, but combined for logic.
