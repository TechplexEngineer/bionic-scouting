<svelte:head>
	<title>Export</title>
</svelte:head>

<script lang="ts">


	import { onMount } from "svelte";
	import { getDb, MyDatabase } from "$lib/store";


	let db: MyDatabase;
	let collections = [];
	onMount(async () => {
		db = await getDb();

		collections = Object.keys(db.collections);
	});

	const makeNiceName = (name: string): string => {
		return name.split("_").map(word => {
			//capitalize first letter
			return word[0].toUpperCase() + word.substring(1);
		}).join(" ");
	};

	enum ExportType {
		CSV = "CSV",
		JSON = "JSON",
	}

	const doExport = (colName: string, format: ExportType) => {
		return async () => {
			console.log("Export", colName);

			if (format == ExportType.JSON) {
				console.log(await getJSONForExport(colName));
				const csvContent = "data:application/json;charset=utf-8," + await getJSONForExport(colName);

				const encodedUri = encodeURI(csvContent);
				const link = document.createElement("a");
				link.setAttribute("href", encodedUri);
				link.setAttribute("download", `${colName}.json`);
				document.body.appendChild(link); // Required for FF

				link.click(); // This will download the data file named "my_data.csv".

			} else if (format == ExportType.CSV) {

				const csvContent = "data:text/csv;charset=utf-8," + await getCSVForExport(colName);

				const encodedUri = encodeURI(csvContent);
				const link = document.createElement("a");
				link.setAttribute("href", encodedUri);
				link.setAttribute("download", `${colName}.csv`);
				document.body.appendChild(link); // Required for FF

				link.click(); // This will download the data file named "my_data.csv".
			} else {
				console.log("Unknown export format");
			}


		};
	};

	const getJSONForExport = async (colName: string) => {
		let data = await getData(colName);
		return JSON.stringify(data, null, 4);
	};

	const getCSVForExport = async (colName: string) => {
		const jsonData = await getJSONForExport(colName);
		const items = JSON.parse(jsonData);

		if (items.length == 0) {
			return "";
		}

		const replacer = (key, value) => value === null ? "" : value; // specify how you want to handle null values here
		const header = Object.keys(items[0]);
		const csv = [
			header.join(","), // header row first
			...items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(","))
		].join("\r\n");

		return csv;
	};

	const getData = async (colName: string) => {
		return await db[colName].find().exec();
	};
</script>

<h1>Data Export</h1>

<div class="row">
	{#each collections as col}
		<div class="col col-6 card">
			<div class="card-body">
				<h5 class="card-title">{makeNiceName(col)}<br><small>
					{#await getData(col)}...{:then data}{data.length}{:catch error}Error{/await} records</small></h5>
				<button class="btn btn-primary" on:click={doExport(col, ExportType.CSV)}>Export CSV</button>
				<button class="btn btn-primary" on:click={doExport(col, ExportType.JSON)}>Export JSON</button>
			</div>
		</div>
	{/each}
</div>
