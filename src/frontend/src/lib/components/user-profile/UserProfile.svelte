<script lang="ts">
  import Post from "$lib/components/post/Post.svelte";
  import type { NDKEvent, NDKUser, NDKUserProfile } from "@nostr-dev-kit/ndk";
  import { onMount } from "svelte";
  import Avatar from "$lib/components/user-profile/Avatar.svelte";
  import { nostrHandler } from "$lib/nostr";
  import { NDKKind } from "@nostr-dev-kit/ndk";
  import UserProfileLoadingSkeleton from "$lib/components/user-profile/UserProfileLoadingSkeleton.svelte";
  import PostLoadingSkeleton from "$lib/components/post/PostLoadingSkeleton.svelte";

  let profile: NDKUserProfile | undefined;
  let userEvents: Promise<NDKEvent[]>;

  onMount(async () => {
    profile = user?.profile;
    if (!events) {
      userEvents = await nostrHandler.fetchEventsByAuthorPubkey(user.pubkey);
    }
  });

  export let user: NDKUser;
  export let events: NDKEvent[] = [];

  $: if (events) {
    userEvents = Promise.resolve(events);
  }
</script>

<h1 class="h1 m-4">User profile</h1>

{#if user}
<div class="mx-auto flex md:flex-row flex-col ml-4 my-8">
  <div class="w-1/5">
    <Avatar {profile} />
  </div>
  <div class="w-4/5 px-4 flex flex-col justify-center">
    <div class="font-bold text-xl">{profile?.displayName || profile?.name}</div>
    <span class="text-md">@{profile?.name}</span>
    <div class="text-sm break-words">{user?.npub}</div>
  </div>
</div>
<div class="m-4 mb-10">
  {profile?.bio || ""}
</div>
{:else}
  <UserProfileLoadingSkeleton />
{/if}

<hr class="!border-t-2 mx-4" />

<div class="text-3xl my-8 mx-4 font-bold">Posts</div>

{#await userEvents}
  {#each {length:6} as _}
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
