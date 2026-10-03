import type { ExpoConfig } from 'expo/config';

// Google test reklam birimleri — yayın öncesi gerçek AdMob ID'leriyle değiştirin.
const ADMOB_TEST_APP_IDS = {
  android: 'ca-app-pub-3940256099942544~3347511713',
  ios: 'ca-app-pub-3940256099942544~1458002511',
};

const config: ExpoConfig = {
  name: 'Takip Asistan',
  slug: 'takip-asistan',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'takipasistan',
  userInterfaceStyle: 'dark',

  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.takipasistan.app',
    googleServicesFile: './GoogleService-Info.plist',
    infoPlist: {
      NSPhotoLibraryAddUsageDescription:
        'Haftalık performans kartını galerine kaydedebilmek için fotoğraf erişimi gerekir.',
      NSUserTrackingUsageDescription:
        'Verileriniz, size daha ilgili reklamlar göstermek için kullanılabilir.',
    },
  },

  android: {
    package: 'com.takipasistan.app',
    googleServicesFile: './google-services.json',
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundImage: './assets/images/adaptive-icon-bg.png',
      monochromeImage: './assets/images/adaptive-icon-mono.png',
    },
    predictiveBackGestureEnabled: false,
    // Tam zamanlı alarmlar: A12 → SCHEDULE_EXACT_ALARM, A13+ → USE_EXACT_ALARM
    // (Pomodoro sayacı alarm/timer uygulaması kategorisidir; Play politikasına uygundur)
    permissions: ['SCHEDULE_EXACT_ALARM', 'USE_EXACT_ALARM'],
  },

  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },

  backgroundColor: '#09090B',

  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 140,
        backgroundColor: '#09090B',
      },
    ],
    [
      'expo-notifications',
      {
        color: '#10B981',
        defaultChannel: 'takip-asistan',
      },
    ],
    [
      'expo-media-library',
      {
        savePhotosPermission: 'Haftalık performans kartını galerine kaydetmek için erişim gerekir.',
        photoPermission: false,
      },
    ],
    [
      'react-native-google-mobile-ads',
      {
        androidAppId: ADMOB_TEST_APP_IDS.android,
        iosAppId: ADMOB_TEST_APP_IDS.ios,
        userTrackingUsageMessage:
          'Verileriniz, size daha ilgili reklamlar göstermek için kullanılabilir.',
        delayAppMeasurementInit: true,
      },
    ],
    ['@react-native-firebase/app'],
    'expo-asset',
    'expo-font',
  ],

  experiments: {
    typedRoutes: true,
  },
};

export default config;
