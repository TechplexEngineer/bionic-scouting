<script lang="ts">
    import {writable} from "svelte/store";

    export let matchNumber: writable<number>; //serves as an output
    export let numberOfMatches: number;
    export let matchKey: string;

    function increment() {
        if ($matchNumber - 1 >= 0) {
            matchNumber.update(n => (n - 1))
        }
    }

    function decrement() {
        if ($matchNumber + 1 <= numberOfMatches) {
            matchNumber.update(n => (n + 1))
        }
    }

    function onNumberChange(e) {
        if (0 <= e.target.value && e.target.value < numberOfMatches) {
            matchNumber.set(e.target.value);
        } else {
            e.target.value = $matchNumber;
        }
    }
</script>

<div class="row">
    <div class="input-group mb-3">
        <button type="button" class="btn btn-primary col" on:click={increment} disabled={$matchNumber == 1}>&lt;
            Previous
        </button>
        <input type="number" class="form-control col" value={$matchNumber} on:change={onNumberChange} min="1"
               max="{numberOfMatches}">
        <input type="text" class="form-control col" disabled value="{matchKey}">
        <button type="button" class="btn btn-primary col" on:click={decrement}
                disabled={$matchNumber == numberOfMatches}>Next &gt;
        </button>
    </div>
</div>