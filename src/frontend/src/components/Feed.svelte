<script lang="ts">
  import { navigateTo } from "svelte-router-spa";
  import { nostric_user, nostr_service } from "../store/auth";
  import { nostr_events } from "../store/nostr";
  import { Icon } from 'svelte-feathers';
  import Alert from "utils/Alert.svelte";
  import { ROUTES } from "../router/routes";
  import Spinner from "utils/Spinner.svelte";
  import { Kind, nip19 } from "nostr-tools";
  import NostrPost from "./nostr/NostrPost.svelte";

  // let profile = {};
  // let private_key = "";
  // let message = null;
  // let publishing = false;
  // let npub = "";
  //
  // try {
  //   profile = nostric_user.get_profile();
  //   private_key = nostric_user.get_private_key();
  //   message = null;
  //   publishing = false;
  //   npub = nip19.npubEncode(profile.pk);
  // } catch {
  // }
  //
  // const create_post = async () => {
  //   publishing = true;
  //   let event = nostr_service.create_event(message, Kind.Text);
  //   await nostr_service.publish_event(event);
  //   message = null;
  // }
  //
  // $: $nostr_events, publishing = false;

  export let currentRoute;
  export let params;

</script>

<div class="mt-12">
  {#each [{}] as event}
    <NostrPost {event}></NostrPost>
  {/each}
</div>

<style lang="postcss">
</style>
