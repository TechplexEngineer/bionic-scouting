<script lang="ts">
	import BtnGroup from "$lib/compontents/BtnGroup.svelte";
	import Select from "svelte-select";
	import Boolean from "$lib/compontents/Boolean.svelte";
	import Counter from "$lib/compontents/Counter.svelte";
	import { onMount } from "svelte";
	import type { MyDatabase } from "$lib/store";
	import { getDb } from "$lib/store";


	export let def; //json schema property def
	export let eventKey;
	export let matchKey;
	export let teamNumber: string; //eg. 4909
	export let propertyName: string;
	let propertyValue = undefined;
	let document;

	let db: MyDatabase;
	onMount(async () => {
		db = await getDb();

		const query = {
			selector: {
				eventKey: eventKey,
				matchKey: matchKey,
				teamNumber: parseInt(teamNumber)
			}
		};
		// if (propertyName == "preStartingLocation") {
		// 	console.log("query", query);
		// }
		db.match_metrics.findOne(query).$.subscribe(mm => {
			if (!mm) {
				return;
			}
			// if (propertyName == "preStartingLocation") {
			// 	console.log("mm", mm, propertyName, mm[propertyName]);
			// }
			propertyValue = mm[propertyName];
			document = mm;
		});
	});

	function canProceed(): boolean {
		if (!document) {
			console.log("Cant update null document");
			return false;
		}
		if (!propertyName) {
			console.log("Cant update null propertyName");
			return false;
		}
		return true;
	}

	function btnChange(event) {
		if (!canProceed()) {
			return;
		}

		// console.log(event.detail);
		document.atomicUpdate(data => {
			if (event.detail == null) {
				data[propertyName] = undefined;
			} else {
				data[propertyName] = event.detail.label;
			}

			return data;
		});
	}

	function counterChange(event) {
		if (!canProceed()) {
			return;
		}
		document.atomicUpdate(data => {
			if (event.detail == null) {
				data[propertyName] = undefined;
			} else {
				data[propertyName] = event.detail;
			}
			return data;
		});
	}

</script>

{#if !!document}
	{#if def.enum && def.type === 'string'}
		{#if def.metadata.control === 'buttons'}
			<BtnGroup name="first"
					  options={def.enum.map(i=>({label:i}))}
					  on:change={btnChange}
					  selected={ {label:propertyValue} }
			/>
		{:else}
			<Select items={def.enum.map((i)=>({label:i, value:i}))} />
		{/if}
	{:else if def.type === 'boolean'}
		{#if def.metadata.control === 'checkbox'}
			<input
				type="checkbox"
				class="form-check-input form-control"
				placeholder="{def.metadata.placeholder}">
		{:else}
			<Boolean label={def.metadata.labelNotSelected || 'False'}
					 labelSelected={def.metadata.labelSelected || 'True'} />
		{/if}
	{:else if def.type === 'number'}
		<Counter
			min={def.minimum}
			max={def.maximum}
			on:change={counterChange}
			value={propertyValue}
		/>
	{:else}
		<input
			type={(def.type === 'number')?'number':'text'}
			class="form-control"
			placeholder="{def.metadata.placeholder}">
	{/if}
{:else}
	Loading...
{/if}