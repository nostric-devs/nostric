<script lang="ts">

  import Spinner from "../utils/Spinner.svelte";
  import { Icon } from "svelte-feathers";
  import { alert } from "../../store/alert";
  import { nostr_service, nostric_service, auth_user, actor } from "../../store/auth";
  import { nostric_events, nostric_relays_eose_count, nostric_relays_count } from "../../store/nostric";

  let nostr_gateway_url_value : string = null;
  let adding = false; // flag for adding new relay
  let deleting = false; // flag for deleting existing relay
  let selected_index = null;
  let private_key = nostr_service.get_private_key();

  const add_nostr_relay = async () => {
    adding = true;
    try {
      let new_relays = [...auth_user.followed_relays.nostr, nostr_gateway_url_value];
      let result = actor.addNostrRelay(nostr_gateway_url_value);
      if (result["ok"]) {
        await nostr_service.init(
          private_key,
          auth_user.followed_relays.nostr.concat(nostr_gateway_url_value)
        );
        alert.success(`Successfully added new relay ${nostr_gateway_url_value}`);
        auth_user.followed_relays.nostr = new_relays;
      } else {
        alert.error(`Unable to add new relay ${nostr_gateway_url_value}`);
        console.error(result["err"]);
      }

    } catch(err) {
      alert.error(`Unable to add new relay ${nostr_gateway_url_value}`);
      console.error(err);
    }

    nostr_gateway_url_value = null;
    adding = false;

  }

  const remove_nostr_relay = async (relay, index) => {
    deleting = true;
    selected_index = index;

    try {
      let filtered_relays = auth_user.followed_relays.nostr.filter((item) => item !== relay);
      let result = actor.removeNostrRelay(relay);
      if (result["ok"]) {
        await nostr_service.init(private_key, filtered_relays);
        alert.success(`Successfully removed relay ${relay}. Wait a while for the changes to take place.`);
        auth_user.followed_relays.nostr = filtered_relays;
      } else {
        alert.error(`Unable remove relay ${relay}`);
        console.error(result["err"]);
      }

    } catch(err) {
      alert.error(`Unable remove relay ${relay}`);
      console.error(err);
    }

    selected_index = null;
    deleting = false;

  }

  let selected_index_nostric = null;
  let nostric_gateway_url_value : string = "ws://localhost:8089";
  let nostric_canister_id : string = "b77ix-eeaaa-aaaaa-qaada-cai";
  let adding_nostric : boolean = false;

  let owner_canister_id : string = auth_user.private_relay.canister_id;
  let owner_gateway_url : string = auth_user.private_relay.gateway_url;

  const add_nostric_relay = async () => {
    adding_nostric = true;
    try {
      let new_relay = {
        gateway_url: nostric_gateway_url_value,
        canister_id: nostric_canister_id,
      }
      let new_relays = [...auth_user.followed_relays.nostric, new_relay]

      let result = actor.addNostricRelay(new_relay.gateway_url, new_relay.canister_id);

      if (result["ok"]) {
        // clear events, close pool and re-init with new changes
        nostric_events.clear();
        await nostric_service.close_pool();
        await nostric_service.init_pool(new_relays);

        alert.success(`Successfully added new relay ${new_relay.gateway_url} with ID ${new_relay.canister_id}. Wait a while for it to initialize.`);

        // local state update
        auth_user.followed_relays.nostric = new_relays;

      } else {
        alert.error(`Unable to add new relay ${nostric_gateway_url_value}`);
        console.error(result["err"]);
      }
    } catch(err) {
      alert.error(`Unable to add new relay ${nostric_gateway_url_value}`);
      console.error(err);
    }

    nostric_gateway_url_value = "ws://localhost:8089";
    nostric_canister_id = "b77ix-eeaaa-aaaaa-qaada-cai";
    adding_nostric = false;

  }

  const remove_nostric_relay = async (relay, index) => {
    deleting = true;
    selected_index_nostric = index;

    try {
      let filtered_relays = auth_user.followed_relays.nostric
        .filter((item) => item.gateway_url !== relay.gateway_url && item.canister_id !== relay.canister_id);

      let result = actor.removeNostricRelay(nostric_gateway_url_value, nostric_canister_id);

      if (result["ok"]) {
        // no need to clear events, the old ones can stay and new ones will be loaded
        await nostric_service.close_pool();
        await nostric_service.init_pool(filtered_relays);
        alert.success(`Successfully removed relay ${relay.gateway_url} with ID ${relay.canister_id}`);
        // update local state
        auth_user.followed_relays.nostric = filtered_relays;
      } else {
        alert.error(`Unable to add new relay ${relay}`);
        console.error(result["err"]);
      }
    } catch(err) {
      alert.error(`Unable remove relay ${relay}`);
      console.error(err);
    }

    selected_index_nostric = null;
    deleting = false;

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
          bind:value={ nostr_gateway_url_value }
        />
        <button
          disabled={ !nostr_gateway_url_value || adding || deleting || adding_nostric }
          class="btn btn-primary rounded-2xl ml-3"
          on:click={ async () => await add_nostr_relay() }
        >
          {#if !adding}
            <Icon name="plus" />
          {:else}
            <Spinner width="2"/>
          {/if}
          Add relay
        </button>
      </div>
    </div>
  </div>
  <div>
    {#each auth_user.followed_relays.nostr as nostr_relay, index}
      <div class="bg-base-200 rounded flex my-4 px-4 py-3 justify-between items-center">
        <div class="flex items-center font-sans text-sm">
          <span class="text-primary font-bold mr-2">Gateway</span>
          { nostr_relay }
        </div>
        <button
          class="btn btn-error rounded-2xl ml-3 btn-sm"
          on:click={ async () => await remove_nostr_relay(nostr_relay, index) }
          disabled={ adding || deleting || adding_nostric }
        >
          {#if deleting && selected_index === index}
            <Spinner width="2"/>
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
          bind:value={ nostric_gateway_url_value }
          disabled={ adding || deleting || adding_nostric }
        />
        <input
          class="input input-bordered w-full mb-1 border-primary border-2 rounded-2xl"
          placeholder="type canister ID"
          bind:value={ nostric_canister_id }
          disabled={ adding || deleting || adding_nostric }
        />
        <button
          disabled={ !nostric_gateway_url_value || !nostric_canister_id || adding || deleting || adding_nostric }
          class="btn btn-primary rounded-2xl ml-3"
          on:click={ async () => await add_nostric_relay() }
        >
          {#if !adding_nostric}
            <Icon name="plus" />
          {:else}
            <Spinner width="2"/>
          {/if}
          Add relay
        </button>
      </div>
    </div>
  </div>
  <div>
    {#each auth_user.followed_relays.nostric as nostric_relay, index}
      <div class="bg-base-200 rounded flex my-4 px-4 py-3 justify-between items-center">
        <div class="grid grid-cols-2 w-full mr-6">
          <div class="flex items-center font-sans text-sm">
            <span class="text-primary font-bold mr-2">Gateway</span>
            { nostric_relay.gateway_url }
          </div>
          <div class="flex items-center font-sans ml-4 text-sm">
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
            <Spinner width="2"/>
          {:else}
            <Icon name="minus" />
          {/if}
          remove
        </button>
      </div>
    {/each}
  </div>
</div>
