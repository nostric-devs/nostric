<script lang="ts">
  import { nostr_service } from "../store/auth";
  import { nostr_events, nostr_followees } from "../store/nostr";
  import NostrPost from "./nostr/NostrPost.svelte";
  import { onMount } from "svelte";
  import type { NDKUser } from "@nostr-dev-kit/ndk";
  import Spinner from "./utils/Spinner.svelte";
  import { NDKEvent } from "@nostr-dev-kit/ndk";

  let active_user : NDKUser;
  let active_hexpubkey : string;
  let initializing : boolean = true;
  let feed_events : NDKEvent[] = [];

  $: feed_events = $nostr_events.filter((event) => event.pubkey !== active_hexpubkey);

  export let currentRoute;
  export let params;

  onMount(async () => {
    active_user = await nostr_service.get_user();
    active_hexpubkey = active_user.hexpubkey();
    feed_events = $nostr_events.filter((event) => event.pubkey !== active_hexpubkey);
    initializing = false;
  });

</script>


<div class="max-w-2xl mx-auto">
  {#if initializing}
    <div class="d-flex justify-center content-center">
      <div class="text-center opacity-70">
        <Spinner width="10"/>
      </div>
    </div>
  {:else}
    <div>
      {#if feed_events.length > 0}
        {#each feed_events as event}
          <div class="my-6">
            <NostrPost {event} user={ nostr_followees.find_user(event.pubkey) } />
          </div>
        {/each}
      {:else}
        <div class="text-center">No posts found. Try adding more followers in settings.</div>
      {/if}
    </div>
  {/if}
</div>



<style lang="postcss">
</style>
