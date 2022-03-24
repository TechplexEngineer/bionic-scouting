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
    import JSZip from 'jszip';
    import type {RxDocument} from "rxdb";
    import type {PitReport} from "$lib/schema/pit-scout-schema";
    import SpinButton from "$lib/compontents/SpinButton.svelte";


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

                let filename = `${colName}-${new Date().toISOString()}.csv`

                if (Capacitor.getPlatform() == "web") {
                    const csvContent = "data:text/csv;charset=utf-8," + data;

                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", filename);
                    document.body.appendChild(link); // Required for FF

                    link.click(); // This will download the data file named "my_data.csv".
                } else {
                    // await Filesystem.mkdir({
                    // 	path: "scouting",
                    // 	directory: Directory.Documents,
                    // 	recursive: true
                    // });
                    let res = await Filesystem.writeFile({
                        path: filename,
                        data: data,
                        directory: Directory.External,
                        encoding: Encoding.UTF8
                    });
                    console.log(res);
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

    const doExportAll = async () => {
        console.log("Export All");

        const zip = new JSZip();

        for (let table of collections) {
            console.log(table);

            let json = await getJSONForExport(table);
            let csv = await getCSVForExport(table);

            zip.file(`${table}-${new Date().toISOString()}.csv`, csv)
            zip.file(`${table}-${new Date().toISOString()}.json`, json)
            if (table.toLowerCase() == "pit_scouting") {
                let docs = await getData(table)
                for (let doc:RxDocument<PitReport> of docs) {
                    let imgs = doc.allAttachments()
                    for (let [idx, img] of imgs.entries()) {
                        let dataurlImg = await img.getStringData()
                        let base64img = dataurlImg.substring(dataurlImg.indexOf(',') + 1);

                        zip.file(`robot_image-${doc.teamNumber}-${idx}`, base64img, {base64: true})
                    }
                }
            }
        }

        let datab64 = await zip.generateAsync({ type: 'base64' });


        let fileName = `${eventKey}-${new Date().toISOString()}.zip`

        if (Capacitor.getPlatform() == "web") {
            const csvContent = "data:application/zip;base64;charset=utf-8," + datab64;

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", fileName);
            document.body.appendChild(link); // Required for FF

            link.click(); // This will download the data file named "my_data.csv".
        } else {
            let res = await Filesystem.writeFile({
                path: fileName,
                data: datab64,
                directory: Directory.External,
                encoding: Encoding.UTF8
            });
            console.log("create file", res);
            let res2 = await Mediastore.saveToDownloads({
                filename: fileName,
                path: decodeURIComponent(res.uri)
            });
            console.log("savetodownloads", res2);

            Swal.fire({
                title: "Export All Complete",
                html: `File is available in downloads folder<br>${fileName}`,
                icon: "success"
            });

        }
    };
</script>

<h1>Data Export</h1>

<div class="row">
    <div class="col col-12 card">
        <div class="card-body">
            <h5 class="card-title">Export All</h5>
            <SpinButton class="btn btn-primary" onClick={doExportAll}>Export All</SpinButton>
        </div>
    </div>
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
