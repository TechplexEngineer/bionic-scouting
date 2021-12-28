<script lang="ts">
    function handler(e) {
        console.log(e.offsetX, e.offsetY, e);
    }
</script>
<div on:click={handler} style="width: 500px">
    <img src="/gameField2020.png" alt="Game Field" class="w-100"/>
</div>