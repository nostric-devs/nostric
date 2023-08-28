<script lang="ts">
  import { navigateTo } from "svelte-router-spa";
  import { nostric_user, nostr_service } from "../store/auth";
  import { nostr_events } from "../store/nostr";
  import { Icon } from 'svelte-feathers';
  import Alert from "./Alert.svelte";
  import { ROUTES } from "../router/routes";
  import MegaCoolUltraSpinner from "./MegaCoolUltraSpinner.svelte";

  let profile = nostric_user.get_profile();
  let private_key = nostric_user.get_private_key();
  let message = null;
  let publishing = false;

  const create_post = async () => {
    publishing = true;
    let event = nostr_service.create_event(message);
    await nostr_service.publish_event(event);
    message = null;
  }

  $: $nostr_events, publishing = false;

  export let currentRoute;
  export let params;

</script>

<div class="mt-4 mb-12">
  <Alert/>
</div>

<div class="max-w-xl mx-auto text-right mt-8">
  <button class="btn" title="Settings" on:click={ () => navigateTo(ROUTES.EDIT_PROFILE) }>
    <Icon name="settings" />
  </button>
</div>
<div class="max-w-xl mx-auto mt-8">
  <div class=" flex items-center">
    <!-- Avatar Picture -->
    {#if profile.avatar_url}
      <div class="avatar">
        <div class="w-32 rounded mr-4">
          <img src="{ profile.avatar_url }" alt="avatar"/>
        </div>
      </div>
    {:else}
      <div class="avatar placeholder">
        <div class="bg-neutral-focus text-neutral-content rounded mr-4 w-24 h-24">
          <span class="text-3xl">{ profile.username[0] }</span>
        </div>
      </div>
    {/if}
    <!-- Username & Bio Container -->
    <div class="ml-4">
        <h1 class="text-xl font-bold">@{ profile.username }</h1>
        <p class="text-sm">{ profile.about }</p>
    </div>
  </div>
</div>

<div class="max-w-xl mx-auto mt-12">
  <div class="divider"></div>
  <div class="form-control">
    <label class="label">
      <span class="label-text text-base">Create a new post</span>
    </label>
    <textarea bind:value={message} class="textarea textarea-bordered" maxlength="200" placeholder="Write something..."></textarea>
  </div>
  <div class="text-right">
    <button
      disabled="{ !message || publishing }"
      class="btn btn-primary mt-2 text-right"
      on:click={ async () => await create_post() }
    >
      {#if publishing}
        <MegaCoolUltraSpinner/>
      {/if}
      <span class="text-white">Create post</span>
    </button>
  </div>
  <div class="divider"></div>
  <div class="mt-12">
    {#each $nostr_events.reverse() as event}
      <div class="post mb-4 p-2 rounded">
        <div class=" flex items-start">
          <!-- Avatar Picture -->
          {#if profile.avatar_url}
            <div class="avatar">
              <div class="w-16 rounded mr-4">
                <img src="{ profile.avatar_url }" alt="avatar"/>
              </div>
            </div>
          {:else}
            <div class="avatar placeholder">
              <div class="bg-neutral-focus text-neutral-content rounded mr-4 w-16 h-16">
                <span class="text-2xl">{ profile.username[0] }</span>
              </div>
            </div>
          {/if}
          <!-- Username & Bio Container -->
          <div class="ml-2">
              <div>{ event.created_at_time }</div>
              <p class="text-base mt-2">{ event.content }</p>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>


<style lang="postcss">
 .post {
    background-color:rgb(246, 245, 245);
 }
</style>
