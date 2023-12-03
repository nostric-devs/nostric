<script>
  import { Avatar } from "@skeletonlabs/skeleton";
  import Post from "$lib/components/Post/Post.svelte";
</script>

<h1 class="h1 m-4">User profile</h1>

<div class="post-head mx-auto flex md:flex-row flex-col ml-4 my-8">
  <div>
      <Avatar
          src="/img/ape.jpeg"
          class="mr-4 mt-1"
          initials="LV"
          width="w-32"
          background="bg-primary-500"
      />
  </div>
  <div class="m-4">
      <div class="font-bold text-4xl">Lukas Vozda</div>
      <span class="text-md">@lukas</span>
      <div class="text-md">npub12Easdfasdéfásdfjasdlfasdáífasdfadsfasdfé</div>
  </div>
</div>
<div class="m-4 mb-10">
  Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Morbi commodo,
  ipsum sed pharetra gravida, orci magna rhoncus neque, id pulvinar odio lorem
  non turpis. Nullam sit amet enim. Suspendisse id velit vitae ligula volutpat
  condimentum. Aliquam erat volutpat. Sed quis velit. Nulla facilisi.
</div>
<hr class="!border-t-2 mx-4" />
<h2 class="h2 my-8 mx-4">Lukas's Posts</h2>
{#each [1, 2, 3] as item}
  <Post />
{/each}
