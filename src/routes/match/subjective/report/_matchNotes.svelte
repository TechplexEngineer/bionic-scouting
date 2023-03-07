<script lang="ts">
    import type {MyDatabase} from "$lib/store";
    import {onMount} from "svelte";
    import {getDb} from "$lib/store";
    import {debounce, getCurrentEvent} from "$lib/util";
    import type {Match} from "$lib/schema/match-schema";
    import type {RxDocument} from "rxdb";
    import type {MatchSubjReport} from "$lib/schema/match-subj-schema";

    export let currentMatch: RxDocument<Match>;

    $: console.log("props", currentMatch?.matchKey);

    let notes = "";
    let notesSaveStatusMessage = "";
    let isReady = false;


    // Variables set in onMount
    let db: MyDatabase;
    let eventKey: string; //eg. 2020week0 (current event)
    let matchReport: RxDocument<MatchSubjReport>;

    onMount(async () => {
        db = await getDb();
        console.log("Mount");
    });

    const init = async (db, currentMatch) => {
        if (!currentMatch || !db) {
            isReady = false;
            return
        }

        eventKey = currentMatch.eventKey;

        matchReport = await db.match_subjective.findOne().where({
            eventKey,
            matchKey: currentMatch.matchKey,
            teamNumber: -1,
            matchForKey: "match"
        }).exec();
        if (matchReport == null) {
            const report: MatchSubjReport = {
                eventKey,
                matchKey: currentMatch.matchKey,
                teamNumber: -1,
                matchForKey: "match", createdAt: Date.now(), facts: [], notes: "", primaryKey: "", updatedAt: Date.now()
            };
            matchReport = await db.match_subjective.insert(report)
        }

        notes = matchReport.notes;
        isReady = true;
    }

    $: init(db, currentMatch)

    async function notesChange(notes) {
        if (!matchReport) {
            return;
        }
        notesSaveStatusMessage = "Saving...";
        await matchReport.atomicUpdate(data => {
            data.notes = notes;
            data.updatedAt = new Date().getTime();
            return data;
        });
        notesSaveStatusMessage = "Saved.";
    }

    let debouncedSaveNotes = debounce(notesChange);
    const notesDirty = (n) => {
        if (!n) {
            return;
        }
        notesSaveStatusMessage = "waiting...";
    };

    $: debouncedSaveNotes(notes); // any time notes changes save after 500ms
    $: notesDirty(notes);

</script>


<div class="form-floating mt-4">
    <textarea id="notes" class="form-control"
              placeholder=" "
              disabled={!isReady}
              style="height: 250px"
              bind:value={notes}></textarea>
    <label for="notes">Match Strategy Notes</label>
</div>
<div class="text-end" style="min-height: 1.5rem">
    {notesSaveStatusMessage}
</div>
