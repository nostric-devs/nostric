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
  import { Share, UserPlus } from "svelte-feathers";
  import { clipboard } from "@skeletonlabs/skeleton";
  import { page } from "$app/stores";

  let profile: NDKUserProfile | undefined;
  let userEvents: Promise<NDKEvent[]>;
  let userFollowersPromise: Promise<NDKUser[]>;
  let userFollowingPromise: Promise<NDKUser[]>;

  onMount(async () => {
    profile = user?.profile;
    if (events === undefined) {
      userEvents = nostrHandler.fetchEventsByAuthorPublicKey(user.pubkey);
    }
    userFollowersPromise = nostrHandler.fetchUserFollowersByPublicKey(
      user.pubkey,
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
      );
    }
  });

  export let user: NDKUser;
  export let events: NDKEvent[] | undefined = undefined;

  let copied = false;

  function onClickHandler() {
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 1000);
  }

  $: if (events) {
    userEvents = Promise.resolve(events);
  }
</script>

{#if user}
  <div class="flex justify-between items-center">
    <h1 class="h1 m-4">User profile</h1>
    <!-- Follow Button, if I already follow the profile, there should be unfollow button -->
    <!-- Shouldn't be visible if I am looking at my profile -->
    <button type="button" class="btn variant-filled-primary font-medium btn-lg">
      <span>
        <UserPlus size="20" class="lg:mx-auto xl:mx-0"></UserPlus>
      </span>
      <span class="text-sm"> Follow </span>
    </button>
    <!-- Button for cpying profile's URL -->
    <button
      type="button"
      use:clipboard={$page.url}
      on:click={onClickHandler}
      class="btn variant-filled-primary mr-4 font-medium btn-lg"
    >
      <span>
        <Share size="20" class="lg:mx-auto xl:mx-0"></Share>
      </span>
      <span class="text-sm"> {copied ? "Copied" : "Share"} </span>
    </button>
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
            <div class="mt-2"><Circle size="25" color="black" unit="px" /></div>
          {:then userFollowers}
            <span class="text-4xl font-bold"
              >{userFollowers ? userFollowers.length : 0}</span
            >
          {/await}
        </a>
        <a
          href={getPath(ROUTES.USER, user?.pubkey || "", ROUTES.FOLLOWING)}
          class="flex flex-col items-center p-2 follow hover:bg-primary-hover-token rounded-md transition"
        >
          <span>Following</span>
          {#await userFollowingPromise}
            <div class="mt-2"><Circle size="25" color="black" unit="px" /></div>
          {:then userFollowing}
            <span class="text-4xl font-bold"
              >{userFollowing ? userFollowing.length : 0}</span
            >
          {/await}
        </a>
      </div>
    </div>
  </div>
  <div class="m-4 mb-10">
    {profile?.bio || ""}
  </div>
{:else}
  <h1 class="h1 m-4">User profile</h1>
  <UserProfileLoadingSkeleton />
{/if}

<hr class="!border-t-2 mx-4" />

<div class="text-3xl my-8 mx-4 font-bold">Posts</div>

{#await userEvents}
  {#each { length: 6 } as _}
    <PostLoadingSkeleton />
  {/each}
{:then fetchedEvents}
  {#if fetchedEvents && fetchedEvents.length > 0}
    {#each fetchedEvents.filter((e) => e.kind === NDKKind.Text) as event}
      <Post {event} author={user} />
    {/each}
  {:else}
    <div class="px-4">No posts found for the given user so far.</div>
  {/if}
{/await}
