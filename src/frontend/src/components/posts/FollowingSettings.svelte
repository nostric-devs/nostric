<script lang="ts">
  import { nostr_service } from "../../store/auth";
  import { nostr_events } from "../../store/nostr";
  import Spinner from "../Spinner.svelte";
  import { Icon } from "svelte-feathers";
  import UserPost from "../posts/UserPost.svelte";
  import { NDKUser } from "@nostr-dev-kit/ndk";
  import { onMount } from "svelte";
  import { alert } from "../../store/alert";

  let selected_item;
  let filtered_users : [];
  let input_value : string = "";
  let searching : boolean = false;
  let followed_users : Set<NDKUser[]> = new Set();

  function item_clicked(item) {
    document.activeElement.blur();
    selected_item = item;
    input_value = "";
  }

  let timer;
  const debounce = (value) => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      searching = true;
      filtered_users = await nostr_service.search_match(value);
      input_value = value;
      searching = false;
    }, 1000);
  }

  const add_to_list = async (user, pubkey) => {
    await nostr_service.add_followee(user);
    delete filtered_users[pubkey];
    followed_users = await nostr_service.get_followees();
    alert.success(`Successfully added user ${user.profile.name}`);
  }

  onMount(async () => {
    followed_users = await nostr_service.get_followees();
  });

</script>

<div class="form-control">
  <div>
    <div class="flex">
      <input
        class="input input-bordered w-full mb-1"
        placeholder="search for a user name or public key"
        on:keyup={({ target: { value } }) => debounce(value)}
      />
      <button class="btn ml-3">
        {#if !searching}
          <Icon name="search" />
        {:else}
          <Spinner />
        {/if}
      </button>
    </div>
    {#if filtered_users}
        <div class="grid grid-cols-3 gap-6 mt-4 mr-16">
        {#each Object.entries(filtered_users) as [pubkey, { image, name, display_name, user }] }
          <div class="flex content-center mx-3 my-3">
            {#if image && image.includes("http")}
              <div class="avatar">
                <div class="w-20 h-20 rounded mr-4">
                  <img src="{ image }" alt="avatar"/>
                </div>
              </div>
            {:else}
              <div class="avatar placeholder">
                <div class="bg-neutral-focus text-neutral-content rounded mr-4 h-20 w-20">
                  <span class="text-2xl">{ (name || display_name || "")[0] }</span>
                </div>
              </div>
            {/if}
            <div class="max-w-full overflow-hidden truncate">
              <div class="text-md">{ name || display_name }</div>
              <div class="text-xs truncate">{ pubkey }</div>
              <div class="card-actions justify-end mt-1">
                <button
                  class="btn btn-primary btn-sm"
                  on:click={async () => await add_to_list(user, pubkey)}
                >
                  Follow
                </button>
              </div>
            </div>
          </div>
        {/each}
        </div>
    {/if}
  </div>
</div>

<div>
  <div class="divider"></div>

  <div class="text-xl">Following</div>

  <div class="grid grid-cols-3 gap-6 mt-4 mr-16">
  {#each [...followed_users] as followed_user }
    <div class="flex content-center mx-3 my-3">
      {#if followed_user.profile?.image && followed_user.profile.image.includes("http")}
        <div class="avatar">
          <div class="w-20 h-20 rounded mr-4">
            <img src="{ followed_user.profile?.image }" alt="avatar"/>
          </div>
        </div>
      {:else}
        <div class="avatar placeholder">
          <div class="bg-neutral-focus text-neutral-content rounded mr-4 h-20 w-20">
            <span class="text-2xl">{ (followed_user.profile?.name || followed_user.profile?.display_name || "")[0] }</span>
          </div>
        </div>
      {/if}
      <div class="max-w-full overflow-hidden truncate">
        <div class="text-md">{ followed_user.profile?.name || followed_user.profile?.display_name }</div>
        <div class="text-xs truncate">{ followed_user.hexpubkey() }</div>
        <div class="card-actions justify-end mt-1">
          <button
            class="btn btn-primary btn-sm"
            disabled
          >
            Unfollow
          </button>
        </div>
      </div>
    </div>
  {/each}
  </div>
</div>

