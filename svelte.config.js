import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://github.com/sveltejs/svelte-preprocess
    // for more information about preprocessors
    preprocess: preprocess(),

    kit: {
        adapter: adapter(),

        // hydrate the <div id="svelte"> element in src/app.html
        target: '#svelte',

        vite: {
            define: {
                'process.env': process.env,
            },
            server: {
                fs: {
                    allow: ['capacitor-plugin-bluteooth-serial']
                }
            },
            resolve: {
                // alias: {
                //     events: 'events'
                // }
            },
            optimizeDeps: {
                // allowNodeBuiltins: ['pouchdb-browser', 'pouchdb-utils', 'base64id', 'mime-types']
            }
        },
        ssr: false //disable server side rendering
    }
};

export default config;
