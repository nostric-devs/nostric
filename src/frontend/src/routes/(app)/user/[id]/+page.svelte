<script>
  import { Avatar } from "@skeletonlabs/skeleton";
    import Post from "$lib/components/Post/Post.svelte";
</script>

<h1 class="h1 m-4">User detail</h1>

<div class="post-head mx-auto flex md:flex-row flex-col m-8">
    <div>
        <Avatar
            src=""
            class="mr-4 mt-1"
            initials="LV"
            width="w-10"
            background="bg-primary-500"
        />
    </div>
    <div>
        <div class="font-bold text-2xl">Lukas Vozda</div>
        <span class="text-sm">@lukas</span>
    </div>

</div>
<div class="p-4">
    Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Morbi commodo, ipsum sed pharetra gravida, orci magna rhoncus neque, id pulvinar odio lorem non turpis. Nullam sit amet enim. Suspendisse id velit vitae ligula volutpat condimentum. Aliquam erat volutpat. Sed quis velit. Nulla facilisi.
</div>
<h2 class="h2 my-8">Lukas's Posts</h2>
{#each [1, 2, 3] as item}
<Post />
{/each}
