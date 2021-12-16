<script lang="ts">
	import { page } from '$app/stores';
</script>

<header>
	<nav class="navbar navbar-expand-lg navbar-dark" style="background-color: #0b4833;">
		<div class="container-fluid">
			<a class="navbar-brand" href="/">TGA</a>
			<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
				<span class="navbar-toggler-icon"></span>
			</button>
			<div class="collapse navbar-collapse" id="navbarSupportedContent">
				<ul class="navbar-nav me-auto mb-2 mb-lg-0">
					<li class="nav-item">
						<a class="nav-link" href="/" class:active={$page.path === '/'}>Home</a>
					</li>

					<li class="nav-item dropdown">
						<a class="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
							Match
						</a>
						<ul class="dropdown-menu">
							<li><a class="dropdown-item" href="/match/objective" class:active={$page.path === '/match/objective'}>Objective</a></li>
							<li><a class="dropdown-item" href="/match/subjective" class:active={$page.path === '/match/subjective'}>Subjective</a></li>
						</ul>
					</li>

					<li class="nav-item dropdown">
						<a class="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
							Pit
						</a>
						<ul class="dropdown-menu">
							<li><a class="dropdown-item" href="/pit/objective" class:active={$page.path === '/pit/objective'}>Objective</a></li>
							<li><a class="dropdown-item" href="/pit/subjective" class:active={$page.path === '/pit/subjective'}>Subjective</a></li>
						</ul>
					</li>

					<li class="nav-item dropdown">
						<a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
							Tools
						</a>
						<ul class="dropdown-menu" aria-labelledby="navbarDropdown">
							<li><a class="dropdown-item" href="/preview" class:active={$page.path === '/preview'}>Match Preview</a></li>
							<li><a class="dropdown-item" href="/match/schedule" class:active={$page.path === '/match/schedule'}>Match Schedule</a></li>
							<li><hr class="dropdown-divider"></li>
							<li><a class="dropdown-item" href="/bluetooth" class:active={$page.path === '/bluetooth'}>Bluetooth</a></li>
							<li><a class="dropdown-item" href="/settings" class:active={$page.path === '/settings'}>Settings</a></li>
							<li><hr class="dropdown-divider"></li>
							<li><a class="dropdown-item" href="/setup" class:active={$page.path === '/setup'}>Setup</a></li>
						</ul>
					</li>
				</ul>
				<form class="d-flex">
					<input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
					<button class="btn btn-outline-success" type="submit">Search</button>
				</form>
			</div>
		</div>
	</nav>

</header>

<style>

</style>
