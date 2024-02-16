<script lang="ts">
  import { nostrHandler } from "$lib/nostr";
  import { authUser, AuthStates } from "$lib/stores/Auth";
  import { relays } from "$lib/stores/Relays";
  import RelayCard from "$lib/components/relays/RelayCard.svelte";
  import { getToastStore, ProgressRadial } from "@skeletonlabs/skeleton";

  let disabled: boolean = false;
  let loading: boolean = false;
  let newRelay: string = "";
  const toastStore = getToastStore();

  const addRelay = async () => {
    if ($authUser.authState !== AuthStates.ANONYMOUS && $authUser.nostr) {
      loading = true;
      disabled = true;
      nostrHandler.addRelay(newRelay);
      await $authUser.nostr.addUserPreferredRelay(newRelay);
      loading = false;
      disabled = false;
      toastStore.trigger({
        message: "Relay successfully added",
        background: "variant-filled-success",
      });
    }
  };
</script>

<div class="m-4">You can manage your relay servers here.</div>
<div class="m-4">
  <input
    type="text"
    bind:value={newRelay}
    class="input p-4"
    placeholder="Enter new relay URL"
    {disabled}
  />
  <button
    on:click={addRelay}
    class="btn variant-filled-primary mt-4 w-full font-medium"
    disabled={disabled || newRelay.length === 0}
  >
    {#if loading}
      <span class="mr-2">
        <ProgressRadial width="w-4" />
      </span>
    {/if}
    Add Relay
  </button>
</div>

<div class="p-4">
  {#each $relays as relay}
    <RelayCard {relay} />
  {/each}
</div>
