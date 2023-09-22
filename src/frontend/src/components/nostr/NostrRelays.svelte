<script lang="ts">

  import Spinner from "../utils/Spinner.svelte";
  import { Icon } from "svelte-feathers";
  import { alert } from "../../store/alert";
  import { nostr_service, nostric_service } from "../../store/auth";
  import { NostrHandler } from "../../lib/nostr";

  // for both normal and nostric relays:
  // todo fetch relays from backend on startup
  // todo add relay to backend
  // todo remove relay from backend

  let nostr_relays = [
    "wss://relay.nostr.band",
    "wss://nostr.girino.org",
    "wss://nostr-pub.wellorder.net",
  ];

  let new_nostr_gateway_url_value : string = null;
  let adding = false; // flag for adding new relay
  let deleting = false; // flag for deleting existing relay
  let selected_index = null;

  const restart_nostr_service = async (nostr_relays) => {
    let private_key = nostr_service.get_private_key();
    nostr_service = new NostrHandler();
    await nostr_service.init(private_key, nostr_relays);
  }

  const add_nostr_relay = async () => {
    adding = true;
    try {
      await restart_nostr_service(nostr_relays.concat(new_nostr_gateway_url_value));
      // todo subs with motoko actor call to save relay on backend
      nostr_relays.push(new_nostr_gateway_url_value);
    } catch(err) {
      alert.error(`Unable to add new relay ${new_nostr_gateway_url_value}`);
      console.error(err);
    }
    setTimeout(() => {
      new_nostr_gateway_url_value = "";
      adding = false;
    }, 1000);
  }

  const remove_nostr_relay = async (relay, index) => {
    deleting = true;
    selected_index = index;
    try {
      let filtered_relays = nostr_relays.filter((item) => item !== relay);
      await restart_nostr_service(filtered_relays);
      // todo subs with motoko actor call to save relay on backend
      nostr_relays = filtered_relays;
    } catch(err) {
      alert.error(`Unable remove relay ${relay}`);
      console.error(err);
    }
    setTimeout(() => {
      selected_index = null;
      deleting = false;
    }, 1000);
  }

  let selected_index_nostric = null;
  let new_nostric_gateway_url_value : string = "";
  let new_nostric_canister_id : string = "";
  let adding_nostric : boolean = false;

  let owner_canister_id : string = nostric_service.get_private_relay_canister_id();
  let owner_gateway_url : string = nostric_service.get_gateway_url()

  let nostric_relays = [
    { gateway_url: "ws://localhost:8000", canister_id: process.env.RELAY_CANISTER_ID }
  ]

  const add_nostric_relay = async () => {
    adding_nostric = true;
    try {
      // todo call motoko actor
      let new_relay = {
        gateway_url: new_nostric_gateway_url_value,
        canister_id: new_nostric_canister_id,
      }
      await nostric_service.init_pool([...nostric_relays, new_relay]);
      nostric_relays = [...nostric_relays, new_relay];
    } catch(err) {
      alert.error(`Unable to add new relay ${new_nostr_gateway_url_value}`);
      console.error(err);
    }
    setTimeout(() => {
      new_nostric_gateway_url_value = null;
      new_nostric_canister_id = null;
      adding_nostric = false;
    }, 1000);
  }

  const remove_nostric_relay = async (relay, index) => {
    deleting = true;
    selected_index_nostric = index;
    try {
      let filtered_relays = nostric_relays.filter((item) => item.gateway_url !== relay.gateway_url);
      await nostric_service.init_pool(filtered_relays);
      nostric_relays = filtered_relays;
    } catch(err) {
      alert.error(`Unable remove relay ${relay}`);
      console.error(err);
    }
    setTimeout(() => {
      selected_index_nostric = null;
      deleting = false;
    }, 1000);
  }


</script>

