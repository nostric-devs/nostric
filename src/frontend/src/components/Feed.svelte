<script lang="ts">
  import { nostr_service } from "../store/auth";
  import { nostr_events, nostr_followees } from "../store/nostr";
  import { nostric_events, nostric_users, nostric_relays_count, nostric_relays_eose_count } from "../store/nostric";
  import NostrPost from "./nostr/NostrPost.svelte";
  import { onMount } from "svelte";
  import type { NDKUser } from "@nostr-dev-kit/ndk";
  import Spinner from "./utils/Spinner.svelte";

  let active_user : NDKUser;
  let active_hexpubkey : string;
  let initialized : boolean = false;

  let feed_events = {};

  const parse_events = async () => {
    let events = {};
    for (let nostric_event of $nostric_events) {
      let event_id = nostric_event.event.id;
      let pubkey = nostric_event.event.pubkey;
      if (active_hexpubkey !== pubkey) {
        if (events[event_id]) {
          events[event_id].gateway_url = nostric_event.gateway_url;
          events[event_id].canister_id = nostric_event.canister_id;
        } else {
          let nostric_user = nostric_users.find_user(pubkey);
          if (nostric_user === undefined) {
            nostric_user = await nostr_service.fetch_foreign_user_profile(pubkey);
            nostric_users.add_user(nostric_user);
          }
          events[event_id] = {...nostric_event, author: nostric_user};
        }
      }
    }
    for (let event of $nostr_events) {
      if (event.pubkey !== active_hexpubkey) {
        if (!events[event.id]) {
          events[event.id] = {
            event,
            gateway_url: null,
            canister_id: null,
            author: nostr_followees.find_user(event.pubkey)
          }
        }
      }
    }
    feed_events = Object.values(events);
  }


  $: initialized && $nostr_events, parse_events();
  $: initialized && $nostric_events, parse_events();

  export let currentRoute;
  export let params;

  onMount(async () => {
    feed_events = [];
    active_user = await nostr_service.get_user();
    active_hexpubkey = active_user.hexpubkey();
    await parse_events();
    initialized = true;
  });

</script>

<div class="max-w-2xl mx-auto">

  {#if !initialized || (feed_events.length === 0 && $nostric_relays_count !== $nostric_relays_eose_count) }
    <div class="d-flex justify-center content-center">
      <div class="justify-center opacity-70 flex items-center">
        <Spinner width="3"/>
        <span class="ml-2">Live loading messages</span>
      </div>
    </div>
  {/if}
  {#if feed_events.length > 0 && initialized }
    {#each feed_events as event}
      <div class="my-6">
        <NostrPost
          event={ event.event }
          user={ event.author }
          gateway_url={ event.gateway_url }
          canister_id={ event.canister_id }
        />
      </div>
    {/each}
  {/if}
</div>




<style lang="postcss">
</style>
