# Takip Asistan 🎯

Premium koyu temalı günlük hedef + odak asistanı. Günde 3 hedef belirle, 25/5 Pomodoro ile odaklan, serini koru, rozetler topla ve haftalık gelişimini tek görselle paylaş.

**Stack:** Expo SDK 57 · React Native 0.86 (New Architecture) · Expo Router · NativeWind 4 · React Native Reusables desenli UI · Reanimated · Victory Native XL (Skia) · MMKV · expo-notifications · react-native-google-mobile-ads · Firebase (Remote Config + Analytics)

## Özellikler

| Özellik | Detay |
|---|---|
| 3 hedef sistemi | Günlük otomatik sıfırlanan, animasyonlu tamamlama halkası |
| Pomodoro 25/5 | Ayarlanabilir süreler; 4. turdan sonra uzun mola |
| Arka plan timer | Duvar saati (timestamp) tabanlı — uygulama kapanlsa bile süre doğru işler |
| Bildirimler | Süre dolunca OS-seviyesinde lokal bildirim (exact alarm) |
| İstatistik | Son 7 gün bar grafiği (odak dk / hedef), özet kartları, 14 günlük aktivite şeridi |
| Streak & rozetler | 12 başarı rozeti, serisi kırılanın otomatik sıfırlama |
| Paylaşım kartı | Haftalık performans PNG kartı — paylaş veya galeriye kaydet |
| Reklamlar | Banner + odak bitişinde interstitial (min 45 dk arayla) |
| Remote Config | `ads_enabled` ve `interstitial_frequency` uzaktan kontrol edilir |
| i18n | Türkçe + İngilizce (ayardan dil seçimi) |

## Geliştirme

```bash
npm install
npx expo start          # dev client ile başlatır (Expo Go DESTEKLEMEZ — native modüller var)
```

### Android

```bash
npx expo run:android    # ilk kurulumda native projeyi derler ve cihaza kurar
```

Gereksinimler: Android Studio (JDK 17+), ANDROID_HOME ayarlı.

> **Not:** `android/gradle.properties` içinde `reactNativeArchitectures=arm64-v8a` olarak ayarlı — gerçek cihaz testi için yeterli ve derleme süresini/disk kullanımını ~4 kat azaltır. Emülatörde test edecekseniz `x86_64` ekleyin. `npx expo prebuild --clean` sonrası bu ayar sıfırlanır; kalıcı çözüm için `expo-build-properties` plugin'i kullanılabilir.

### Telefonda canlı test (dev client)

1. `android/app/build/outputs/apk/debug/app-debug.apk` dosyasını telefona kurun (USB ile `adb install -r` veya dosyayı kopyalayıp "bilinmeyen kaynaklara izin ver" ile).
2. PC'de `npx expo start` çalıştırın.
3. Telefonda **Takip Asistan** uygulamasını açın — aynı Wi-Fi'daysa dev server'ı otomatik bulur (bulamazsa QR okutun veya `npx expo start --tunnel` kullanın).
4. Bu noktadan sonra tüm JS değişiklikleri anında telefona yansır. Native bağımlılık eklerseniz APK'yı yeniden derlemek gerekir.

> Expo Go **kullanılamaz** — uygulama MMKV, AdMob, Firebase, Skia gibi Expo Go'nun paketlemediği native modüller içerir.

### iOS

```bash
npx expo run:ios        # macOS gerektirir
# veya bulut derleme:
npx eas build --profile development --platform ios
```

## Yayına çıkış öncesi yapılacaklar

1. **Firebase:** [Firebase Console](https://console.firebase.google.com)'dan `google-services.json` (Android) ve `GoogleService-Info.plist` (iOS) indirip proje kökündeki **placeholder dosyaların yerine** koyun. Remote Config'te şu anahtarları tanımlayın:
   - `ads_enabled` (boolean, varsayılan `true`)
   - `interstitial_frequency` (number, varsayılan `3` — her N odak oturumunda bir reklam)
2. **AdMob:** `src/lib/ads.ts` içindeki `AD_UNITS` değerlerini gerçek birim ID'lerinizle, `app.config.ts` içindeki test uygulama ID'lerini gerçek AdMob uygulama ID'lerinizle değiştirin.
3. `eas build --platform all --profile production`

## Proje Yapısı

```
src/
├── app/              # Expo Router ekranları (onboarding + 4 sekme)
├── components/       # ui/ (rnr desenli), goals/, focus/, stats/, badges/, ads/
├── store/            # zustand + MMKV persist (settings, goals, timer, stats, streak, badges, ads)
├── lib/              # date, i18n, storage, notifications, ads, remoteConfig, analytics, share...
└── hooks/            # useT (çeviri), useRemainingMs (timer)
```

## Mimari notlar

- **Timer:** `endAt` epoch'u MMKV'ye yazılır; UI kalan süreyi duvar saatinden hesaplar. Bildirim, `expo-notifications` ile OS'a planlanır — süre uygulamadan bağımsız dolunca tetiklenir.
- **Gün değişimi:** 30 saniyede bir + her foreground'da `AppSync` hedefleri sıfırlar, seriyi denetler, rozetleri değerlendirir.
- **Reklam / Expo Go güvenliği:** Native modüller tembel yüklenir; Expo Go'da uygulama çökmez, reklamsız çalışır.
- Native klasörler (`android/`, `ios/`) CNG ile üretilir — elle düzenlemeyin, `app.config.ts` + config plugin'leri kullanın.
