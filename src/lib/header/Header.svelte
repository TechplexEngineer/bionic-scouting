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
    import {adapterName, connections} from "$lib/bluetooth";
    import {goto} from "$app/navigation";
    import {page} from "$app/stores";
    import {onMount} from "svelte";
    import {BluetoothSerial} from "bionic-bt-serial";
    import {AppUpdate, AppUpdateAvailability} from "@robingenz/capacitor-app-update";
    import Swal from "sweetalert2";
    import {getDb, MyDatabase} from "$lib/store";
    import {Settings} from "$lib/schema/settings-schema";

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
        // console.log("Removing all databases");
        const dbs = await indexedDB.databases();
        dbs.forEach(db => {
            // console.log("Delete", db);
            indexedDB.deleteDatabase(db.name);
        });

        localStorage.clear();
        location.reload();
    }


    function back() {
        history.back();
    }

    function forward() {
        history.forward();
    }


    let links = [
        {name: "Home", href: "/"},
        // {name: "Match Metrics", href: "/match/objective"},
        // {name: "Match Subjective", href: "/match/subjective"},
        // {name: "Pit Scout", href: "/pit"},
        {name: "Teams & Pit Scouting", href: "/team"},
        // {name: "Match Preview", href: "/match/preview"},
        {name: "Match Schedule", href: "/match/schedule"},
        {name: "Pick List", href: "/pick"},
        {
            name: "Tools",
            dropdown: [
                {name: "Sync", href: "/settings"},
                {name: "Bluetooth", href: "/tools/bluetooth"},
                {divider: true},
                // {name: "Setup", href: "/tools/setup"},
                {name: "Strategist Setup", href: "/tools/super"},
                {divider: true},
                {name: "Reload", click: () => location.reload()},
                {name: "Remove All Data", click: removeAllData},
                {divider: true},
                {name: "Notes", href: "/notes"},
                {divider: true},
                {name: "Export", href: "/export"},
                {divider: true},
                {name: "Check For Updates", click: () => checkForUpdates()},
            ]
        }
    ];

    function gotoWrapper(href) {
        return () => {
            toggle();
            goto(href);
        };
    }

    const checkForUpdates = async () => {
        console.log("Checking for updates.");
        Swal.fire({
            icon: "info",
            title: "Starting update check...",
            // html: `Error: ${event.reason}`,
            showConfirmButton: false
        });

        const result = await AppUpdate.getAppUpdateInfo();
        console.log("Result", result);
        if (result.updateAvailability !== AppUpdateAvailability.UPDATE_AVAILABLE) {
            // console.log("Already up to date");
            Swal.fire({
                icon: "success",
                title: "Already up to date",
                // html: `Error: ${event.reason}`,
                showConfirmButton: false
            });
            return;
        }
        if (result.flexibleUpdateAllowed) {
            await AppUpdate.startFlexibleUpdate();
        }

    }
    let db: MyDatabase
    let currentEvent = "";

    onMount(async () => {
        let db = await getDb();

        db.settings.findOne({ selector: { key: Settings.CurrentEvent } }).$.subscribe(s => {
            currentEvent = s.value
        });
    })


</script>

<Navbar dark style="background-color: #0b4833;" class="d-flex fixed-top">

    <div class="flex-1 justify-content-center text-nowrap">
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

    <div class="flex-1 justify-content-center navbar-text text-center text-nowrap">
        {$adapterName} | {currentEvent}
    </div>

    <div class="flex-1 justify-content-end text-end">
        <NavbarToggler on:click={() => (isOpen = !isOpen)}/>
    </div>

</Navbar>

<Offcanvas isOpen={isOpen} toggle={toggle} placement="start">

    <h1 slot="header">
        The Green Alliance
    </h1>

    <!--	<h2 class="text-muted" style="margin-top: -20px">-->
    <!--		Menu-->
    <!--	</h2>-->
    <Nav navbar>

        {#each links as link}
            <ul class="navbar-nav me-auto mb-3 mb-lg-0 w-100">

                {#if !link.dropdown}
                    <li class="nav-item">
                        <button
                                class="btn btn-outline-secondary w-100 py-3"
                                on:click={gotoWrapper(link.href)}
                                class:active={$page.path === link.href}>
                            {link.name}
                        </button>
                    </li>
                {:else}
                    <Dropdown nav inNavbar>
                        <DropdownToggle caret outline class="w-100 py-3">{link.name}</DropdownToggle>
                        <DropdownMenu end>
                            {#each link.dropdown as item}
                                {#if !item.divider}
                                    <ActiveDropdownItem
                                            link={item.href}
                                            class="py-3"
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

</style>
