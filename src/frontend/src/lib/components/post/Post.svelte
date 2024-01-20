<script lang="ts">
  import { Bookmark, Heart, MessageCircle, Share } from "svelte-feathers";
  import { getPath, ROUTES } from "$lib/utils/routes";
  import type { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
  import { events } from "$lib/stores/Events";
  import { nostrHandler, Reactions } from "$lib/nostr";
  import Avatar from "$lib/components/user/Avatar.svelte";
  import { Avatar as AvatarSkeleton } from "@skeletonlabs/skeleton";
  import { onMount } from "svelte";
  import dayjs from "dayjs";
  import { AuthStates, authUser } from "$lib/stores/Auth";
  import PostLoadingSkeleton from "$lib/components/post/PostLoadingSkeleton.svelte";

  let isLiked: boolean = false;
  let eventReactions: NDKEvent[] = [];
  let authorPromise: Promise<NDKUser | undefined>;
  let dateCreated: string = "";

  $: $events && event, (eventReactions = events.getEventReactions(event));
  $: isLiked =
    eventReactions.length > 0 && eventReactions[0].content === Reactions.LIKE;
  $: if (event && event.created_at) {
    dateCreated = dayjs(event.created_at * 1000).format("YYYY-MM-DD HH:MM");
  }

  function reactToEvent() {
    if (
      $authUser.nostr &&
      event &&
      $authUser.authState !== AuthStates.ANONYMOUS
    ) {
      if (isLiked) {
        $authUser.nostr.dislikeEvent(event);
      } else {
        $authUser.nostr.likeEvent(event);
      }
    }
  }

  onMount(async () => {
    if (event && author === undefined) {
      authorPromise = nostrHandler.fetchUserProfileByPublicKey(
        event.author.pubkey,
      );
    } else {
      authorPromise = Promise.resolve(author);
    }
  });

  export let event: NDKEvent | undefined = undefined;
  export let author: NDKUser | undefined = undefined;
</script>

{#await authorPromise}
  <PostLoadingSkeleton />
{:then author}
  {#if author && event}
    <div class="card card-hover p-5 m-5">
      <div
        class="post-head mx-auto flex md:flex-row flex-col justify-between items-start"
      >
        <a
          href={getPath(ROUTES.USER, author?.pubkey || "")}
          class="flex items-start"
        >
          <div class="w-11 mr-2">
            <Avatar profile={author.profile} />
          </div>
          <div>
            <div class="font-bold">
              {author?.profile?.displayName || author?.profile?.name || ""}
            </div>
            <span class="text-sm">@{author?.profile?.name || ""}</span>
          </div>
        </a>

        <div>
          <span class="text-sm">{dateCreated}</span>
        </div>
      </div>

      <a href={getPath(ROUTES.POST, event?.id)}>
        <div class="my-4 text-sm text-pretty max-w-full break-words">
          {event?.content}
        </div>
      </a>

      {#if $authUser.authState !== AuthStates.ANONYMOUS}
        <div class="flex justify-between mt-4">
          <Heart
            size="20"
            on:click={reactToEvent}
            class="cursor-pointer {isLiked
              ? 'fill-red-500 stroke-red-500'
              : ''}"
          />
          <MessageCircle size="20" class="cursor-pointer" />
          <Share size="20" class="cursor-pointer" />
          <Bookmark size="20" class="cursor-pointer" />
        </div>
      {/if}
    </div>
    <!-- This represents how a reply to a post should be displayed in the feed -->
    <!-- This should not be visible for every post by default, only when somebody I follow gives a comment to a post recently (like on Twitter) so we can see the original post they give reaction to -->
    <div class="grid grid-cols-[auto_1fr] gap-2 ml-8 mr-5 mb-8">
      <!-- Link to the author -->
      <a href="#">
        <AvatarSkeleton src="https://i.pravatar.cc/?img=48" width="w-12" />
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
          <p>Hey, I am replying to your post. What you write is super cool.</p>
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
  {/if}
{/await}
