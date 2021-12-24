<script context="module">
	// Disable server side rendering for this page
	export const ssr = false;
</script>

<script lang="ts">
	import ActiveNavLink from "$lib/header/ActiveNavLink.svelte";
	import ActiveDropdownItem from "$lib/header/ActiveDropdownItem.svelte";

	import {
		Collapse,
		Navbar,
		NavbarToggler,
		NavbarBrand,
		Nav,
		NavItem,
		Dropdown,
		DropdownToggle,
		DropdownMenu,
		DropdownItem
	} from "sveltestrap";
	import { connections } from "$lib/bluetooth";

	let isOpen = false;

	function handleUpdate(event) {
		isOpen = event.detail.isOpen;
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
</script>

<Navbar dark expand="xs" style="background-color: #0b4833;">
	<NavbarBrand on:click={history.back}>TGA</NavbarBrand>
	<NavbarToggler on:click={() => (isOpen = !isOpen)} />
	<Collapse {isOpen} navbar expand="xs" on:update={handleUpdate}>
		<Nav navbar>

			<NavItem>
				<ActiveNavLink href="/">Home</ActiveNavLink>
			</NavItem>

			<Dropdown nav inNavbar>
				<DropdownToggle nav caret>Match Scout</DropdownToggle>
				<DropdownMenu end>
					<ActiveDropdownItem href="/match/objective">Objective</ActiveDropdownItem>
					<DropdownItem divider />
					<ActiveDropdownItem href="/match/subjective">Subjective</ActiveDropdownItem>
				</DropdownMenu>
			</Dropdown>

			<NavItem>
				<ActiveNavLink href="/pit">Pit Scout</ActiveNavLink>
			</NavItem>

			<Dropdown nav inNavbar>
				<DropdownToggle nav caret>Tools</DropdownToggle>
				<DropdownMenu end>
					<ActiveDropdownItem href="/match/preview">Match Preview</ActiveDropdownItem>
					<ActiveDropdownItem href="/match/schedule">Match Schedule</ActiveDropdownItem>
					<DropdownItem divider />
					<ActiveDropdownItem href="/settings">Settings</ActiveDropdownItem>
					<ActiveDropdownItem href="/tools/bluetooth">Bluetooth</ActiveDropdownItem>
					<DropdownItem divider />
					<ActiveDropdownItem href="/tools/setup">Setup</ActiveDropdownItem>
					<ActiveDropdownItem href="/tools/super">Super Setup</ActiveDropdownItem>
				</DropdownMenu>
			</Dropdown>

			<NavItem>
				<ActiveNavLink href="/search">Search</ActiveNavLink>
			</NavItem>

			<NavItem>
				<ActiveNavLink href="/test">test</ActiveNavLink>
			</NavItem>


		</Nav>
	</Collapse>
	<span class="navbar-text">
    BT: {btMessage}
  </span>
</Navbar>

<!--<header>-->
<!--	<Navbar dark expand="md" style="background-color: #0b4833;">-->
<!--		<div class="container-fluid">-->
<!--&lt;!&ndash;			<NavbarBrand href="/">TGA</NavbarBrand>&ndash;&gt;-->
<!--			<a class="navbar-brand" href="/">TGA</a>-->


<!--			<Collapse {isOpen} navbar expand="md" on:update={handleUpdate}>-->
<!--				<ul class="navbar-nav me-auto mb-2 mb-lg-0">-->
<!--					<li class="nav-item">-->
<!--						<a class="nav-link" href="/" class:active={$page.path === '/'}>Home</a>-->
<!--					</li>-->

<!--					<li class="nav-item dropdown">-->
<!--						<a class="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">-->
<!--							Match-->
<!--						</a>-->
<!--						<ul class="dropdown-menu">-->
<!--							<li><a class="dropdown-item" href="/match/objective" class:active={$page.path === '/match/objective'}>Objective</a></li>-->
<!--							<li><a class="dropdown-item" href="/match/subjective" class:active={$page.path === '/match/subjective'}>Subjective</a></li>-->
<!--						</ul>-->
<!--					</li>-->

<!--					<li class="nav-item dropdown">-->
<!--						<a class="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">-->
<!--							Pit-->
<!--						</a>-->
<!--						<ul class="dropdown-menu">-->
<!--							<li><a class="dropdown-item" href="/pit/objective" class:active={$page.path === '/pit/objective'}>Objective</a></li>-->
<!--							<li><a class="dropdown-item" href="/pit/subjective" class:active={$page.path === '/pit/subjective'}>Subjective</a></li>-->
<!--						</ul>-->
<!--					</li>-->

<!--					<li class="nav-item dropdown">-->
<!--						<a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">-->
<!--							Tools-->
<!--						</a>-->
<!--						<ul class="dropdown-menu" aria-labelledby="navbarDropdown">-->
<!--							<li><a class="dropdown-item" href="/preview" class:active={$page.path === '/preview'}>Match Preview</a></li>-->
<!--							<li><a class="dropdown-item" href="/match/schedule" class:active={$page.path === '/match/schedule'}>Match Schedule</a></li>-->
<!--							<li><hr class="dropdown-divider"></li>-->
<!--							<li><a class="dropdown-item" href="/bluetooth" class:active={$page.path === '/bluetooth'}>Bluetooth</a></li>-->
<!--							<li><a class="dropdown-item" href="/settings" class:active={$page.path === '/settings'}>Settings</a></li>-->
<!--							<li><hr class="dropdown-divider"></li>-->
<!--							<li><a class="dropdown-item" href="/setup" class:active={$page.path === '/setup'}>Setup</a></li>-->
<!--						</ul>-->
<!--					</li>-->
<!--				</ul>-->
<!--
<!--			</Collapse>-->


<!--		</div>-->
<!--	</Navbar>-->

<!--</header>-->

<style>

</style>
