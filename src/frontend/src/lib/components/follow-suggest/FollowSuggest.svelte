<script lang="ts">
  import type { NDKUser } from "@nostr-dev-kit/ndk";
  import { onMount } from "svelte";
  import { nostrHandler } from "$lib/nostr/NostrHandler";
  import UserFollowLoadingSkeleton from "../user/follow/UserFollowLoadingSkeleton.svelte";
  import FollowCard from "../user/follow/FollowCard.svelte";

  let profilesPromise: Promise<NDKUser[]>;

  onMount(async () => {
    profilesPromise = nostrHandler.fetchProfilesByPublicKey(profilesPubkeys);
    console.log(profilesPromise);
  });

  let disabled: boolean = false;

  // This is now a hardcoded array, will be dynamic later on
  let profilesPubkeys: string[] = [
    "82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2",
    "32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245",
    "04c915daefee38317fa734444acee390a8269fe5810b2241e5e6dd343dfbecc9",
    "3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d",
    "84dee6e676e5bb67b4ad4e042cf70cbd8681155db535942fcc6a0533858a7240",
    "eab0e756d32b80bcd464f3d844b8040303075a13eabc3599a762c9ac7ab91f4f",
    "a3b0ce5d70d0db22885706b2b1f144c6864a7e4828acff3f8f01ca6b3f54ad15",
    "58c741aa630c2da35a56a77c1d05381908bd10504fdd2d8b43f725efa6d23196",
    "c4eabae1be3cf657bc1855ee05e69de9f059cb7a059227168b80b89761cbc4e0",
  ];
</script>

<h3 class="h3 my-6">People to follow</h3>

{#await profilesPromise}
  <div class="px-4 mb-4">
    <div class="placeholder animate-pulse" />
  </div>
  <hr class="!border-t-2 mx-4" />
  <div class="px-4 mt-3">
    {#each { length: 10 } as _}
      <UserFollowLoadingSkeleton />
    {/each}
  </div>
{:then profiles}
  {#if profiles && profiles.length > 0}
    {#each profiles as profile}
      <FollowCard user={profile} {disabled} />
    {/each}
  {/if}
{/await}
