<script lang="ts">
  import { Navigate } from "svelte-router-spa";
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

<div class="max-w-xl mx-auto text-right mt-8">
  <Navigate to="/edit-profile">
    <button class="btn" title="Settings">
      <svg class="w-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
      </svg>
    </button>
  </Navigate>
</div>
<div class="max-w-xl mx-auto mt-8">
  <div class=" flex items-center">
    <!-- Avatar Picture -->
    <div class="avatar">
      <div class="w-32 rounded mr-4">
        <img src="{profile.avatar_url}" alt="avatar"/>
      </div>
    </div>

    <!-- Username & Bio Container -->
    <div class="ml-4">
        <h1 class="text-xl font-bold">@{profile.username}</h1>
        <p class="text-sm">{profile.about}</p>
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
      disabled="{ !message }"
      class="btn btn-primary mt-2 text-right"
      on:click={async () => await create_post()}
    >
      Create
    </button>
  </div>
  <div class="divider"></div>
  <div class="mt-12">
    <!-- <div class="text-base">Your posts</div> -->
    {#each $nostr_events as event}
      <div class="post mb-4 p-2 rounded">
        <div class=" flex items-start">
          <!-- Avatar Picture -->
          <div class="avatar">
            <div class="w-16 rounded mr-4">
              <img src="{profile.avatar_url}" alt="avatar"/>
            </div>
          </div>
      
          <!-- Username & Bio Container -->
          <div class="ml-2">
              <div>{event.created_at}</div>
              <p class="text-base mt-2">{event.content}</p>
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