<div class="mb-12">
  <h3 class="mb-2 uppercase text-xl font-bold">Nostr relays</h3>
  <div class="mb-8 text-sm text-gray-500">Regular Nostr relays, with address in form "ws://example.io"</div>
  <div class="form-control mb-12">
    <div class="w-full">
      <div class="flex justify-center">
        <input
          class="input input-bordered w-full mb-1 border-primary border-2 rounded-2xl mr-4"
          placeholder="type nostr gateway url"
          bind:value={ new_nostr_gateway_url_value }
        />
        <button
          disabled={ !new_nostr_gateway_url_value || adding || deleting || adding_nostric }
          class="btn btn-primary rounded-2xl ml-3"
          on:click={ async () => await add_nostr_relay() }
        >
          {#if !adding}
            <Icon name="plus" />
          {:else}
            <Spinner />
          {/if}
          Add relay
        </button>
      </div>
    </div>
  </div>
  <div>
    {#each nostr_relays as nostr_relay, index}
      <div class="bg-base-200 rounded flex my-4 px-4 py-3 justify-between items-center">
        <div class="flex items-center font-sans">
          <span class="text-primary font-bold mr-2">Gateway</span>
          { nostr_relay }
        </div>
        <button
          class="btn btn-error rounded-2xl ml-3 btn-sm"
          on:click={ async () => await remove_nostr_relay(nostr_relay, index) }
          disabled={ adding || deleting || adding_nostric }
        >
          {#if deleting && selected_index === index}
            <Spinner />
          {:else}
            <Icon name="minus" size="12"/>
          {/if}
          remove
        </button>
      </div>
    {/each}
  </div>
</div>

<div>
  <h3 class="mb-2 uppercase text-xl font-bold">
    Nostr<span class="text-primary">ic</span> relays
  </h3>
  <div class="mb-8 text-sm text-gray-500">
    Special Nostric relays, running on IC with address to a gateway in form "ws://example.io" and an underlying canister ID.
  </div>
  <div class="form-control mb-12">
    <div class="w-full">
      <div class="flex justify-center">
        <input
          class="input input-bordered w-full mb-1 border-primary border-2 rounded-2xl mr-4"
          placeholder="type nostric gateway url"
          bind:value={ new_nostric_gateway_url_value }
        />
        <input
          class="input input-bordered w-full mb-1 border-primary border-2 rounded-2xl"
          placeholder="type canister ID"
          bind:value={ new_nostric_canister_id }
        />
        <button
          disabled={ !new_nostric_gateway_url_value || !new_nostric_canister_id || adding || deleting || adding_nostric }
          class="btn btn-primary rounded-2xl ml-3"
          on:click={ async () => await add_nostric_relay() }
        >
          {#if !adding_nostric}
            <Icon name="plus" />
          {:else}
            <Spinner />
          {/if}
          Add relay
        </button>
      </div>
    </div>
  </div>
  <div>
    {#each nostric_relays as nostric_relay, index}
      <div class="bg-base-200 rounded flex my-4 px-4 py-3 justify-between items-center">
        <div class="grid grid-cols-2 w-full mr-6">
          <div class="flex items-center font-sans">
            <span class="text-primary font-bold mr-2">Gateway</span>
            { nostric_relay.gateway_url }
          </div>
          <div class="flex items-center font-sans ml-4">
            <span class="text-primary font-bold mr-2">Canister ID</span>
            { nostric_relay.canister_id }
          </div>
        </div>
        <button
          class="btn btn-error rounded-2xl ml-3 btn-sm"
          on:click={ async () => await remove_nostric_relay(nostric_relay, index) }
          disabled={
            adding || deleting || adding_nostric ||
            (nostric_relay.gateway_url === owner_gateway_url && nostric_relay.canister_id === owner_canister_id)
          }
        >
          {#if deleting && selected_index_nostric === index}
            <Spinner />
          {:else}
            <Icon name="minus" />
          {/if}
          remove
        </button>
      </div>
    {/each}
  </div>
</div>
