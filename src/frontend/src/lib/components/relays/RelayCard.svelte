<script lang="ts">
  import { RefreshCcw, Server, XCircle } from "svelte-feathers";
  import { nostrHandler } from "$lib/nostr";
  import { NDKRelayStatus } from "@nostr-dev-kit/ndk";
  import { slide } from "svelte/transition";
  import { Circle } from "svelte-loading-spinners";
  import type { RelayObject } from "$lib/stores/Relays";

  let loading : boolean = false;
  let disabledLocal : boolean = false;
  let statusColor : string = "";

  $: if (relay.status === NDKRelayStatus.CONNECTED) {
    statusColor = "variant-filled-success";
  } else if (relay.status === NDKRelayStatus.DISCONNECTED) {
    statusColor = "variant-filled-error";
  } else {
    statusColor = "variant-filled-warning";
  }

  const attemptReconnect = async () => {
    loading = true;
    disabledLocal = true;
    await nostrHandler.reconnectRelay(relay.object);
    nostrHandler.on("reconnect-finished", () => {
      loading = false;
      disabledLocal = false;
    });
  }

  export let relay : RelayObject;
  export let disabled : boolean | undefined = undefined;

  export let verbose : boolean | undefined = true;

</script>

{#if verbose}
  <div
    class="p-4 card-hover variant-glass-tertiary flex items-center rounded-xl my-4"
    in:slide={{ duration: 300 }}
    out:slide={{ duration: 300 }}
  >
    <div class="flex items-center mr-4"><Server/></div>
    <div>
      <div class="flex mb-1">
        <div class="text-xs uppercase font-semibold min-w-[65px] flex items-center">
          URL
        </div>
        <div class="text-xs font-mono">{relay.object?.url}</div>
      </div>
      <div class="flex mb-1">
        <div class="text-xs uppercase font-semibold min-w-[65px] flex items-center">
          mode
        </div>
        <div class="text-xs font-mono">read & write</div>
      </div>
      <div class="flex grow">
        <div class="text-xs uppercase font-semibold min-w-[65px] flex items-center">
          status
        </div>
        <div class="badge text-xs font-light font-mono py-0 px-2 rounded-xl lowercase {statusColor}">
          {NDKRelayStatus[relay.status]}
        </div>
      </div>
    </div>
    <div class="ml-auto grow-0 max-w-[100px]">
      <div class="mb-1">
        <button
          on:click={() => nostrHandler.removeRelay(relay.object?.url)}
          title="Delete relay"
          class="btn btn-sm rounded-2xl variant-filled-error min-w-[50px]"
          disabled={disabled || disabledLocal}
        >
          <span><XCircle size="15"/></span>
          <span>remove</span>
        </button>
      </div>
      <div>
        <button
          on:click={attemptReconnect}
          title="Delete relay"
          class="btn btn-sm rounded-2xl variant-filled-primary w-full"
          disabled={disabled || disabledLocal}
        >
          {#if loading}
            <span class="mr-2">
              <Circle size="15" color="white" unit="px"></Circle>
            </span>
          {:else}
            <span><RefreshCcw size="14"/></span>
          {/if}
          <span>refesh</span>
        </button>
      </div>
    </div>
  </div>
{:else}
  <div class="variant-glass-tertiary rounded-xl p-2 flex mb-2">
    <div class="flex items-center ml-2 mr-3"><Server/></div>
    <div>
      <div class="font-mono text-xs">{relay.object?.url}</div>
      <div class="badge text-xs font-light font-mono py-0 px-2 rounded-xl lowercase {statusColor}">
        {NDKRelayStatus[relay.status]}
      </div>
    </div>
  </div>
{/if}

