<script>
    import Counter from '$lib/compontents/Counter.svelte'
    import {writable} from 'svelte/store';

    const value = writable(1);
    value.subscribe(i => {
        console.log(i);
    })
</script>

<h1>Count is: {$value}</h1>

<Counter {value}/>