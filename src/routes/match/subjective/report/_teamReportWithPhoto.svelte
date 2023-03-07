<script lang="ts">
    import type {PitReportWithAttachments} from "./index.svelte";
    import type {RxDocument} from "rxdb";
    import type {PitReport} from "$lib/schema/pit-scout-schema";
    import type {MatchSubjReport} from "$lib/schema/match-subj-schema";

    export let t: number;
    export let teamPitScoutingData;
    export let matchReports;

    const getTeamNickname = (team: number, teamPitScoutingData: PitReportWithAttachments[]) => {
        let data = getDataForTeam(team, teamPitScoutingData);
        return data?.doc?.nickname
    }

    const getDataForTeam = (team: number, teamPitScoutingData: PitReportWithAttachments[]): PitReportWithAttachments => {
        return teamPitScoutingData.find(o => o.doc.teamNumber == team)
    }

    const getImageForTeam = async (team: number, teamPitScoutingData: PitReportWithAttachments[]) => {
        let data = getDataForTeam(team, teamPitScoutingData);
        // console.log(data)

        if (!data?.attachments.length) return Promise.reject("No Photo");

        return await data.attachments[0].getStringData();
    }
    function getNotesForTeam(team: number, teams: RxDocument<PitReport>[]) {
        const teamPitReport = teams.filter((t: RxDocument<PitReport>) => t.teamNumber == team);
        // console.log(teamPitReport);
        if (teamPitReport.length == 0) {
            return `no notes for ${team}`
        }
        return teamPitReport[0].notes || ""
    }
    const onlyTeam = (teamNumber: number) => {
        return (item: RxDocument<MatchSubjReport> | PitReportWithAttachments, index, self) => {
            return item.teamNumber == teamNumber
        }
    }
    const byMatchNumber = (a: RxDocument<MatchSubjReport>, b: RxDocument<MatchSubjReport>) => {
        //@todo make this work for matches above QM
        let aMatchNumber = parseInt(a.matchKey.slice(2));
        let bMatchNumber = parseInt(b.matchKey.slice(2));
        return aMatchNumber - bMatchNumber;
    }
    const byMatchNumberReverse = (a: RxDocument<MatchSubjReport>, b: RxDocument<MatchSubjReport>) => {
        //@todo make this work for matches above QM
        let aMatchNumber = parseInt(a.matchKey.slice(2));
        let bMatchNumber = parseInt(b.matchKey.slice(2));
        return bMatchNumber - aMatchNumber;
    }
</script>

<h3><a href="/pit?team={t}">{t}</a> <small>{getTeamNickname(t, teamPitScoutingData)}</small></h3>
        <div class="d-flex">
            <div class="flex-grow-1 me-2">
                <pre>Pit: {getNotesForTeam(t, teamPitScoutingData)}</pre>

                <ul>
                    {#each matchReports.filter(onlyTeam(t)).sort(byMatchNumberReverse) as mr}
                        <li>{mr.matchKey}
                            <pre>{mr.notes}</pre>
                        </li>
                    {/each}
                </ul>
            </div>
            <div style="max-width: 45%">
                {#await getImageForTeam(t, teamPitScoutingData)}
                    <p>...waiting</p>
                {:then image}
                    <img src="{image}" class="d-block" alt="Robot Photo" style="max-width: 100%; margin:auto"/>
                {:catch msg}
                    <p>{msg}</p>
                {/await}
            </div>
        </div>