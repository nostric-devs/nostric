<script lang="ts">
  import Post from "$lib/components/post/Post.svelte";
  import { events } from "$lib/stores/Events";
  import { NDKKind } from "@nostr-dev-kit/ndk";

</script>

<h1 class="h1 m-4">Feed</h1>

{#each $events.filter((e) => e.kind === NDKKind.Text) as event}
  <Post {event}/>
{/each}
