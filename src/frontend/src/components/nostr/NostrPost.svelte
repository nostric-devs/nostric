<script lang="ts">
  import NostrAvatar from "./NostrAvatar.svelte";

  let creation_time = "";
  $: event ? creation_time = new Date(event.created_at * 1000).toLocaleString() : "";

  export let event;
  export let user;

</script>

<div class="rounded-3xl border border-primary border-2 flex px-6 py-5">
  <div>
    <NostrAvatar size="60" profile={user?.profile}/>
  </div>
  <div class="flex-grow-1 w-full">
    <div class="flex content-center justify-between">
      <div class="text-xl font-bold mr-4">@{ user?.profile?.name }</div>
      <div class="text-neutral-content flex items-end opacity-40">{ creation_time }</div>
    </div>
    <div class="mt-3 text-capitalize text-sm break-all">
      { event.content }
    </div>
  </div>
</div>
