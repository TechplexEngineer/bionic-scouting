<svelte:head>
    <title>Pit</title>
</svelte:head>

<script lang="ts">
    import Select from "svelte-select";
    import {onMount} from "svelte";
    import {getDb, MyDatabase} from "$lib/store";
    import {Settings} from "$lib/schema/settings-schema";
    import Swal from "sweetalert2";
    import "sweetalert2/dist/sweetalert2.css";
    import {goto} from "$app/navigation";
    import type {RxDocument} from "rxdb";
    import type {PitReport} from "$lib/schema/pit-scout-schema";
    import {page} from "$app/stores";
    import {Camera, CameraResultType} from "@capacitor/camera";
    import {debounce} from "$lib/debounce";
    import team from "./team/index.svelte";


    let db: MyDatabase;
    let eventKey: string; //eg. 2020week0 (current event)
    // let teams: RxDocument<PitReport>[] = [];
    let teamData: RxDocument<PitReport>;
    let teamsToChoose: { label: string, value: string }[] = [];
    let currentSelectedTeamItem: { label: string, value: string } = null;

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

        const teams = await db.pit_scouting.find().where({eventKey}).sort({teamNumber: "asc"}).exec();
        teamsToChoose = teams.map(t => {
            return {
                value: `${t.teamNumber}`,
                label: `${t.teamNumber}  ${"&nbsp; ".repeat(6 - t.teamNumber.toString().length)} ${t.nickname}`
            };
        });

        const queryTeam = $page.query.get("team");
        if (queryTeam) {
            currentSelectedTeamItem = teamsToChoose.find(i => i.value == queryTeam);
        }
    });

    let robotPhotoUrl = null;

    const takePicture = async () => {
        const image = await Camera.getPhoto({
            quality: 90,
            allowEditing: true,
            resultType: CameraResultType.DataUrl
        });

        // image.webPath will contain a path that can be set as an image src.
        // You can access the original file using image.path, which can be
        // passed to the Filesystem API to read the raw data of the image,
        // if desired (or pass resultType: CameraResultType.Base64 to getPhoto)
        // var imageUrl = image.webPath;

        // Can be set to the src of an image now
        // imageElement.src = imageUrl;
        robotPhotoUrl = image.dataUrl;
        console.log(image);

        await teamData.atomicUpdate(data => {
            data.imageUrl = image.dataUrl;
            data.updatedAt = new Date().getTime();
            return data;
        });
    };


    // When the team dropdown select changes.
    // Also triggers when loading from query string
    async function handleSelectTeam(event) {
        const query = {
            eventKey: eventKey,
            teamNumber: parseInt(event.detail.value),
        };
        teamData = await db.pit_scouting.findOne().where(query).exec();
        robotPhotoUrl = teamData.imageUrl;
    }

    let factNames = ["climber", "drivetrain", "shooter"];
    let facts: { name: string, value: string }[] = [
        {name: "", value: ""} // need to start with at least one to show the form
    ];

    function notesChange(evt) {
        teamData.atomicUpdate(data => {
            data.notes = evt.target.value;
            data.updatedAt = new Date().getTime();
            return data;
        });
    }
</script>

<div class="content">

    <div class="d-flex">
        <div class="flex-1">
            <!--            First-->
        </div>
        <div class="flex-1 text-center">
            <h1>Pit Scout</h1>
        </div>
        <div class="flex-1 text-end">
            <a href="/team/{currentSelectedTeamItem && currentSelectedTeamItem.value}"
               class="btn btn-primary"
               class:disabled={currentSelectedTeamItem == null}
            >Team Overview</a>
        </div>
    </div>


    <label for="team">Team Number:</label>
    <Select id="team" items={teamsToChoose} bind:value={currentSelectedTeamItem} on:select={handleSelectTeam}/>


    <!-- Robot Photo -->
    <div class="d-flex mb-2 mt-4">
        <h3 class="flex-fill">Robot Image</h3>
        <button class="btn btn-info align-self-end" on:click={takePicture}
                class:disabled={currentSelectedTeamItem==null}>Take Photo
        </button>
    </div>

    <div class="d-flex" style="height: 250px; background-color: #868e96">
        {#if robotPhotoUrl}
            <img class="w-auto h-auto mx-auto" src={robotPhotoUrl} alt="Robot Photo">
        {/if}
    </div>

    <!-- Notes -->
    <div class="form-floating mt-4">
        <textarea id="notes" class="form-control" placeholder=" " style="height: 150px"
                  value={teamData && teamData.notes || ""}
                  on:change={debounce(notesChange)}
                  disabled={currentSelectedTeamItem==null}></textarea>
        <label for="notes">Notes</label>
    </div>

    <!-- Facts-->
    <!--    <div class="d-flex mb-2 mt-4">-->
    <!--        <h3 class="flex-fill">Facts</h3>-->
    <!--        <button on:click={()=>{facts = [{name:"", value:""}, ...facts]}} class="btn btn-success align-self-end"-->
    <!--                class:disabled={currentSelectedTeamItem==null}>+ Add-->
    <!--            Fact-->
    <!--        </button>-->
    <!--    </div>-->

    <!--    {#if false}-->
    <!--        {#each facts as fact, idx}-->
    <!--            <div class="d-flex">-->
    <!--                <div class="flex-grow-1 pe-1">-->
    <!--                    <Select items={factNames} bind:value={fact.value} isCreatable="true"/>-->
    <!--                </div>-->
    <!--                <button class="btn btn-warning" on:click={()=>{-->
    <!--				if (confirm("Are you sure?")) {-->
    <!--					facts = facts.filter((f, idx) => f !== fact)-->
    <!--				}-->
    <!--			}}>Remove</button>-->
    <!--            </div>-->

    <!--            <div class="form-floating mt-1 mb-2">-->
    <!--                <textarea id="fact" class="form-control" placeholder="Leave a comment here"-->
    <!--                          style="height: 75px"></textarea>-->
    <!--                <label for="fact">Notes</label>-->
    <!--            </div>-->
    <!--        {/each}-->
    <!--    {/if}-->


    <!--    <div class="d-flex justify-content-end mt-2">-->
    <!--        <button class="btn btn-success">Save</button>-->
    <!--    </div>-->


</div>

<style>
</style>
