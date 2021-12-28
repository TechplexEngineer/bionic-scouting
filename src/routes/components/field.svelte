<script>
    import Field from '$lib/compontents/Field.svelte'
    import {writable} from 'svelte/store';

    const value = writable({x: null, y: null});
    value.subscribe(i => {
        console.log(i);
    })
</script>

<Field {value}/>