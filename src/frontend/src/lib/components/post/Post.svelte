<script lang="ts">
  import { Bookmark, Heart, MessageCircle, Share } from "svelte-feathers";
  import { getPath, ROUTES } from "$lib/utils/routes";
  import type { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
  import { events } from "$lib/stores/Events";
  import { nostrHandler, NostrUserHandler, Reactions } from "$lib/nostr";
  import Avatar from "$lib/components/user-profile/Avatar.svelte";
  import { onMount } from "svelte";
  import dayjs from "dayjs";
  import { AuthStates, authUser } from "$lib/stores/Auth";
  import PostLoadingSkeleton from "$lib/components/post/PostLoadingSkeleton.svelte";

  let isLiked: boolean = false;
  let eventReactions: NDKEvent[] = [];
  let nostrUserHandler: NostrUserHandler | undefined;
  let authorPromise: Promise<NDKUser | undefined>;
  let dateCreated: string = "";

  $: $events && event, (eventReactions = events.getEventReactions(event));
  $: isLiked =
    eventReactions.length > 0 && eventReactions[0].content === Reactions.LIKE;
  $: if (event && event.created_at) {
    dateCreated = dayjs(event.created_at * 1000).format("YYYY-MM-DD HH:MM");
  }

  function reactToEvent() {
    if (nostrUserHandler && event) {
      if (isLiked) {
        nostrUserHandler.dislikeEvent(event);
      } else {
        nostrUserHandler.likeEvent(event);
      }
    }
  }

  onMount(async () => {
    if ($authUser.authState !== AuthStates.ANONYMOUS) {
      nostrUserHandler = $authUser.nostr;
    }
    if (event && !author) {
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
        <a href={getPath(ROUTES.USER, author?.pubkey || "")} class="flex items-start">
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

      <a
        href={getPath(ROUTES.POST, event?.id)}
      >
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
  {/if}
{/await}
