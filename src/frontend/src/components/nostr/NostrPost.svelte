<script lang="ts">
  import NostrAvatar from "./NostrAvatar.svelte";

  export let event;

</script>

<div class="rounded-3xl border-primary">
  <div class="grid grid-cols-3">
    <div>
      <NostrAvatar size="16" profile={event.profile}/>
    </div>
    <div class="col-span-2"></div>

  </div>

</div>
