<script lang="ts">
  import { Circle, Server, XCircle } from "svelte-feathers";
  import { slide } from "svelte/transition";
  import { nostrHandler } from "$lib/nostr";
  import { onMount } from "svelte";
  import type { NDKRelay } from "@nostr-dev-kit/ndk";
  import { NDKRelayStatus } from "@nostr-dev-kit/ndk";

  let relays : NDKRelay[] = [];
  let disabled : boolean = false;
  let loading : string = "";
  let newRelay : string = "";

  const removeRelay = (relay : string) => {
    loading = relay;
    disabled = true;
    nostrHandler.removeRelay(relay);
    relays = nostrHandler.listRelays();
    newRelay = "";
    loading = "";
    disabled = false;
  }

  const addRelay = () => {
    loading = "add-relay";
    nostrHandler.addRelay(newRelay);
    relays = nostrHandler.listRelays();
    loading = "";
  }

  const getStatusColor = (status : NDKRelayStatus) => {
    if (status === NDKRelayStatus.CONNECTED) {
      return "green";
    } else if (status === NDKRelayStatus.DISCONNECTED) {
      return "red";
    } else {
      return "orange";
    }
  }

  onMount(() => {
    relays = nostrHandler.listRelays();
  });

</script>

<h1 class="h1 m-4">Relays</h1>
<div class="m-8">You can manage your relay servers here.</div>
<div class="m-8">
  <input
    type="text"
    bind:value={newRelay}
    class="input p-4"
    placeholder="Enter new relay URL"
    disabled={disabled}
  />
  <button
    on:click={addRelay}
    class="btn variant-filled-primary mt-4 w-full font-medium"
    disabled={disabled || newRelay.length === 0}
  >
    {#if loading === 'add-relay'}
      <span class="mr-2">
        <Circle size="15" color="white" unit="px"></Circle>
      </span>
    {/if}
    Add Relay
  </button>
</div>

<div class="relays m-4 p-4">
  <ul class="list">
    {#each relays as relay}
      <li
        class="p-4 card-hover variant-glass-tertiary"
        in:slide={{ duration: 300 }}
        out:slide={{ duration: 300 }}
      >
        <span><Server color={getStatusColor(relay.status)}/></span>
        <span class="flex-auto">{relay.url}</span>
        {#if !nostrHandler.explicitRelays.includes(relay.url)}
          <button
            on:click={() => removeRelay(relay.url)}
            title="Delete relay"
            class="btn variant-filled-error"
            disabled={disabled && loading !== relay.url}
          >
            {#if loading === relay.url}
              <span class="mr-2">
                <Circle size="15" color="white" unit="px"></Circle>
              </span>
            {/if}
            <span><XCircle /></span>
          </button>
        {/if}
      </li>
    {/each}
  </ul>
</div>
