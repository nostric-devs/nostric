<script lang="ts">
  import Post from "$lib/components/post/Post.svelte";
  import { onMount } from "svelte";
  import type { NDKEvent } from "@nostr-dev-kit/ndk";
  import { nostrHandler } from "$lib/nostr";
  import { page } from "$app/stores";
  import { Avatar } from "@skeletonlabs/skeleton";
  import { AuthStates, authUser } from "$lib/stores/Auth";
  import { Bookmark, Heart, MessageCircle, Share } from "svelte-feathers";

  let eventPromise: Promise<NDKEvent>;
  let repliesPromise: Promise<NDKEvent[]>;

  let reply: string = "";

  onMount(async () => {
    eventPromise = nostrHandler.fetchEventById($page.params.id);
    repliesPromise = nostrHandler.fetchEventReplies($page.params.id);
  });
</script>

<h1 class="h1 m-4">Post detail</h1>

{#await eventPromise then event}
  {#if event}
    <Post {event} />
  {/if}
{/await}

<h3 class="h3 m-6">Comments</h3>
{#await repliesPromise then replies}
  {#if replies}
    {#each replies as reply}
      <Post event={reply} />
    {/each}
  {/if}
{/await}
<div>
  <form class="modal-form m-5">
    <label class="label">
      <textarea
        class="textarea px-3 py-2"
        rows="3"
        bind:value={reply}
        placeholder="Start typing your reply"
      />
    </label>
    <div class="flex justify-end">
      <button class="btn variant-filled mt-2">Post reply</button>
    </div>
  </form>
</div>
<div class="m-5">
  <!-- Only display comment to the post/event displayed, to see comments on the comment user needs to click on the comment to go down the rabbit hole -->
  <div class="grid grid-cols-[auto_1fr] gap-2 my-4">
    <!-- Link to the author -->
    <a href="#">
      <Avatar src="https://i.pravatar.cc/?img=48" width="w-12" />
    </a>
    <div class="card p-4 variant-soft rounded-tl-none space-y-2">
      <header class="flex justify-between items-center">
        <!-- Link to the author -->
        <a href="#">
          <p class="font-bold">John Doe</p>
        </a>
        <small class="opacity-50">2023-02-1 14:00</small>
      </header>
      <!-- Link to the post to see comments down the rabbit hole -->
      <a href="#">
        <p>
          Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Morbi
          commodo, ipsum sed pharetra gravida, orci magna rhoncus neque, id
          pulvinar odio lorem non turpis. Nullam sit amet enim. Suspendisse id
          velit vitae ligula volutpat condimentum. Aliquam erat volutpat. Sed
          quis velit. Nulla facilisi. Nulla libero. Vivamus pharetra posuere
          sapien.
        </p>
      </a>
      {#if $authUser.authState !== AuthStates.ANONYMOUS}
        <div class="flex justify-between pt-2">
          <Heart size="20" class="cursor-pointer" />
          <MessageCircle size="20" class="cursor-pointer" />
          <Share size="20" class="cursor-pointer" />
          <Bookmark size="20" class="cursor-pointer" />
        </div>
      {/if}
    </div>
  </div>
  <!-- Second comment -->
  <div class="grid grid-cols-[auto_1fr] gap-2 my-4">
    <!-- Link to the author -->
    <a href="#">
      <Avatar src="https://i.pravatar.cc/?img=48" width="w-12" />
    </a>
    <div class="card p-4 variant-soft rounded-tl-none space-y-2">
      <header class="flex justify-between items-center">
        <!-- Link to the author -->
        <a href="#">
          <p class="font-bold">John Doe</p>
        </a>
        <small class="opacity-50">2023-02-1 14:00</small>
      </header>
      <!-- Link to the post to see comments down the rabbit hole -->
      <a href="#">
        <p>
          Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Morbi
          commodo, ipsum sed pharetra gravida, orci magna rhoncus neque, id
          pulvinar odio lorem non turpis. Nullam sit amet enim. Suspendisse id
          velit vitae ligula volutpat condimentum. Aliquam erat volutpat. Sed
          quis velit. Nulla facilisi. Nulla libero. Vivamus pharetra posuere
          sapien.
        </p>
      </a>
      {#if $authUser.authState !== AuthStates.ANONYMOUS}
        <div class="flex justify-between pt-2">
          <Heart size="20" class="cursor-pointer" />
          <MessageCircle size="20" class="cursor-pointer" />
          <Share size="20" class="cursor-pointer" />
          <Bookmark size="20" class="cursor-pointer" />
        </div>
      {/if}
    </div>
  </div>
</div>
