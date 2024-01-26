<script lang="ts">
  import Post from "$lib/components/post/Post.svelte";
  import type { NDKEvent, NDKUser, NDKUserProfile } from "@nostr-dev-kit/ndk";
  import { onMount } from "svelte";
  import Avatar from "$lib/components/user/Avatar.svelte";
  import { nostrHandler } from "$lib/nostr";
  import { NDKKind } from "@nostr-dev-kit/ndk";
  import UserProfileLoadingSkeleton from "$lib/components/user/profile/UserProfileLoadingSkeleton.svelte";
  import PostLoadingSkeleton from "$lib/components/post/PostLoadingSkeleton.svelte";
  import { getPath, ROUTES } from "$lib/utils/routes";
  import { AuthStates, authUser } from "$lib/stores/Auth";
  import { followedUsers } from "$lib/stores/FollowedUsers";
  import { Circle } from "svelte-loading-spinners";
  import { Share } from "svelte-feathers";
  import { clipboard } from "@skeletonlabs/skeleton";
  import { page } from "$app/stores";
  import FollowButton from "$lib/components/user/follow/FollowButton.svelte";
  import { getToastStore } from "@skeletonlabs/skeleton";
  import InfiniteScrollContainer from "$lib/components/infinite-scroll/InfiniteScrollContainer.svelte";

  let profile: NDKUserProfile | undefined;
  let userEventsPromise: Promise<NDKEvent[]>;
  let userFollowersPromise: Promise<NDKUser[]>;
  let userFollowingPromise: Promise<NDKUser[]>;

  const toastStore = getToastStore();

  onMount(async () => {
    profile = user?.profile;
    if (events === undefined) {
      userEventsPromise = nostrHandler.fetchEventsByAuthorPublicKey(
        user.pubkey,
      );
      userEventsPromise.then((result) => (events = result));
    } else {
      userEventsPromise = Promise.resolve(events);
    }
    userFollowersPromise = nostrHandler.fetchUserFollowersByPublicKey(
      user.pubkey,
      true,
    );
    if (
      $authUser.authState !== AuthStates.ANONYMOUS &&
      $authUser.nostr &&
      $authUser.nostr?.getPublicKey() === user.pubkey
    ) {
      userFollowingPromise = Promise.resolve($followedUsers);
    } else {
      userFollowingPromise = nostrHandler.fetchUserFollowingByPublicKey(
        user.pubkey,
        true,
      );
    }
  });

  export let user: NDKUser;
  export let events: NDKEvent[] | undefined = undefined;
</script>

<div
  class="overflow-hidden flex flex-col"
  style="max-height: calc(100% - 20px)"
>
  {#if user}
    <div class="flex items-center">
      <h1 class="h1 m-4">User profile</h1>
      <div class="flex ml-auto mr-3">
        {#if $authUser.authState !== AuthStates.ANONYMOUS && $authUser.nostr.getPublicKey() !== $page.params.slug && $page.url.pathname !== getPath(ROUTES.PROFILE)}
          <FollowButton {user} />
        {/if}
        <div class="w-[130px] ml-2">
          <button
            type="button"
            use:clipboard={$page.url.pathname}
            on:click={() =>
              toastStore.trigger({
                message: "User URL copied to clipboard",
                background: "variant-filled-success",
              })}
            class="btn variant-filled-primary mr-4 font-medium w-full"
          >
            <span>
              <Share size="15" class="lg:mx-auto xl:mx-0" />
            </span>
            <span class="text-sm">Share</span>
          </button>
        </div>
      </div>
    </div>
    <div class="mx-auto flex md:flex-row flex-col ml-4 my-8">
      <div class="w-1/5">
        <Avatar {profile} />
      </div>
      <div class="w-4/5 px-4 flex flex-col justify-center">
        <div class="font-bold text-xl">
          {profile?.displayName || profile?.name}
        </div>
        <span class="text-md">@{profile?.name}</span>
        <div class="text-sm break-words">{user?.npub}</div>
        <div class="flex mt-4">
          <a
            href={getPath(ROUTES.USER, user?.pubkey || "", ROUTES.FOLLOWERS)}
            class="flex flex-col items-center mr-6 p-2 follow hover:bg-primary-hover-token rounded-md transition"
          >
            <span>Followers</span>
            {#await userFollowersPromise}
              <div class="mt-2">
                <Circle size="25" color="black" unit="px" />
              </div>
            {:then userFollowers}
              <span class="text-4xl font-bold">
                {userFollowers ? userFollowers.length : 0}
              </span>
            {/await}
          </a>
          <a
            href={getPath(ROUTES.USER, user?.pubkey || "", ROUTES.FOLLOWING)}
            class="flex flex-col items-center p-2 follow hover:bg-primary-hover-token rounded-md transition"
          >
            <span>Following</span>
            {#await userFollowingPromise}
              <div class="mt-2">
                <Circle size="25" color="black" unit="px" />
              </div>
            {:then userFollowing}
              <span class="text-4xl font-bold">
                {userFollowing ? userFollowing.length : 0}
              </span>
            {/await}
          </a>
        </div>
      </div>
    </div>
    <div class="m-4 mb-3">
      {profile?.bio || ""}
    </div>
  {:else}
    <h1 class="h1 m-4">User profile</h1>
    <UserProfileLoadingSkeleton />
  {/if}

  <hr class="!border-t-2 mx-4" />

  <div class="text-3xl my-8 mx-4 font-bold">Posts</div>
  <hr class="!border-t-2 mx-4" />

  {#await userEventsPromise}
    <div class="m-5">
      {#each { length: 6 } as _}
        <PostLoadingSkeleton />
      {/each}
    </div>
  {:then fetchedEvents}
    {#if fetchedEvents && events && events.length > 0}
      {#key events}
        <InfiniteScrollContainer allItems={events} initialNumberOfItems={5}>
          <svelte:fragment slot="listItem" let:item>
            <Post event={item} author={user} />
          </svelte:fragment>
        </InfiniteScrollContainer>
      {/key}
    {:else}
      <div class="px-4">No posts found for the given user so far.</div>
    {/if}
  {/await}
</div>
