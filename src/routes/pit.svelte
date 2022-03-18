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
    import {debounce} from "$lib/util";
    import {Carousel, CarouselCaption, CarouselControl, CarouselIndicators, CarouselItem} from "sveltestrap";


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

    // Bound Variables
    let notes = "";
    let saveStatusMessage = "Waiting for changes...";

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
        // robotPhotoUrl = image.dataUrl;

        // const regex = /^data:(.+\/.+);base64,(.*)$/;
        // const matches = image.dataUrl.match(regex);
        // const ext = matches[1];
        // const data = matches[2];

        await teamData.putAttachment(
            {
                id: String(Date.now()),     // (string) name of the attachment like 'cat.jpg'
                data: new Blob([image.dataUrl]),   // (string|Blob|Buffer) data of the attachment
                type: "text/plain"   // (string) type of the attachment-data like 'image/jpeg'
            },
            true // (boolean, optional, default=true) skipIfSame:If true and attachment already exists with same data, the write will be skipped
        );
        await teamData.atomicUpdate(d => {
            d.numAttachments += 1;
            return d
        })

        // await teamData.atomicUpdate(data => {
        //     data.imageUrl = image.dataUrl;
        //     data.updatedAt = new Date().getTime();
        //     return data;
        // });
    };

    let robotPhotos = [
        // {
        //     url: 'data:image/svg+xml;charset=UTF-8,',
        // },
    ];
    let activeRobotPhotoIndex = 0;
    let photosReady = false;


    // When the team dropdown select changes.
    // Also triggers when loading from query string
    async function handleSelectTeam(event) {
        const query = {
            eventKey: eventKey,
            teamNumber: parseInt(event.detail.value)
        };
        teamData = await db.pit_scouting.findOne().where(query).exec();
        notes = teamData.notes;

        teamData.allAttachments$.subscribe(debounce(async (attachments) => {
            robotPhotos = [];
            photosReady = false;
            console.log("got: ", attachments);

            for (let a of attachments) {
                let d = await a.getStringData()
                robotPhotos = [...robotPhotos, {
                    url: d,
                }]
            }

            photosReady = true;

            // setTimeout(() => {
            //     console.log("attachments", robotPhotos);
            // }, 500);

            // attachments.map(async (a) => {
            //     return {
            //         data: await a.getStringData(),
            //     }
            // })

        }), 500);
    }

    let factNames = ["climber", "drivetrain", "shooter"];
    let facts: { name: string, value: string }[] = [
        {name: "", value: ""} // need to start with at least one to show the form
    ];

    let debouncedSaveNotes = debounce(notesChange);
    const notesDirty = (n) => {
        if (!n) {
            return;
        }
        saveStatusMessage = "waiting...";
    };

    $: debouncedSaveNotes(notes); // any time notes changes save after 500ms
    $: notesDirty(notes);

    async function notesChange(notes) {
        if (!teamData) {
            return;
        }
        saveStatusMessage = "Saving...";
        await teamData.atomicUpdate(data => {
            data.notes = notes;
            data.updatedAt = new Date().getTime();
            return data;
        });
        saveStatusMessage = "Saved.";
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
            <a href="/team"
               class="btn btn-info"
               class:disabled={currentSelectedTeamItem == null}
            >Team List</a>
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

    <div class="d-flex" style="min-height: 100px">
        {#if photosReady && robotPhotos.length > 0}
            <Carousel items={robotPhotos} bind:activeIndex={activeRobotPhotoIndex} dark interval={false}>
                <CarouselIndicators bind:activeIndex={activeRobotPhotoIndex} items={robotPhotos}/>

                <div class="carousel-inner" style="width:100vw; padding-bottom: 50px">
                    {#each robotPhotos as item, index}
                        <CarouselItem bind:activeIndex={activeRobotPhotoIndex} itemIndex={index}>
                            <img src={item.url} class="d-block" alt="Robot Photo"
                                 style="max-width: 500px; max-height: 500px; margin:auto"/>
                        </CarouselItem>
                    {/each}
                </div>

                <CarouselControl direction="prev" bind:activeIndex={activeRobotPhotoIndex} items={robotPhotos}/>
                <CarouselControl direction="next" bind:activeIndex={activeRobotPhotoIndex} items={robotPhotos}/>
            </Carousel>
        {:else}
            <h4> &nbsp; &nbsp; &nbsp;No Photos Yet</h4>
        {/if}
    </div>

    <!-- Notes -->
    <div class="form-floating mt-4">
        <textarea id="notes" class="form-control" placeholder=" " style="height: 150px"
                  bind:value={notes}
                  disabled={currentSelectedTeamItem==null}></textarea>
        <label for="notes">Notes</label>
    </div>
    <div class="float-end mt-1">
        {saveStatusMessage}
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
