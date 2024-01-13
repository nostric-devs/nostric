<script lang="ts">
  import Avatar from "$lib/components/user/Avatar.svelte";
  import { UserMinus, UserPlus } from "svelte-feathers";
  import { getPath, ROUTES } from "$lib/utils/routes";
  import type { NDKUser } from "@nostr-dev-kit/ndk";
  import { AuthStates, authUser } from "$lib/stores/Auth";
  import UserFollowLoadingSkeleton from "$lib/components/user/follow/UserFollowLoadingSkeleton.svelte";
  import { getToastStore } from "@skeletonlabs/skeleton";
  import { Circle } from "svelte-loading-spinners";
  import { followedUsers } from "$lib/stores/FollowedUsers";

  let loading: boolean = false;
  let followedList: string[] = [];

  const toastStore = getToastStore();

  $: if ($authUser.authState !== AuthStates.ANONYMOUS && $authUser.nostr) {
    followedList = [...$followedUsers.map((user: NDKUser) => user.pubkey)];
  }

  const follow = async () => {
    if (user !== undefined && $authUser.authState !== AuthStates.ANONYMOUS && $authUser.nostr) {
      loading = true;
      disabled = true;
      try {
        await $authUser.nostr?.addUserToFollowedUsers(user);
        toastStore.trigger({
          message: `Successfully followed user ${user.profile?.name}`,
          background: "variant-filled-success",
        });
      } catch(error: any) {
        toastStore.trigger({
          message: error,
          background: "variant-filled-error",
        });
      } finally {
        loading = false;
        disabled = false;
      }
    }
  }

  const unfollow = async () => {
    if (user !== undefined && $authUser.authState !== AuthStates.ANONYMOUS) {
      loading = true;
      disabled = true;
      try {
        await $authUser.nostr?.removeUserFromFollowedUsers(user);
        toastStore.trigger({
          message: `Successfully unfollowed user ${user.profile?.name}`,
          background: "variant-filled-success",
        });
      } catch(error: any) {
        toastStore.trigger({
          message: error,
          background: "variant-filled-error",
        });
      } finally {
        loading = false;
        disabled = false;
      }
    }
  }
  export let user: NDKUser | undefined = undefined;
  export let disabled: boolean = false;
</script>

{#if user === undefined}
  <UserFollowLoadingSkeleton />
{:else}
  <div
    class="post-head mx-auto my-5 flex md:flex-row flex-col items-center"
  >
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
      {#if followedList.includes(user.pubkey)}
        <div class="w-[130px]">
          <button
            type="button"
            class="btn variant-filled-warning font-normal w-full"
            on:click={unfollow}
            disabled={disabled}
          >
            {#if loading}
              <span class="mr-2">
                <Circle size="15" color="white" unit="px" />
              </span>
            {:else}
              <span>
                <UserMinus size="16" class="lg:mx-auto xl:mx-0"></UserMinus>
              </span>
            {/if}
            <span class="text-sm">Unfollow</span>
          </button>
        </div>
      {:else}
        <div class="w-[130px]">
          <button
            type="button"
            class="btn variant-filled-primary font-normal w-full"
            on:click={follow}
            disabled={disabled}
          >
            {#if loading}
              <span class="mr-2">
                <Circle size="15" color="white" unit="px" />
              </span>
            {:else}
              <span>
                <UserPlus size="16" class="lg:mx-auto xl:mx-0"></UserPlus>
              </span>
            {/if}
            <span class="text-sm">Follow</span>
          </button>
        </div>
      {/if}
    {/if}
  </div>
{/if}

