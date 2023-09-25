<script lang="ts">
  import NostrAvatar from "./NostrAvatar.svelte";

  let creation_time = "";
  $: event ? creation_time = new Date(event.created_at * 1000).toLocaleString() : "";

  export let event;
  export let user;
  export let gateway_url = null;
  export let canister_id = null;

</script>

<div class="rounded-3xl border border-primary border-2 px-6 py-5">
  <div class="flex">
    <div>
      <NostrAvatar size="60" profile={ user?.profile }/>
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
  {#if gateway_url && canister_id}
    <div class="text-xs mt-4 text-gray-500 flex justify-end">
      <div class="mr-1">
        <span class="text-primary font-weight-bold">Gateway</span>
        { gateway_url }
      </div>
      <div>
        <span class="text-primary font-weight-bold">ID</span>
        { canister_id }
      </div>
    </div>
  {/if}
</div>
