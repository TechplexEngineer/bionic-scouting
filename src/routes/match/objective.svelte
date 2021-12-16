<svelte:head>
	<title>Match Objective</title>
</svelte:head>

<script lang="ts">
  import {
    Nav,
    NavItem,
    NavLink
  } from 'sveltestrap';

  let activeTab = 2;

  let tabs = [
	  {name: "Pre"},
	  {name: "Auto"},
	  {name: "Teleop"},
	  {name: "Post"},
  ];


</script>





<div class="content">
	<h1>Match Objective</h1>
	<Nav tabs class="row">
		{#each tabs as tab, index}
		<NavItem class="col">
			<NavLink class="text-center" active={activeTab===index} on:click={() =>{activeTab=index}}>{tab.name}</NavLink>
		</NavItem>
		{/each}

	</Nav>
</div>

<style>

</style>
