<script>
  import { Avatar } from "@skeletonlabs/skeleton";
  import { UserPlus } from "svelte-feathers";
</script>

<h3 class="h3 my-6">People to follow</h3>
<div class="follow-suggest">
  {#each [1, 2, 3, 5, 6, 7, 8, 9, 10] as item}
    <div
      class="post-head mx-auto my-4 flex md:flex-row flex-col justify-between items-start"
    >
      <!-- Avatar, Username and Link -->
      <a href="/user/1" class="flex items-start">
        <div>
          <Avatar
            src="/img/ape.jpeg"
            class="mr-4 mt-1"
            initials="LV"
            width="w-10"
            background="bg-primary-500"
          />
        </div>
        <div>
          <div class="font-bold">Lukas Vozda</div>
          <span class="text-sm username">npub241BKSDASUDSA</span>
        </div>
      </a>

      <!-- Follow Button -->
      <button type="button" class="btn variant-filled-primary font-normal">
        <span>
          <UserPlus size="16" class="lg:mx-auto xl:mx-0"></UserPlus>
        </span>
        <span class="text-sm">
          Follow
        </span>  
        </button>
    </div>
  {/each}
</div>
