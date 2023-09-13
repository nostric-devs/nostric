<script lang="ts">
  import { nostr_service } from "../../store/auth";
  import { nostr_events } from "../../store/nostr";
  import Spinner from "../Spinner.svelte";
  import UserPost from "../posts/UserPost.svelte";

  let message : string = "";
  let publishing : boolean = false;

  $: $nostr_events, publishing = false;

  const create_post = async () => {
    publishing = true;
    await nostr_service.publish_event(message);
    message = "";
  }

  export let profile;

</script>

<div class="form-control">
  <textarea bind:value={message} class="textarea textarea-bordered" maxlength="200" placeholder="Create a new post"></textarea>
</div>
<div class="text-right">
  <button
    disabled="{ !message || publishing }"
    class="btn btn-primary mt-2 text-right"
    on:click={ async () => await create_post() }
  >
    {#if publishing}
      <Spinner/>
    {/if}
    <span class="text-white">Create post</span>
  </button>
</div>

<div class="divider"></div>

<div class="mt-12">
  {#each $nostr_events as event}
    <UserPost { profile } { event } />
  {/each}
</div>
