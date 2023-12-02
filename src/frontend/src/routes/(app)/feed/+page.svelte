<script>
    import Post from "$lib/components/Post/Post.svelte";
</script>

<h1 class="h1 m-4">Feed</h1>

{#each [1, 2, 3] as item}
    <Post />
{/each}
