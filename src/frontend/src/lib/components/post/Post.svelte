<script lang="ts">
  import { Bookmark, Heart, MessageCircle, Share } from "svelte-feathers";
  import { getPath, ROUTES } from "$lib/utils/routes";
  import type { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
  import { nostrHandler } from "$lib/nostr";
  import Avatar from "$lib/components/user/Avatar.svelte";
  import { onMount } from "svelte";
  import dayjs from "dayjs";
  import { AuthStates, authUser } from "$lib/stores/Auth";
  import PostLoadingSkeleton from "$lib/components/post/PostLoadingSkeleton.svelte";
  import PostReactionButton from "$lib/components/post/PostReactionButton.svelte";
  import { getModalStore, type ModalSettings } from "@skeletonlabs/skeleton";
  import CreatePostModal from "$lib/components/modals/create-post/CreatePostModal.svelte";
  import { Circle } from "svelte-loading-spinners";

  export let event: NDKEvent | undefined = undefined;
  export let author: NDKUser | undefined = undefined;
  export let displayAsReply: boolean = false;
  export let indent: number = 0;

  const modalStore = getModalStore();
  let isLiked: boolean | null = null;
  let authorPromise: Promise<NDKUser | undefined>;
  let dateCreated: string = "";
  let images: string[] = [];

  $: if (event && event.created_at) {
    dateCreated = dayjs(event.created_at * 1000).format("YYYY-MM-DD HH:MM");
  }
  $: content = imagifyContent();
  $: images;
  $: isAuthenticated = $authUser.authState !== AuthStates.ANONYMOUS;

  const imagifyContent = (): string => {
    if (event && event.content) {
      let splitContent: string[] = event?.content.split(/(\s+)/);
      splitContent = splitContent.map((chunk: string) => {
        if (chunk.startsWith("http://") || chunk.startsWith("https://")) {
          const splitChunk = chunk.split(".").at(-1);
          if (splitChunk && ["png", "jpg", "gif"].includes(splitChunk)) {
            images = [chunk, ...images];
            return "";
          }
        }
        return chunk;
      });
      return splitContent.join(" ");
    } else {
      return "";
    }
  };

  const reactToEvent = async (): Promise<void> => {
    if ($authUser.nostr && event && isAuthenticated) {
      if (isLiked) {
        await $authUser.nostr.dislikeEvent(event);
        isLiked = false;
      } else {
        await $authUser.nostr.likeEvent(event);
        isLiked = true;
      }
    }
  };

  const replyToEvent = async (): Promise<void> => {
    if ($authUser.nostr && event && isAuthenticated) {
      const modal: ModalSettings = {
        type: "component",
        component: { ref: CreatePostModal },
        title: "Reply to post",
        meta: { event, author },
      };
      modalStore.trigger(modal);
    }
  };

  onMount(async () => {
    if (event && author === undefined) {
      author = await nostrHandler.fetchUserProfileByPublicKey(
        event.author.pubkey,
      );
    }
    if (
      $authUser.authState !== AuthStates.ANONYMOUS &&
      $authUser.nostr &&
      event
    ) {
      $authUser.nostr
        .isEventLiked(event)
        .then((result: boolean) => (isLiked = result));
    }
    authorPromise = Promise.resolve(author);
  });
</script>

{#await authorPromise}
  <PostLoadingSkeleton />
{:then author}
  {#if author && event}
    <div class="flex my-5" style="margin-left: {indent}px!important">
      {#if displayAsReply}
        <div class="min-w-[45px] w-[45px] mr-2">
          <Avatar profile={author.profile} />
        </div>
      {/if}
      <div
        class="card card-hover p-4 grow {displayAsReply
          ? 'variant-soft'
          : 'w-full'}"
      >
        <div
          class="mx-auto flex md:flex-row flex-col justify-between items-start"
        >
          <a
            href={getPath(ROUTES.USER, author?.pubkey || "")}
            class="flex items-start"
          >
            {#if !displayAsReply}
              <div class="w-11 mr-2">
                <Avatar profile={author.profile} />
              </div>
            {/if}
            <div>
              <div class="font-bold">
                {author?.profile?.displayName || author?.profile?.name || ""}
              </div>
              <span class="text-xs">@{author?.profile?.name || ""}</span>
            </div>
          </a>

          <div>
            <span class="text-xs opacity-50">{dateCreated}</span>
          </div>
        </div>

        <a href={getPath(ROUTES.POST, event?.id)}>
          <div class="my-4 text-sm text-pretty break-all">
            {content}
          </div>
          <div class="flex">
            {#each images as url}
              <div class="max-h-48">
                <img src={url} alt="img" class="object-fill w-auto h-full" />
              </div>
            {/each}
          </div>
        </a>

        <div class="grid grid-cols-4 gap-10 pt-2">
          <div class="flex justify-start">
            <PostReactionButton
              on:click={reactToEvent}
              disabled={!isAuthenticated || isLiked === null}
              popupMessage={isLiked ? "dislike" : "like"}
            >
              {#if isLiked === null}
                <Circle size="15" color="black" unit="px" />
              {:else}
                <Heart size="15" color={isLiked ? "red" : "black"} />
              {/if}
            </PostReactionButton>
          </div>

          <div class="flex justify-center pr-6">
            <PostReactionButton
              on:click={replyToEvent}
              disabled={!isAuthenticated || !author || !event}
              popupMessage={"reply"}
            >
              <MessageCircle size="15" />
            </PostReactionButton>
          </div>

          <div class="flex justify-center pl-6">
            <PostReactionButton
              disabled={!isAuthenticated}
              popupMessage={"share"}
            >
              <Share size="15" />
            </PostReactionButton>
          </div>

          <div class="flex justify-end">
            <PostReactionButton
              disabled={!isAuthenticated}
              popupMessage={"bookmark"}
            >
              <Bookmark size="15" />
            </PostReactionButton>
          </div>
        </div>
      </div>
    </div>
  {:else}
    <PostLoadingSkeleton />
  {/if}
{/await}
