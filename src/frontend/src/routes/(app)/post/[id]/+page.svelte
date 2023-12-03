<script>
    import Post from "$lib/components/Post/Post.svelte";
    import { ROUTES, get_path } from "$lib/utils/routes";
    import { Avatar } from "@skeletonlabs/skeleton";
    import { Bookmark, Heart, MessageCircle, Share } from "svelte-feathers";


</script>

<h1 class="h1 m-4">Post detail</h1>
<Post />

<h3 class="h3 m-6">Comments</h3>
{#each [1, 2, 3, 5, 6, 7, 8, 9, 10] as item}
<div class="comment p-6 card">
    <div
        class="post-head mx-auto flex md:flex-row flex-col justify-between items-start"
    >
        <!-- Avatar, Username and Link -->
        <a href={get_path(ROUTES.USER, "1")} class="flex items-start">
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
                <span class="font-bold">Lukas Vozda</span>
                <span class="text-sm">@lukas</span>
                <p class="my-2 text-md">
                    Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Morbi
                    commodo, ipsum sed pharetra gravida.
                </p>
            </div>
        </a>

        <!-- Date -->
        <div>
            <span class="text-sm">1 st Nov 2023</span>
            <!-- Replace formattedDate with your date variable -->
        </div>
    </div>
    <div class="flex justify-between my-2">
        <!-- Like icon -->
        <!-- <img src="path/to/like-icon.svg" class="cursor-pointer hover:text-blue-500" alt="like"/> -->
        <Heart
            size="20"
        ></Heart>
        <!-- Comment icon -->
        <MessageCircle size="20" class="cursor-pointer"></MessageCircle>

        <!-- Share icon -->
        <Share size="20" class="cursor-pointer"></Share>

        <!-- Bookmark icon -->
        <Bookmark size="20" class="cursor-pointer"></Bookmark>
    </div>
</div>
{/each}