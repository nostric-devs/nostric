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
    <div class="post-head mx-auto my-5 flex md:flex-row flex-col items-center">
      <div class="grow">
        <a href={getPath(ROUTES.USER, user.pubkey)} class="flex items-center">
          <div class="w-[65px]">
            <Avatar profile={user?.profile} />
          </div>
          <div class="max-w-[350px] mx-4">
            <div class="text-sm font-bold">
              {user.profile?.displayName || user.profile?.name || "Anonymous"}
            </div>
            <div class="text-sm break-words">
              {user.npub}
            </div>
          </div>
        </a>
      </div>
      {#if $authUser.authState !== AuthStates.ANONYMOUS}
        <FollowButton {user} bind:disabled />
      {/if}
    </div>
  {/if}
{/await}
