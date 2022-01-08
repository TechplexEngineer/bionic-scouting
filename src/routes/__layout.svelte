<script context="module">
    // Disable server side rendering for this page
    export const ssr = false;

    import "bootstrap/dist/css/bootstrap.min.css";
    import "../app.css";
    import {App} from "@capacitor/app";

    // not sure how else to do this, so we only get do init work once
    import {init} from "$lib/init";

    init();

    async function getVersion() {
        try {
            const info = await App.getInfo();
            return info.version;
        } catch (e) {
            if (e.message === "Not implemented on web.") {
                return "WEB";
            }
            console.log(e);
            return "-1";
        }
    }
</script>

<script lang="ts">
    import Header from "$lib/header/Header.svelte";

    let debugResponsive = localStorage.getItem('debugResponsive') || false;
</script>

<Header/>

<main>
    <slot/>
</main>

<footer>
    {new Date().getFullYear()} &copy; 4909 Bionics &mdash;
    {#await getVersion()}
        ...
    {:then version}
        <!-- promise was fulfilled -->
        {version}
    {:catch error}
        {error.message}
    {/await}
    {#if debugResponsive}
        <div class="d-block d-sm-none">xs</div>
        <div class="d-none d-sm-block d-md-none">sm</div>
        <div class="d-none d-md-block d-lg-none">md</div>
        <div class="d-none d-lg-block d-xl-none">lg</div>
        <div class="d-none d-xl-block d-xxl-none">xl</div>
        <div class="d-none d-xxl-block">xxl</div>
    {/if}
</footer>

<style>
    main {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 1rem;
        width: 100%;
        max-width: 1024px;
        margin: 0 auto;
        box-sizing: border-box;
    }

    footer {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 40px;
    }

    @media (min-width: 480px) {
        footer {
            padding: 40px 0;
        }
    }
</style>
