<script lang="ts">
  import { onMount } from "svelte";
  import NDKUserProfile, { NDKUser } from "@nostr-dev-kit/ndk";
  import Spinner from "../utils/Spinner.svelte";
  import NostrPost from "../nostr/NostrPost.svelte";
  import NostrAvatar from "../nostr/NostrAvatar.svelte";
  import { nostr_service } from "../../store/auth";
  import { nostr_events, nostr_followees } from "../../store/nostr";
  import { Icon } from "svelte-feathers";

  let user : NDKUser = null;
  let profile : NDKUserProfile = null;
  let private_key : string = "";
  let initializing : boolean = true;
  let hexpubkey : string = "";
  let publishing : boolean = false;
  let message : string | null = null;

  export let currentRoute;
  export let params;

  $: $nostr_events, publishing = false;

  const create_post = async () => {
    publishing = true;
    let event = nostr_service.publish_event(message);
    await nostr_service.publish_event(event);
    message = null;
  }

  // TODO what is such profile does not exist in nostr, but exists in our canister?
  onMount(async () => {
    user = await nostr_service.get_user();
    hexpubkey = user.hexpubkey();
    profile = user.profile;
    private_key = nostr_service.get_private_key();
    initializing = false;
    console.log(user);
  });

</script>

{#if initializing}
  <div class="d-flex justify-center content-center">
    <div class="text-center opacity-70">
      <Spinner width="10"/>
    </div>
  </div>
{:else}
  <div class="drawer">

    <input id="add-followees-drawer" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content">

      <div class="max-w-2xl mx-auto">
        <div class="flex items-center">
          <div><NostrAvatar profile={ user.profile } size="170"/></div>
          <div class="ml-4 break-all">
            <h1 class="text-3xl font-bold mb-2">@{ profile?.name }</h1>
            <div class="text-gray-500 text-sm" title="Your public key.">{ hexpubkey }</div>
            <div class="text-sm mt-1">{ profile?.bio }</div>

            <div class="stats">
              <div class="stat">
                <div class="stat-title">Follows</div>
                <div class="stat-value">{ $nostr_followees.length }</div>
              </div>
              <div class="stat">
                <div class="stat-title">Following</div>
                <div class="stat-value">4,200</div>
              </div>
              <div class="stat">
                <div class="stat-title">Relays</div>
                <div class="stat-value">1,200</div>
              </div>
            </div>

          </div>
        </div>


        <div class="divider"></div>
        <div class="form-control">
          <textarea
            bind:value={message}
            class="textarea textarea-lg border-primary rounded-3xl border-2"
            maxlength="200"
            placeholder="Write something..."></textarea>
        </div>

        <div class="flex justify-between mt-6">
          <div>
            <label for="add-followees-drawer" class="btn btn-primary drawer-button text-white">
              <Icon name="image"></Icon>
              Upload image
            </label>
          </div>
          <div>
            <button
              disabled={ !message || publishing }
              class="btn btn-primary text-right"
              class:btn-disabled={ !message || publishing }
              on:click={ async () => await create_post() }
            >
              {#if publishing}
                <Spinner/>
              {/if}
              <span class="text-white">Create post</span>
            </button>
          </div>
        </div>
        <div class="divider"></div>

        <div class="mt-12">
          {#each $nostr_events.filter((event) => event.pubkey === hexpubkey) as event}
            <NostrPost {event} {user}/>
          {/each}
        </div>
      </div>

    </div>
    <div class="drawer-side">
      <label for="add-followees-drawer"  class="drawer-overlay"></label>
      <div id="drawer-bottom-add" class="fixed bottom-0 h-2/3 left-0 right-0 z-40 bg-base-100 mx-10 rounded-2xl p-10 overflow-y-auto transition-transform transform-none" tabindex="-1" aria-labelledby="drawer-bottom-label">
        add images here todo
      </div>
    </div>
  </div>
{/if}



<style lang="postcss">
  .drawer-toggle:checked~.drawer-side>*:not(.drawer-overlay) {
    transform: translateY(0) !important;
  }
  .drawer-side>*:not(.drawer-overlay) {
    transform: translateY(100%) !important;
  }
</style>
