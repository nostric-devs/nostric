<script lang="ts">
  import Avatar from "$lib/components/user/Avatar.svelte";
  import { getPath, ROUTES } from "$lib/utils/routes";
  import type { NDKUser } from "@nostr-dev-kit/ndk";
  import { AuthStates, authUser } from "$lib/stores/Auth";
  import { nostrHandler } from "$lib/nostr";
  import UserFollowLoadingSkeleton from "$lib/components/user/follow/UserFollowLoadingSkeleton.svelte";
  import FollowButton from "$lib/components/user/follow/FollowButton.svelte";
  import { onMount } from "svelte";

  let profilePromise: Promise<NDKUser | undefined>;

  onMount(async () => {
    if (user !== undefined && user.profile == undefined) {
      profilePromise = nostrHandler.fetchUserProfileByPublicKey(user.pubkey);
    } else {
      profilePromise = Promise.resolve(user);
    }
  });

  export let user: NDKUser | undefined = undefined;
  export let disabled: boolean = false;
</script>

{#await profilePromise}
  <UserFollowLoadingSkeleton />
{:then user}
  {#if user}
    <div
      class="post-head mx-auto my-5 flex md:flex-row flex-col items-center w-full"
    >
      <div class="flex-grow flex items-center overflow-hidden">
        <a
          href={getPath(ROUTES.USER, user.pubkey)}
          class="flex items-center w-full"
        >
          <div class="w-[50px] shrink-0">
            <Avatar profile={user?.profile} />
          </div>
          <div class="flex flex-col mx-4 flex-grow min-w-0 overflow-hidden">
            <div class="text-md font-bold truncate">
              {user.profile?.displayName || user.profile?.name || "Anonymous"}
            </div>
            <div class="text-sm truncate">
              {user.npub}
            </div>
          </div>
        </a>
      </div>
      {#if $authUser.authState !== AuthStates.ANONYMOUS}
        <div class="flex-none ml-2">
          <FollowButton {user} bind:disabled />
        </div>
      {/if}
    </div>
  {/if}
{/await}

<style>
  .truncate {
    display: inline-block;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
