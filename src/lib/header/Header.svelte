<script context="module">
    // Disable server side rendering for this page
    export const ssr = false;
</script>

<script lang="ts">
    import ActiveNavLink from "$lib/header/ActiveNavLink.svelte";
    import ActiveDropdownItem from "$lib/header/ActiveDropdownItem.svelte";

    import {
        Navbar,
        NavbarToggler,
        NavbarBrand,
        Nav,
        Offcanvas, Dropdown, DropdownToggle, DropdownMenu, DropdownItem
    } from "sveltestrap";
    import {connections} from "$lib/bluetooth";
    import {goto} from "$app/navigation";
    import {page} from "$app/stores";

    let isOpen = false;

    // function handleUpdate(event) {
    //     isOpen = event.detail.isOpen;
    // }

    function toggle() {
        isOpen = !isOpen;
    }

    let btMessage = "...";
    connections.subscribe(devices => {
        if (devices.length == 0) {
            btMessage = "NC";
        } else if (devices.length == 1) {
            btMessage = "Con";
        } else {
            btMessage = `Con(${devices.length})`;
        }
    });

    async function removeAllData() {
        if (!confirm("Are you sure? there is no undo!")) {
            return;
        }
        console.log("Removing all databases");
        const dbs = await indexedDB.databases();
        dbs.forEach(db => {
            console.log("Delete", db);
            indexedDB.deleteDatabase(db.name);
        });

        localStorage.clear();
        location.reload();
    }

    let expand = "lg";

    function back() {
        history.back()
    }

    function forward() {
        history.forward()
    }

    let links = [
        {name: "Home", href: "/"},
        {name: "Match Metrics", href: "/match/objective"},
        {name: "Match Subjective", href: "/match/subjective"},
        {name: "Pit Scout", href: "/pit"},
        {name: "Match Preview", href: "/match/preview"},
        {name: "Match Schedule", href: "/match/schedule"},
        {
            name: "Tools",
            dropdown: [
                {name: "Settings", href: "/settings"},
                {name: "Bluetooth", href: "/tools/bluetooth"},
                {divider: true},
                {name: "Setup", href: "/tools/setup"},
                {name: "Super Setup", href: "/tools/super"},
                {divider: true},
                {name: "Reload", click: () => location.reload()},
                {name: "Remove All Data", click: removeAllData},
                {divider: true},
                {name: "Notes", href: "/notes"},
            ]
        }
    ];

    function gotoWrapper(href) {
        return () => {
            toggle()
            goto(href)
        }
    }


</script>

<Navbar dark style="background-color: #0b4833;">

    <div class="d-flex justify-content-center">

        <div class="flex-1">
            <NavbarBrand href="/">TGA</NavbarBrand>
            <button class="btn btn-outline-secondary px-2 py-0" on:click={back}>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor"
                     class="bi bi-arrow-left-short" viewBox="0 0 16 16">
                    <path fill-rule="evenodd"
                          d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"/>
                </svg>
            </button>
            <button class="btn btn-outline-secondary px-2 py-0" on:click={forward}>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor"
                     class="bi bi-arrow-right-short" viewBox="0 0 16 16">
                    <path fill-rule="evenodd"
                          d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"/>
                </svg>
            </button>
        </div>


    </div>
    <div class="navbar-text flex-1 justify-content-center text-center">
        BT: {btMessage} | Red 1
    </div>
    <div class="flex-1 justify-content-end text-end">
        <NavbarToggler on:click={() => (isOpen = !isOpen)}/>

    </div>

</Navbar>

<Offcanvas isOpen={isOpen} toggle={toggle} placement="start">

    <h1 slot="header">
        The Green Alliance
    </h1>

    <h2 class="text-muted" style="margin-top: -20px">
        Menu
    </h2>
    <Nav navbar>

        {#each links as link}
            <ul class="navbar-nav me-auto mb-2 mb-lg-0 w-100">

                {#if !link.dropdown}
                    <li class="nav-item">
                        <button
                                class="btn btn-outline-secondary w-100"
                                on:click={gotoWrapper(link.href)}
                                class:active={$page.path === link.href}>
                            {link.name}
                        </button>
                    </li>
                {:else}
                    <Dropdown nav inNavbar>
                        <DropdownToggle caret outline class="w-100">{link.name}</DropdownToggle>
                        <DropdownMenu end>
                            {#each link.dropdown as item}
                                {#if !item.divider}
                                    <ActiveDropdownItem
                                            link={item.href}
                                            on:click={item.click || gotoWrapper(item.href)}>
                                        {item.name}
                                    </ActiveDropdownItem>
                                {:else}
                                    <DropdownItem divider/>
                                {/if}
                            {/each}
                        </DropdownMenu>
                    </Dropdown>
                {/if}

            </ul>
        {/each}

        <!--			<NavItem>-->
        <!--				<ActiveNavLink href="/search">Search</ActiveNavLink>-->
        <!--			</NavItem>-->

    </Nav>
</Offcanvas>


<style>
    .flex-1 {
        flex: 1;
    }
</style>
