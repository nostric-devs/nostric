<script lang="ts">

  import { nostr_service } from "../../store/auth";
  import { NDKUser } from "@nostr-dev-kit/ndk";
  import { Icon } from "svelte-feathers";
  import Spinner from "../utils/Spinner.svelte";
  import NostrAvatar from "./NostrAvatar.svelte";
  import { alert } from "../../store/alert";
  import { onMount } from "svelte";
  import { nostr_followees } from "../../store/nostr";

  // flag for search button, during searching
  let searching : boolean = false;
  let query_value : string = "";
  // flag for disabling all buttons when action is being processed
  let loading : boolean = false;
  // index to know which button was clicked, to display loading
  let selected_index : number = null;

  // checkboxes for filtering
  let search_followed : boolean = true;
  let search_nostr : boolean = false;

  let filtered_nostr_users : [NDKUser, FOLLOW_STATUS][]  = [];
  let filtered_followed_users : [NDKUser, FOLLOW_STATUS][] = [];
  let all_filtered : [NDKUser, FOLLOW_STATUS][] = [];

  enum FOLLOW_STATUS {
    FOLLOWED,
    NEW,
  }

  // if query is empty, only show currently followed users
  $: query_value === "" && init_filtered();

  const search = async () => {
    searching = true;
    if (query_value) {
      if (search_nostr) {
        let result = await nostr_service.search_match(query_value);
        filtered_nostr_users = result.map((user) => [user, FOLLOW_STATUS.NEW]);
      }
      if (search_followed) {
        filtered_followed_users = nostr_followees.search_match(query_value)
          .map((user) => [user, FOLLOW_STATUS.FOLLOWED]);
      }
      all_filtered = filtered_nostr_users.concat(filtered_followed_users);
    } else {
      init_filtered();
    }
    searching = false;
  }

  const init_filtered = () => {
    all_filtered = $nostr_followees.map((user) => [user, FOLLOW_STATUS.FOLLOWED]);
  }

  const follow = async (user : NDKUser, index) => {
    loading = true;
    selected_index = index;
    if (await nostr_service.add_followee(user)) {
      // local state update
      all_filtered[index][1] = FOLLOW_STATUS.FOLLOWED;
    } else {
      alert.error(`Unable to follow user ${user.profile.name}`);
    }
    selected_index = null;
    loading = false;
  }

  const unfollow = async (user : NDKUser, index) => {
    loading = true;
    selected_index = index;
    if (await nostr_service.remove_followee(user)) {
      // local state update
      all_filtered[index][1] = FOLLOW_STATUS.NEW;
    } else {
      alert.error(`Unable to unfollow user ${user.profile.name}`);
    }
    selected_index = null;
    loading = false;
  }

  onMount(() => {
    init_filtered();
  });

</script>


<div class="form-control mb-6">
  <div class="w-full">
    <div class="flex justify-center">
      <input
        class="input input-bordered w-full mb-1 border-primary border-2 rounded-2xl"
        placeholder="search for a user name or public key"
        bind:value={ query_value }
      />
      <button
        disabled={ searching || !query_value || loading }
        class="btn btn-primary rounded-2xl ml-3"
        on:click={ async () => await search() }
      >
        {#if !searching}
          <Icon name="search" />
        {:else}
          <Spinner />
        {/if}
        Search
      </button>
    </div>
    <div class="flex">
      <div class="mr-3">
        <label class="label cursor-pointer">
          <input type="checkbox" bind:checked={ search_followed } class="checkbox mr-2"/>
          <span class="label-text">My followed users</span>
        </label>
      </div>
      <div>
        <label class="label cursor-pointer">
          <input type="checkbox" bind:checked={ search_nostr } class="checkbox mr-2"/>
          <span class="label-text">All Nostr Users</span>
        </label>
      </div>
    </div>
  </div>
</div>

<div class="mt-12">
  {#if all_filtered.length > 0}
    {#each all_filtered as [user, follow_status], index }
      <div class="border-primary border-2 rounded-2xl flex my-4 px-4 py-3 justify-between">
        <NostrAvatar profile={ user.profile } size="80"/>
        <div class="flex flex-col justify-center flex-grow items-start">
          <div class="text-xl font-bold">
            @{ user.profile?.name || user.profile?.displayName  }
          </div>
          <div class="text-sm max-w-xs break-all">
            <span>{ user.hexpubkey() }</span>
          </div>
        </div>
        <div class="flex items-center">
          {#if follow_status === FOLLOW_STATUS.NEW }
            <button
              class="btn btn-primary rounded-2xl ml-3"
              disabled={ loading || searching }
              on:click={ async () => await follow(user, index) }
            >
              {#if loading && selected_index === index}
                <Spinner />
              {:else}
                <Icon name="user-plus" />
              {/if}
              follow
            </button>
          {:else}
            <button
              class="btn btn-error rounded-2xl ml-3"
              on:click={ async () => await unfollow(user, index) }
              disabled={ loading || searching }
            >
              {#if loading && selected_index === index}
                <Spinner />
              {:else}
                <Icon name="user-minus" />
              {/if}
              unfollow
            </button>
          {/if}
        </div>
      </div>
    {/each}
    {:else if search_followed}
      <div class="text-center">
        No users found in your following list. Try searching through Nostr and follow them.
      </div>
    {:else}
      <div class="text-center">
        No users matching the query were found in Nostr.
      </div>
    {/if}
</div>

