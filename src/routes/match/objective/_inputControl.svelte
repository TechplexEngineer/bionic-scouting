<script lang="ts">
    import BtnGroup from "$lib/compontents/BtnGroup.svelte";
    import Select from "svelte-select";
    import Boolean from "$lib/compontents/Boolean.svelte";
    import Counter from "$lib/compontents/Counter.svelte";
    import {onMount} from "svelte";
    import type {MyDatabase} from "$lib/store";
    import {getDb} from "$lib/store";
    import type {RxDocument} from "rxdb";
    import MatchMetricsSchema, {MatchMetricsReport} from "$lib/schema/match-metrics-schema";


    export let def; //json schema property definition
    export let eventKey; //eg. 2020week0
    export let matchKey; //eg. qm1
    export let teamNumber: string; //eg. 4909
    export let propertyName: string;

    let propertyValue = undefined; // the current value of the property this control manipulates
    let document: RxDocument<MatchMetricsReport>;

    let db: MyDatabase;
    onMount(async () => {
        db = await getDb();

        const query = {
            eventKey: eventKey,
            matchKey: matchKey,
            teamNumber: parseInt(teamNumber)
        };

        const debugProperty = false; //"autoTaxi";
        if (debugProperty && propertyName == debugProperty) {
            console.log("query", query);
        }
        db.match_metrics.findOne().where(query).$.subscribe(mm => {
            if (!mm) {
                return;
            }
            if (debugProperty && propertyName == debugProperty) {
                console.log("mm", mm, propertyName, mm[propertyName]);
            }
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
            // console.log(event.detail, typeof event.detail.value);
            // console.log(`setting ${propertyName} to ${event.detail.value} was ${propertyValue}`);
            if (event.detail == null) {
                data[propertyName] = undefined;
            } else {
                if (event.detail.value !== undefined) {
                    data[propertyName] = event.detail.value;
                } else {
                    data[propertyName] = event.detail.label;
                }
            }
            data.updatedAt = new Date().getTime();

            return data;
        });
    }

    function onChange(event) {
        if (!canProceed()) {
            return;
        }
        document.atomicUpdate(data => {
            if (event.detail == null) {
                data[propertyName] = undefined;
            } else {
                data[propertyName] = event.detail;
            }
            data.updatedAt = new Date().getTime();
            return data;
        });
    }

</script>

{#if !!document}
    {#if def.enum && def.type === 'string'}
        {#if def.metadata.control === 'buttons'}
            <BtnGroup
                    options={def.enum.map(i=>({label:i}))}
                    on:change={btnChange}
                    selected={ {label:propertyValue} }
            />
        {:else}
            <Select items={def.enum.map((i)=>({label:i, value:i}))}/>
        {/if}
    {:else if def.type === 'boolean'}
        {#if def.metadata.control === 'checkbox'}
            <input
                    type="checkbox"
                    class="form-check-input form-control"
                    placeholder="{def.metadata.placeholder}">
        {:else if def.metadata.control === 'boolean'}
            <Boolean label={def.metadata.labelNotSelected || 'False'}
                     labelSelected={def.metadata.labelSelected || 'True'}
                     value={propertyValue}
                     on:change={onChange}/>
        {:else}
            <BtnGroup
                    options={[
							{label:def.metadata.labelNotSelected, value:false},
							{label:def.metadata.labelSelected, value:true}
							]}
                    on:change={btnChange}
                    selected={propertyValue?{label:def.metadata.labelSelected, value:true}:{label:def.metadata.labelNotSelected, value:false}}
            />
        {/if}
    {:else if def.type === 'number'}
        <Counter
                min={def.minimum}
                max={def.maximum}
                on:change={onChange}
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