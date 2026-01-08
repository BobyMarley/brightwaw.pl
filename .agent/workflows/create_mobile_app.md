---
description: Setup Flutter mobile app for brightwaw.pl with Stripe, Polish payment, multilingual support, and Google Calendar integration
---

# Workflow: Create Mobile App (Flutter)

This workflow automates the creation of a cross‑platform Flutter application based on your existing website. It includes Stripe integration, Polish payment systems, multilingual UI, and optional Google Calendar sync.

## Prerequisites
1. **Flutter SDK** installed (see https://flutter.dev/docs/get-started/install). 
2. **Git** installed.
3. **Node.js** (optional, for generating assets).
4. **Google Cloud account** (if you later decide to enable Calendar sync).

## Steps
1. **Create project directory**
   ```bash
   mkdir -p d:/work/2025/bright/www/mobile-app/flutter_project
   cd d:/work/2025/bright/www/mobile-app/flutter_project
   ```
2. **Initialize Flutter project**
   // turbo
   ```bash
   flutter create .
   ```
3. **Add dependencies**
   // turbo
   ```bash
   flutter pub add http provider intl flutter_localizations
   flutter pub add stripe_payment
   flutter pub add googleapis_auth
   flutter pub add firebase_messaging
   ```
4. **Configure iOS & Android platforms**
   - Open `android/app/build.gradle` and set `minSdkVersion 21`.
   - Open `ios/Runner/Info.plist` and add required permissions (camera, internet, etc.).
5. **Create assets folder**
   ```bash
   mkdir -p assets/images
   ```
   Copy your logo and any UI images from the website (`d:/work/2025/bright/www/css/modern-ui.css` or other assets) into this folder.
6. **Add fonts**
   - Download the Google Font used on the site (e.g., *Inter*).
   - Place the `.ttf` files in `assets/fonts/` and reference them in `pubspec.yaml`.
7. **Set up localization**
   - Create `lib/l10n/intl_en.arb`, `intl_ru.arb`, `intl_pl.arb`.
   - Populate with key/value pairs extracted from the website text.
   - Run `flutter gen-l10n`.
8. **Implement API service** (`lib/services/api_service.dart`)
   - Use `http` to communicate with your website backend (you will need to expose REST endpoints later).
9. **Implement Stripe payment** (`lib/services/payment_service.dart`)
   - Initialize Stripe with your publishable key.
   - Add fallback for Polish payment providers (e.g., Przelewy24) – placeholder functions.
10. **Implement optional Google Calendar sync** (`lib/services/calendar_service.dart`)
    - Include OAuth flow using `googleapis_auth`.
    - Provide functions `fetchAvailableSlots()` and `bookSlot()`.
11. **Create UI screens** (`lib/screens/`)
    - `home_screen.dart` – shows product catalog.
    - `order_form.dart` – includes date/time picker (uses `showDatePicker` + `showTimePicker`).
    - `user_cabinet.dart` – displays order history, profile, language switcher.
    - `payment_screen.dart` – Stripe card entry and Polish payment options.
12. **Add glassmorphism theme** (`lib/theme.dart`)
    ```dart
    final ThemeData appTheme = ThemeData(
      brightness: Brightness.light,
      fontFamily: 'Inter',
      colorScheme: ColorScheme.light(
        primary: Color(0xFF4A90E2), // use site primary color
        secondary: Color(0xFF50E3C2), // accent from site
      ),
      scaffoldBackgroundColor: Colors.transparent,
    );
    ```
    Use `BackdropFilter` on cards for glass effect.
13. **Run the app on emulators**
    // turbo
    ```bash
    flutter run
    ```
14. **Build release binaries**
    // turbo
    ```bash
    flutter build apk --release   # Android
    flutter build ios --release   # iOS (requires macOS, run on Mac later)
    ```

## Post‑setup
- Deploy the Android APK to Google Play Console.
- For iOS, archive the app in Xcode and upload to App Store Connect.
- Add your backend endpoints to `api_service.dart`.
- If you later need Google Calendar integration, create OAuth credentials in Google Cloud and fill the client‑id/secret in `calendar_service.dart`.

---

*All steps marked with `// turbo` can be auto‑executed by the agent if you approve the corresponding `run_command` calls.*
