import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.north.productivity',
  appName: 'North',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
