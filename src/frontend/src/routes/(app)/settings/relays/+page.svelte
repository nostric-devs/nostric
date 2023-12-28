<script>
  import { Server, XCircle } from "svelte-feathers";
  import { slide } from "svelte/transition";

  //Load relays from store once ready
  let relays = [
    { url: "wss://realay1.com", status: "Connected" },
    { url: "wss://realay2.com", status: "Connected" },
    { url: "wss://realay3.com", status: "Loading" },
    { url: "wss://realay4.com", status: "Failed" },
    { url: "wss://realay5.com", status: "Connected" },
  ];

  let newRelay = "";

  // temporary delete and add functions
  function deleteRelay(index) {
    relays = [...relays.slice(0, index), ...relays.slice(index + 1)];
  }

  function addRelay() {
    if (newRelay.trim()) {
      relays = [...relays, newRelay.trim()];
      newRelay = "";
    }
  }
</script>

<h1 class="h1 m-4">Relays</h1>
<div class="m-8">You can manage your relay servers here.</div>
<div class="m-8">
  <input
    type="text"
    bind:value={newRelay}
    class="input p-4"
    placeholder="Enter new relay URL"
  />
  <button
    on:click={addRelay}
    class="btn variant-filled-primary mt-4 w-full font-medium"
  >
    Add Relay</button
  >
</div>

<div class="relays m-4 p-4">
  <ul class="list">
    {#each relays as relay, index}
      <li
        class="p-4 card-hover variant-glass-tertiary"
        in:slide={{ duration: 300 }}
        out:slide={{ duration: 300 }}
      >
        <span><Server /></span>
        <span class="flex-auto">{relay.url}</span>
                {#if relay.status == "Connected"}
          <span class="badge variant-filled-success">{relay.status}</span>
        {:else if relay.status == "Loading"}
          <span class="badge variant-filled-warning">{relay.status}</span>
        {:else}
        <span class="badge variant-filled-error">{relay.status}</span>
        {/if}
        <button
          on:click={() => deleteRelay(index)}
          title="Delete relay"
          class="btn variant-filled-error"
        >
          <span><XCircle /></span>
        </button>
      </li>
    {/each}
  </ul>
</div>
