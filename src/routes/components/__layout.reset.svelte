<script context="module">
    import {dev} from '$app/env';

    export const load = ({page}) => {
        if (!dev) {
            return {
                status: 404,
                error: new Error(`Could not load components url`)
            };
        }
        return {}
    }

    let components = [
        'counter',
        'btn-group',
        'boolean',
        'field'
    ]

</script>

<div class="wrapper">
    <nav>
        <p>Components</p>
        <ul>
            {#each components as c}
                <li>
                    <a href="/components/{c}">{c.charAt(0).toUpperCase() + c.slice(1)}</a>
                </li>
            {/each}
        </ul>
    </nav>
    <div class="component-wrapper">
        <slot></slot>
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