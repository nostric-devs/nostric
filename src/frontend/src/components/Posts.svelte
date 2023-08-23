<script lang="ts">
  import { nostric_user, nostr_service } from "../store/auth";
  import { nostr_events } from "../store/nostr";

  let profile = nostric_user.get_profile();
  let private_key = nostric_user.get_private_key();
  let message = null;

  const create_post = async () => {
    let event = nostr_service.create_event(message);
    await nostr_service.publish_event(event);
    message = null;
  }

  export let currentRoute;
  export let params;

</script>

<div>
  <div>Your profile</div>
  <div class="avatar">
    <div class="w-24 rounded mr-4">
      <img src="{profile.avatar_url}" alt="avatar"/>
    </div>
  </div>
  <div class="user-details text-left">
    <div class="mb-2 text-xl">
      @{profile.username}
    </div>
    <div>
      {profile.about}
    </div>
  </div>
</div>

<div class="mt-12">
  <div>Create post</div>
  <input bind:value={ message } placeholder="Input message" class="input input-bordered"/>
  <button
    disabled="{ !message }"
    class="btn btn-primary"
    on:click={async () => await create_post()}
  >
    Create
  </button>
</div>

<div class="mt-12">
  <div>Past posts here:</div>
  {#each $nostr_events as event}
    <div>{event.created_at}: {event.content}</div>
  {/each}
</div>

