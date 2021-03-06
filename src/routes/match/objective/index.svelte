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
	import Swal from "sweetalert2";
	import "sweetalert2/dist/sweetalert2.css";
	import {writable} from "svelte/store";
	import {onMount} from "svelte";
	import {getDb, MyDatabase} from "$lib/store";
	import {Settings} from "$lib/schema/settings-schema";
	import {goto} from "$app/navigation";
	import type {RxDocument} from "rxdb";
	import type {Match} from "$lib/schema/match-schema";
	import {matchSort} from "$lib/matches";
	import {adapterName} from "$lib/bluetooth";
	import InputControl from "./_inputControl.svelte";
	import {page} from "$app/stores";

	import matchObjectiveSchema, {MatchMetricsReport} from "$lib/schema/match-metrics-schema";
	import {getCurrentEvent} from "$lib/util";

	let activeTab = 0; // start on first tab


	const tabs: Record<string, { key: string }[]> = {};
	const props = matchObjectiveSchema.properties;
	for (const propKey in props) {
		const prop = props[propKey];

		// ignore properties that do not have an assigned tab
		if (!(prop.metadata && prop.metadata.tab)) {
			// console.log('Ignoring', propKey, prop);
			continue;
		}

		if (tabs[prop.metadata.tab] == undefined) {
			tabs[prop.metadata.tab] = [];
		}
		tabs[prop.metadata.tab].push({
			key: propKey,
			...prop
		});
	}


	function makeNiceName(tabName: string, propKey: string) {
		let name = propKey;
		// remove tab name(eg. 'pre' or 'auto') prefix if it exists
		if (name.toLowerCase().startsWith(tabName.toLowerCase())) {
			name = name.substring(tabName.length);
		}
		// split on capital letters, join with spaces
		name = name.match(/[A-Z][a-z]+/g).join(" ");
		return name;
	}

	function notHidden(d) {
		return !d.metadata.hidden;
	}


	let matchNumber: writable<number | null> = writable(null);

	let eventKey: string; //2020week0
	let matches: RxDocument<Match>[] = [];
	let db: MyDatabase;
	let onMountComplete = false;
	onMount(async () => {
		db = await getDb();

		eventKey = await getCurrentEvent(db);

		matches = await db.matches.find().where({eventKey: eventKey}).exec();
		matches.sort(matchSort);

		if ($page.query.get("match")) {
			for (const m of matches) {
				if (m.matchKey == $page.query.get("match")) {
					matchNumber.set(m.order + 1);
					break;
				}
			}
			// it is possible we got here and didn't find a match
		} else {

			// find first un-submitted match
			const lastSubmitted = await db.match_metrics.findOne().where({submitted: true}).sort({order: "desc"}).exec();
			if (lastSubmitted == null) {
				// no matches submitted yet, go to first match
				matchNumber.set(1); //trigger update
			} else {
				//+2 since order is 0 indexed
				matchNumber.set(lastSubmitted.order + 2);
			}
		}

		onMountComplete = true;
	});

	let match: RxDocument<Match>;
	let matchMetrics: RxDocument<MatchMetricsReport>;
	let teamNumber;
	matchNumber.subscribe(async (n) => {
		if (n == null) {
			return; //nothing to do
		}
		// Force the inputs to reload
		onMountComplete = false;
		match = matches[n - 1];

		let [color, number] = $adapterName.split("-");
		color = color.toLowerCase();
		if (!["red", "blue"].includes(color)) {
			let res = await Swal.fire({
				icon: "error",
				title: "Sorry you cannot scout match metrics.",
				html: `Possible Bluetooth Adapter Misconfiguration? <br><small class="text-muted">Expected Color-Number (eg. 'Red-1' or 'Blue-3')</small>`,
				showCloseButton: true,
				confirmButtonText: "Go to Bluetooth Settings"
			});
			if (res.isConfirmed) {
				goto("/tools/bluetooth");
				return;
			}
			return;
		}

		teamNumber = match.alliances[color].teamKeys[number - 1].replace("frc", "");

		matchMetrics = await db.match_metrics.findOne({
			selector: {
				eventKey: eventKey,
				matchKey: match.matchKey,
				teamNumber: parseInt(teamNumber)
			}
		}).exec();
		if (matchMetrics == null) {
			let res = await Swal.fire({
				icon: "error",
				title: "Oops...",
				html: `Scout is not assigned for this match`,
				showCloseButton: true,
				confirmButtonText: "Go to Setup"
			});
			if (res.isConfirmed) {
				goto("/tools/setup");
				return;
			}
		}
		// console.log("matchMetrics", eventKey, match.matchKey, teamNumber, matchMetrics);
		onMountComplete = true;
	});


	async function nextMatch() {
		if (!confirm("Move to next match?")) {
			return;
		}
		console.time("setSubmitted");
		// Mark this match as completed
		await matchMetrics.atomicUpdate(doc => {
			doc.submitted = true;
			doc.updatedAt = new Date().getTime();
			return doc;
		});
		console.timeEnd("setSubmitted");

		$matchNumber += 1;
		activeTab = 0; //reset view to first tab
	}

</script>


<div class="content">
	<div class="row">
		<div class="col">
			<h3 class="fs-5 text-muted">S: {matchMetrics && matchMetrics.scoutName || "Unassigned"}</h3>
		</div>
		<div class="col">
			<h3 class="fs-5 text-muted text-center">{$adapterName} &mdash; {teamNumber}</h3>
		</div>
		<div class="col">
			<h3 class="fs-5 text-muted text-end">M: {match && match.matchKey}</h3>
		</div>
	</div>

	<!--	<MatchPicker {matchNumber} numberOfMatches={matches.length} matchKey={match && match.matchKey} />-->

	<Nav tabs class="mb-2">
		{#each Object.keys(tabs) as tabName, index}
			<NavItem class="flex-grow-1 px-1">
				<NavLink class="text-center" active={activeTab===index}
						 on:click={()=>{activeTab=index}}>{tabName}</NavLink>
			</NavItem>
		{/each}
	</Nav>

	<!-- Wait for onMountComplete so children get valid props-->
	{#if onMountComplete}
		{#each Object.keys(tabs) as tabName, index}
			<div class:d-none={activeTab!==index}>

				<div class="row">
					{#each tabs[tabName].filter(notHidden) as d}
						<div class="col col-6 col-md-6 mb-2">
							<div class="card {d.metadata.cardClasses} h-100">
								<div class="card-body">
									<!--{JSON.stringify(d)}-->
									<h5 class="card-title">{d.metadata.label || makeNiceName(tabName, d.key)}</h5>
									<InputControl
											{eventKey}
											matchKey={match && match.matchKey}
											teamNumber={teamNumber}
											propertyName={d.key}
											def={d}
									/>

								</div>
							</div>
						</div>
					{/each}
				</div>

				<div class="d-flex mt-2">
					{#if activeTab > 0}
						<button class="btn btn-primary" on:click={()=>{activeTab -= 1}}>&lt;
							Prev
						</button>
					{/if}
					{#if activeTab < Object.keys(tabs).length - 1}
						<button class="btn btn-primary ms-auto" on:click={()=>{activeTab += 1}}>Next &gt;</button>
					{:else}
						<button class="btn btn-warning ms-auto" on:click={nextMatch}>Next &gt;
						</button>
					{/if}
				</div>

			</div>
		{/each}
	{/if}
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
