import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.armlog.app',
  appName: 'ArmLog',
  webDir: 'dist',
  android: {
    backgroundColor: '#0B0F14',
    overrideUserInterfaceStyle: 'DARK',
    handleBackButton: true,
  },
  server: {
    androidScheme: 'https',
  },
};

export default config;
