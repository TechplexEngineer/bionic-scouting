import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.team4909.BionicScout',
  appName: 'sveltekit-cap',
  webDir: 'build',
  bundledWebRuntime: false
};

// for development Hot Module Reload
if (process.env.HOST.length > 2) {
  config.server = {
    url: `http://${process.env.HOST}:3000`,
    cleartext: true
  }
}

console.warn(`Using HMR server at ${config.server.url}`);

export default config;
