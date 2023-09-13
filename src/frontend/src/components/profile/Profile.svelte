<script lang="ts">
  import { navigateTo } from "svelte-router-spa";
  import { nostric_user, nostr_service } from "../../store/auth";
  import { nostr_events } from "../../store/nostr";
  import { Icon } from 'svelte-feathers';
  import Alert from "../utils/Alert.svelte";
  import { ROUTES } from "../../router/routes";
  import Spinner from "../utils/Spinner.svelte";
  import { Kind, nip19 } from "nostr-tools";

  // let profile = {};
  // let private_key = "";
  // let message = null;
  // let publishing = false;
  // let npub = "";
  //
  // try {
  //   profile = nostric_user.get_profile();
  //   private_key = nostric_user.get_private_key();
  //   message = null;
  //   publishing = false;
  //   npub = nip19.npubEncode(profile.pk);
  // } catch {
  // }
  //
  // const create_post = async () => {
  //   publishing = true;
  //   let event = nostr_service.create_event(message, Kind.Text);
  //   await nostr_service.publish_event(event);
  //   message = null;
  // }
  //
  // $: $nostr_events, publishing = false;

  export let currentRoute;
  export let params;

</script>

<!--<div class="max-w-xl mx-auto mt-8">-->
<!--  <div class=" flex items-center">-->
<!--    &lt;!&ndash; Avatar Picture &ndash;&gt;-->
<!--    {#if profile.avatar_url}-->
<!--      <div class="avatar">-->
<!--        <div class="w-32 rounded mr-4">-->
<!--          <img src="{ profile.avatar_url }" alt="avatar"/>-->
<!--        </div>-->
<!--      </div>-->
<!--    {:else}-->
<!--      <div class="avatar placeholder">-->
<!--        <div class="bg-neutral-focus text-neutral-content rounded mr-4 w-24 h-24">-->
<!--          <span class="text-3xl">{ profile.username ? profile.username[0] : "" }</span>-->
<!--        </div>-->
<!--      </div>-->
<!--    {/if}-->
<!--    &lt;!&ndash; Username & Bio Container &ndash;&gt;-->
<!--    <div class="ml-4 break-all">-->
<!--        <h1 class="text-xl font-bold">@{ profile.username }</h1>-->
<!--        <span class="text-gray-500" title="Your public key.">{npub}</span>-->
<!--        <p class="text-sm mt-1">{ profile.about }</p>-->
<!--    </div>-->
<!--  </div>-->
<!--</div>-->

<!--<div class="max-w-xl mx-auto mt-12">-->
<!--  <div class="divider"></div>-->
<!--  <div class="form-control">-->
<!--    <label class="label">-->
<!--      <span class="label-text text-base">Create a new post</span>-->
<!--    </label>-->
<!--    <textarea bind:value={message} class="textarea textarea-bordered" maxlength="200" placeholder="Write something..."></textarea>-->
<!--  </div>-->
<!--  <div class="text-right">-->
<!--    <button-->
<!--      disabled="{ !message || publishing }"-->
<!--      class="btn btn-primary mt-2 text-right"-->
<!--      on:click={ async () => await create_post() }-->
<!--    >-->
<!--      {#if publishing}-->
<!--        <Spinner/>-->
<!--      {/if}-->
<!--      <span class="text-white">Create post</span>-->
<!--    </button>-->
<!--  </div>-->
<!--  <div class="divider"></div>-->
<!--  <div class="mt-12">-->
<!--    {#each $nostr_events as event}-->
<!--      <div class="bg-gray-100 mb-4 p-2 rounded">-->
<!--        <div class=" flex items-start">-->
<!--          {#if profile.avatar_url}-->
<!--            <div class="avatar">-->
<!--              <div class="w-16 rounded mr-4">-->
<!--                <img src="{ profile.avatar_url }" alt="avatar"/>-->
<!--              </div>-->
<!--            </div>-->
<!--          {:else}-->
<!--            <div class="avatar placeholder">-->
<!--              <div class="bg-neutral-focus text-neutral-content rounded mr-4 w-16 h-16">-->
<!--                <span class="text-2xl">{ profile.username ? profile.username[0] : "" }</span>-->
<!--              </div>-->
<!--            </div>-->
<!--          {/if}-->
<!--          <div class="ml-2">-->
<!--              <div>{ event.created_at_time }</div>-->
<!--              <p class="text-base mt-2">{ event.content }</p>-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
<!--    {/each}-->
<!--  </div>-->
<!--</div>-->


<style lang="postcss">
</style>
