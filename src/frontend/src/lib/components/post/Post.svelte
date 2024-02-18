<script lang="ts">
  import {
    Bookmark,
    Heart,
    MessageCircle,
    Share,
    Frown,
  } from "svelte-feathers";
  import { getPath, ROUTES } from "$lib/utils/routes";
  import type { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
  import { nostrHandler } from "$lib/nostr";
  import Avatar from "$lib/components/user/Avatar.svelte";
  import { onMount } from "svelte";
  import dayjs from "dayjs";
  import { AuthStates, authUser } from "$lib/stores/Auth";
  import PostLoadingSkeleton from "$lib/components/post/PostLoadingSkeleton.svelte";
  import PostReactionButton from "$lib/components/post/PostReactionButton.svelte";
  import {
    getModalStore,
    getToastStore,
    type ModalSettings,
    ProgressRadial,
  } from "@skeletonlabs/skeleton";
  import CreatePostModal from "$lib/components/modals/create-post/CreatePostModal.svelte";
  import { clipboard } from "@skeletonlabs/skeleton";
  import { page } from "$app/stores";
  import Toaster from "$lib/components/toast/Toaster.svelte";

  export let event: NDKEvent | undefined = undefined;
  export let author: NDKUser | undefined = undefined;
  // controls whether the post is to have the avatar inside or outside
  // root posts have it inside, replies outside
  export let displayAsReply: boolean = false;
  // level of indent in the reply tree
  export let indent: number = 0;

  const modalStore = getModalStore();
  const toastStore = getToastStore();

  let isLiked: boolean | null = null;
  let authorPromise: Promise<NDKUser | undefined>;
  let dateCreated: string = "";
  let images: string[] = [];
  let content: string = "";
  let postUrl: string = "";
  let isHovered: boolean = false;

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
      let message: string = "";
      if (isLiked) {
        isLiked = null;
        await $authUser.nostr.dislikeEvent(event);
        message = "Disliked post";
        isLiked = false;
      } else {
        isLiked = null;
        await $authUser.nostr.likeEvent(event);
        message = "Liked post";
        isLiked = true;
      }
      toastStore.trigger({
        message,
        background: "variant-filled-secondary",
        timeout: 1000,
      });
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
    if (event !== undefined) {
      if (author === undefined) {
        // fetch the event profile if it was not specified
        author = await nostrHandler.fetchUserProfileByPublicKey(
          event.author.pubkey,
        );
      }

      if ($authUser.authState !== AuthStates.ANONYMOUS && $authUser.nostr) {
        // if we have a logged-in user, we need to see whether they liked the post or not
        $authUser.nostr
          .isEventLiked(event)
          .then((result: boolean) => (isLiked = result));
      }

      if (event.created_at) {
        // parse the created date
        dateCreated = dayjs(event.created_at * 1000).format("YYYY-MM-DD HH:MM");
      }

      content = imagifyContent();
      postUrl = `${getPath(ROUTES.POST, event.id)}/#${event.id}`;
    }

    authorPromise = Promise.resolve(author);
  });
</script>

{#await authorPromise}
  <PostLoadingSkeleton />
{:then author}
  {#if author && event}
    <div
      class="flex my-5"
      style="margin-left: {indent}px!important"
      id={event?.id}
    >
      {#if displayAsReply}
        <div class="min-w-[45px] w-[45px] mr-2">
          <Avatar profile={author.profile} />
        </div>
      {/if}
      <div class="card p-4 grow {displayAsReply ? 'variant-soft' : 'w-full'}">
        <a href={postUrl}>
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

        <div class="grid grid-cols-4 gap-10 pt-4">
          <div class="flex justify-start">
            <PostReactionButton
              on:click={reactToEvent}
              disabled={!isAuthenticated || isLiked === null}
              popupMessage={isLiked === true
                ? "dislike"
                : isLiked === false
                  ? "like"
                  : ""}
              bind:isHovered
            >
              {#if isLiked === null}
                <ProgressRadial width="w-4" />
              {:else if isLiked === true}
                {#if !isHovered}
                  <Heart size="15" class="text-red-500" />
                {:else}
                  <Frown size="15" />
                {/if}
              {:else}
                <Heart size="15" />
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

          <Toaster message="Post link copied to clipboard" color="secondary">
            <div
              class="flex justify-center pl-6"
              use:clipboard={`${$page.url.host}${postUrl}`}
            >
              <PostReactionButton
                disabled={!isAuthenticated}
                popupMessage={"share"}
              >
                <Share size="15" />
              </PostReactionButton>
            </div>
          </Toaster>

          <div class="flex justify-end">
            <PostReactionButton disabled popupMessage={"bookmark"}>
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
