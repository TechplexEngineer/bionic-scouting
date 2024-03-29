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
    import {Camera, CameraResultType, CameraSource} from "@capacitor/camera";
    import {debounce, getCurrentEvent} from "$lib/util";
    import {Carousel, CarouselControl, CarouselIndicators, CarouselItem, Spinner} from "sveltestrap";
    import {CapacitorException} from "@capacitor/core";

    let db: MyDatabase;
    let eventKey: string; //eg. 2020week0 (current event)
    let teamData: RxDocument<PitReport>;
    let teamsToChoose: { label: string, value: string }[] = [];
    let currentSelectedTeamItem: { label: string, value: string } = null;

    onMount(async () => {
        db = await getDb();

        eventKey = await getCurrentEvent(db);

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

    const takePicture = (source: CameraSource) => {
        return async () => {
            try {
                const image = await Camera.getPhoto({
                    quality: 90,
                    allowEditing: false,
                    source: source,
                    resultType: CameraResultType.DataUrl,
                    // saveToGallery: true // image is not being saved to app?
                });

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
            } catch (e) {
                if (e instanceof CapacitorException && e.message == 'User cancelled photos app') {
                    return
                }
                throw e
            }
        }
    };

    let robotPhotos = [
        // {
        //     url: 'data:image/svg+xml;charset=UTF-8,',
        // },
    ];
    let activeRobotPhotoIndex = 0;
    let photosReady = false;
    const notesTemplate = `Chassis:\n\nShooter:\n\nIntaker:\n\nExtension:\n\nAuto:\n\nScoring Place:\n\n`

    // When the team dropdown select changes.
    // Also triggers when loading from query string
    async function handleSelectTeam(event) {
        const query = {
            eventKey: eventKey,
            teamNumber: parseInt(event.detail.value)
        };
        teamData = await db.pit_scouting.findOne().where(query).exec();
        notes = teamData.notes || notesTemplate;

        const imageHandler = async (attachments) => {
            // console.log("imageHandler");

            // console.log("attachments: ", attachments);

            //@todo seems like we could be smarter here and only change the photos list if there is a change
            let newPhotos = [];


            for (let a of attachments) {
                let d = await a.getStringData()

                newPhotos.push({
                    url: d,
                });
            }

            robotPhotos = newPhotos;
            // photosReady = false;

            photosReady = true;
        };

        const debouncedImageHandler = debounce(imageHandler, 500)

        teamData.allAttachments$.subscribe((arg) => {
            // console.log("attachments");
            imageHandler(arg);
        });
    }

    let factNames = ["chassis", "placer", "intaker", "extension", "auto", "scoring place"];
    let facts: { name: string, value: string }[] = [
        {name: "", value: ""} // need to start with at least one to show the form
    ];
    const addFact = () => {
        facts = [{name: "", value: ""}, ...facts]
        console.log(facts);
    }
    const factChanged = (factName: string) => {
        return debounce(() => {
            //@todo write to document
        })
    }

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
            <a href="/team"
               class="btn btn-info"
            >Team List</a>
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
        <button class="btn btn-warning align-self-end me-4" on:click={takePicture(CameraSource.Photos)}
                class:disabled={currentSelectedTeamItem==null}>Pick Photo
        </button>
        <button class="btn btn-info align-self-end" on:click={takePicture(CameraSource.Camera)}
                class:disabled={currentSelectedTeamItem==null}>Take Photo
        </button>
    </div>

    <div class="d-flex" style="min-height: 100px">
        {#if photosReady && robotPhotos.length > 0}
            <Carousel items={robotPhotos} bind:activeIndex={activeRobotPhotoIndex} dark interval={false}
                      style="margin: 0 auto;">
                <CarouselIndicators bind:activeIndex={activeRobotPhotoIndex} items={robotPhotos}/>

                <div class="carousel-inner" style="width:100%; padding-bottom: 50px">
                    {#each robotPhotos as item, index}
                        <CarouselItem bind:activeIndex={activeRobotPhotoIndex} itemIndex={index}>
                            <img src={item.url} class="d-block" alt="Robot Photo"
                                 style="max-width: 500px; max-height: 500px; margin:auto"/>
                        </CarouselItem>
                    {/each}
                </div>

                <CarouselControl direction="prev" bind:activeIndex={activeRobotPhotoIndex} items={robotPhotos}
                                 style="margin-left: -80px"/>
                <CarouselControl direction="next" bind:activeIndex={activeRobotPhotoIndex} items={robotPhotos}
                                 style="margin-right: -80px"/>
            </Carousel>
        {:else}
            {#if !photosReady}
                <span> &nbsp; &nbsp; &nbsp; Loading...
                    <Spinner color="dark" size="sm"/>
                </span>
            {:else}
                <span> &nbsp; &nbsp; &nbsp;No Photos Yet</span>
            {/if}
        {/if}
    </div>

    <!-- Notes -->
    <div class="mt-4">
        <label for="notes" class="form-label">Notes</label>
        <textarea id="notes" class="form-control" placeholder=" " rows="15"
                  bind:value={notes}
                  disabled={currentSelectedTeamItem==null}></textarea>
    </div>
    <div class="float-end mt-1">
        {saveStatusMessage}
    </div>

    <!-- Facts-->
    <!--    <div class="d-flex mb-2 mt-5">-->
    <!--        <h3 class="flex-fill">Facts</h3>-->
    <!--        <button on:click={addFact} class="btn btn-success"-->
    <!--                class:disabled={currentSelectedTeamItem==null}>+ Add Fact-->
    <!--        </button>-->
    <!--    </div>-->


    <!--    {#each facts as fact, idx}-->
    <!--        <div class="d-flex">-->
    <!--            <div class="flex-grow-1 pe-1">-->
    <!--                <Select items={factNames} bind:value={fact.value} isCreatable="true"/>-->
    <!--            </div>-->
    <!--            <button class="btn btn-warning" on:click={()=>{-->
    <!--                if (confirm("Are you sure?")) {-->
    <!--                    facts = facts.filter((f, idx) => f !== fact)-->
    <!--                }-->
    <!--            }}>Remove-->
    <!--            </button>-->
    <!--        </div>-->

    <!--        <div class="form-floating mt-1 mb-2">-->
    <!--                <textarea id="fact" class="form-control" placeholder="Leave a comment here"-->
    <!--                          style="height: 75px" on:change={factChanged(fact)}></textarea>-->
    <!--            <label for="fact">Notes</label>-->
    <!--        </div>-->
    <!--    {/each}-->
    <!--    <div class="d-flex">-->
    <!--        <button on:click={addFact} class="btn btn-success ms-auto"-->
    <!--                class:disabled={currentSelectedTeamItem==null}>+ Add Fact-->
    <!--        </button>-->
    <!--    </div>-->


</div>

<style>
</style>
