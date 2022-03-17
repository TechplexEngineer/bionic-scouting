<svelte:head>
    <title>Export</title>
</svelte:head>

<script lang="ts">
    import {onMount} from "svelte";
    import {getDb, MyDatabase} from "$lib/store";
    import {Directory, Encoding, Filesystem} from "@capacitor/filesystem";
    import {Mediastore} from "@agorapulse/capacitor-mediastore";
    import {Capacitor} from "@capacitor/core";
    import Swal from "sweetalert2";
    import {goto} from "$app/navigation";
    import {Settings} from "$lib/schema/settings-schema";


    let db: MyDatabase;
    let collections = [];
    let eventKey = "";
    onMount(async () => {
        db = await getDb();

        const eventSetting = await db.settings.findOne().where({key: Settings.CurrentEvent}).exec();
        if (!eventSetting) {
            let res = await Swal.fire({
                icon: "error",
                title: "Oops...",
                html: `Current event not set. Head over to Setup`,
                showCloseButton: true,
                confirmButtonText: "Go to Setup"
            });
            if (res.isConfirmed) {
                await goto("/tools/setup");
                return;
            }
            return;
        }
        eventKey = eventSetting.value;

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
            console.log("Export", colName, format);

            if (format == ExportType.JSON) {
                const data = await getJSONForExport(colName);

                if (Capacitor.getPlatform() == "web") {
                    const csvContent = "data:application/json;charset=utf-8," + data;

                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `${colName}-${eventKey}.json`);
                    document.body.appendChild(link); // Required for FF

                    link.click(); // This will download the data file named "my_data.csv".
                } else {
                    // await Filesystem.mkdir({
                    // 	path: "scouting",
                    // 	directory: Directory.Documents,
                    // 	recursive: true
                    // });
                    const filename = `${colName}-${new Date().toISOString()}.json`;
                    let res = await Filesystem.writeFile({
                        path: filename,
                        data: data,
                        directory: Directory.Data,
                        encoding: Encoding.UTF8
                    });
                    console.log("create file", res);
                    let res2 = await Mediastore.saveToDownloads({
                        filename: filename,
                        path: decodeURIComponent(res.uri)
                    });
                    console.log("savetodownloads", res2);

                    Swal.fire({
                        title: makeNiceName(colName) + " Export Complete",
                        html: `File is available in downloads folder<br>${filename}`,
                        icon: "success"
                    });

                }


            } else if (format == ExportType.CSV) {
                let data = await getCSVForExport(colName);
                if (Capacitor.getPlatform() == "web") {
                    const csvContent = "data:text/csv;charset=utf-8," + data;

                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `${colName}-${eventKey}.csv`);
                    document.body.appendChild(link); // Required for FF

                    link.click(); // This will download the data file named "my_data.csv".
                } else {
                    // await Filesystem.mkdir({
                    // 	path: "scouting",
                    // 	directory: Directory.Documents,
                    // 	recursive: true
                    // });
                    let res = await Filesystem.writeFile({
                        path: `${colName}-${new Date().toISOString()}.csv`,
                        data: data,
                        directory: Directory.External,
                        encoding: Encoding.UTF8
                    });
                    console.log(res);
                }
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
