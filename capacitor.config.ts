import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	// The package name for Android and the bundle identifier for iOS.
	appId: 'org.team4909.BionicScout',

	// Your app's name.
	appName: 'The Green Alliance',

	// Sets the directory of your built web assets. This is the directory that will be
	// used to run your app in a native environment.
	webDir: 'build',

	// Whether to use capacitor.js as a bundle that is copied to your web code,
	// or require it to be bundled/imported through a typical
	// typescript/babel/webpack/rollup workflow.
	//
	// The starter project sets this to true, but if you're using Ionic or another framework,
	// you'll probably want this to be false (default is false)
	bundledWebRuntime: false,

	// A Boolean value that determines whether to hide native logs for iOS and Android. The preference is ignored if it's also declared inside ios or android
	// Default is false
	// hideLogs: true
	loggingBehavior: 'none'
};

// for development Hot Module Reload
if (process.env.HOST && process.env.HOST.length > 2) {
	config.server = {
		url: `http://${process.env.HOST}:3000`,
		cleartext: true
	};
	console.warn(`Using HMR server at ${config.server.url}`);
}

export default config;
