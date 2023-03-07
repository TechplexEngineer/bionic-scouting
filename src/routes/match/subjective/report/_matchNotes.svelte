<script lang="ts">
    let notes = "";
    let notesSaveStatusMessage = "";

</script>

<div class="me-3">
    <div class="form-floating mt-4">
        <textarea id="notes" class="form-control"
                  placeholder=" "
                  style="height: 250px"
                  bind:value={notes}></textarea>
        <label for="notes">Notes</label>
    </div>
    <div class="float-end">
        {notesSaveStatusMessage}
    </div>
</div>