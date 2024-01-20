<script lang="ts">
  import { UserMinus, UserPlus } from "svelte-feathers";
  import type { NDKUser } from "@nostr-dev-kit/ndk";
  import { AuthStates, authUser } from "$lib/stores/Auth";
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
    if (
      user !== undefined &&
      $authUser.authState !== AuthStates.ANONYMOUS &&
      $authUser.nostr
    ) {
      loading = true;
      disabled = true;
      try {
        await $authUser.nostr?.addUserToFollowedUsers(user);
        toastStore.trigger({
          message: `Successfully followed user ${user.profile?.name}`,
          background: "variant-filled-success",
        });
      } catch (error) {
        toastStore.trigger({
          message: error as string,
          background: "variant-filled-error",
        });
      } finally {
        loading = false;
        disabled = false;
      }
    }
  };

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
      } catch (error) {
        toastStore.trigger({
          message: error as string,
          background: "variant-filled-error",
        });
      } finally {
        loading = false;
        disabled = false;
      }
    }
  };
  export let user: NDKUser | undefined = undefined;
  export let disabled: boolean = false;
</script>

{#if followedList.includes(user.pubkey)}
  <div class="w-[110px]">
    <button
      type="button"
      class="btn variant-filled-warning font-normal w-full"
      on:click={unfollow}
      {disabled}
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
  <div class="w-[110px]">
    <button
      type="button"
      class="btn variant-filled-primary font-normal w-full"
      on:click={follow}
      {disabled}
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
