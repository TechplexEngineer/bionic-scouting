<script context="module">
    import {dev} from "$app/env";

    export const load = ({page}) => {
        if (!dev) {
            return {
                status: 404,
                error: new Error(`Could not load components url`)
            };
        }
        return {};
    };
</script>

<script lang="ts">
    let components = [
        "counter",
        "btn-group",
        "boolean",
        "field",
        "select"
    ];

    function capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    import {page} from "$app/stores";

    let componentName = "loading";

    page.subscribe(v => {
        let path = v.path.split("/");
        componentName = capitalizeFirst(path[path.length - 1])
    })


</script>

<div class="wrapper">
    <nav>
        <p>Components</p>
        <ul>
            {#each components as c}
                <li>
                    <a href="/components/{c}">{capitalizeFirst(c)}</a>
                </li>
            {/each}
        </ul>
    </nav>
    <div class="component-wrapper">
        {#if componentName != "Components"}
            <h1>Component: {componentName}</h1>
        {/if}
        <slot/>
    </div>
</div>

<style>
    :global(html,body) {
        padding: 0;
        margin: 0;
        height: 100%;
        width: 100%;
    }

    .wrapper {
        display: flex;
        flex-direction: row;
        justify-content: stretch;
        height: 100vh;
    }

    nav {
        background-color: black;
        padding: 1rem;
    }

    nav a, nav p {
        color: whitesmoke
    }

    .component-wrapper {
        background-color: mintcream;
        flex-grow: 1;
        padding: 1rem;
    }
</style>