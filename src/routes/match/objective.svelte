<svelte:head>
  <title>Match Objective</title>
</svelte:head>

<script context="module">
  // Disable server side rendering for this page
  export const ssr = false;
</script>

<script lang="ts">
  import {
    Nav,
    NavItem,
    NavLink
  } from "sveltestrap";

  let activeTab = 0; // start on first tab

  let tabs = [
    { name: "Pre" },
    { name: "Auto" },
    { name: "Teleop" },
    { name: "Post" }
  ];


</script>


<div class="content">
  <h1>Match Objective</h1>
  <Nav tabs style="">
    {#each tabs as tab, index}
      <NavItem class="flex-grow-1 px-1">
        <NavLink class="text-center" active={activeTab===index} on:click={()=>{activeTab=index}}>{tab.name}</NavLink>
      </NavItem>
    {/each}
  </Nav>
</div>

<style>
    :global(.nav-tabs) {
        filter: brightness(90%);
    }

    :global(.nav-tabs a.nav-link) {
        color: #0b4833;
        background-color: #ccc;
        border-color: #dee2e6 #dee2e6 #fff;
    }
</style>
