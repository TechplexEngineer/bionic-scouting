<script>
    import BtnGroup from '$lib/compontents/BtnGroup.svelte';
    import {writable} from 'svelte/store';

    let options = [
        {label: 'First'},
        {label: 'Second'},
        {label: 'Third'},
    ];

    let options2 = [
        {
            label: 'Zero',
        },
        {
            label: 'One',
        },
        {
            label: 'Two',
        },
        {
            label: 'Three',
        },
    ];

    let activeIdx = writable(1);

    let activeIdx2 = writable(0);

</script>

<div class="mb-2">
    <BtnGroup name="first" {options} activeIdx={activeIdx}/>
</div>
<BtnGroup name="second" options={options2} activeIdx={activeIdx2}/>