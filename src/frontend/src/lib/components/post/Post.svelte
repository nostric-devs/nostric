<script lang="ts">
  import { Heart, Share, MessageCircle, Bookmark } from "svelte-feathers";
  import { get_path, ROUTES } from "$lib/utils/routes";
  import type { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
  import { events } from "$lib/stores/Events";
  import { NostrUserHandler, Reactions } from "$lib/nostr";
  import Avatar from "$lib/components/user-profile/Avatar.svelte";
  import { onMount } from "svelte";
  import { nostrHandler } from "$lib/nostr";
  import dayjs from "dayjs";
  import { authUser } from "$lib/stores/Auth";

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
    if (!authUser.isAnonymous()) {
      nostrUserHandler = NostrUserHandler.getInstance();
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
  <section class="card p-4 m-5">
    <div class="grid grid-cols-10 gap-1">
      <div class="col-span-6 grid grid-cols-4 items-center">
        <div class="placeholder-circle w-12 animate-pulse" />
        <div class="col-span-3">
          <div class="placeholder mb-1 animate-pulse" />
          <div class="placeholder animate-pulse" />
        </div>
      </div>
      <div class="col-span-4 grid grid-cols-2">
        <div></div>
        <div class="placeholder animate-pulse" />
      </div>
    </div>
    <div class="mt-4">
      <div class="placeholder mb-2 animate-pulse" />
      <div class="placeholder mb-2 animate-pulse" />
    </div>
    <div class="flex justify-between mt-4">
      <div class="placeholder-circle w-8 animate-pulse" />
      <div class="placeholder-circle w-8 animate-pulse" />
      <div class="placeholder-circle w-8 animate-pulse" />
      <div class="placeholder-circle w-8 animate-pulse" />
    </div>
  </section>
{:then author}
  {#if author && event}
    <div class="card card-hover p-5 m-5">
      <div
        class="post-head mx-auto flex md:flex-row flex-col justify-between items-start"
      >
        <a
          href={get_path(ROUTES.USER, author?.pubkey || "")}
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

      <a href={get_path(ROUTES.POST, event?.id)}>
        <div class="my-4 text-sm text-pretty max-w-full break-words">
          {event?.content}
        </div>
      </a>

      {#if !authUser.isAnonymous()}
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
