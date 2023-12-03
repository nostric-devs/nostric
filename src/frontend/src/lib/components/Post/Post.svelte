<script>
    import { Avatar } from "@skeletonlabs/skeleton";
    import { Heart, Share, MessageCircle, Bookmark } from "svelte-feathers";
    import { get_path, ROUTES } from "$lib/utils/routes";

    let isLiked = false;

    function toggleLike() {
        isLiked = !isLiked;
    }
</script>

<section class="card p-5 m-5">
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
                <div class="font-bold">Lukas Vozda</div>
                <span class="text-sm">@lukas</span>
            </div>
        </a>

        <!-- Date -->
        <div>
            <span class="text-sm">1 st Nov 2023</span>
            <!-- Replace formattedDate with your date variable -->
        </div>
    </div>

    <a href={get_path(ROUTES.POST, "1")}>
        <p class="my-4 text-lg">
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Morbi
            commodo, ipsum sed pharetra gravida, orci magna rhoncus neque, id
            pulvinar odio lorem non turpis. Nullam sit amet enim. Suspendisse id
            velit vitae ligula volutpat condimentum. Aliquam erat volutpat. Sed
            quis velit. Nulla facilisi. Nulla libero. Vivamus pharetra posuere
            sapien.
        </p>
    </a>
    <div class="flex justify-between mt-4">
        <!-- Like icon -->
        <!-- <img src="path/to/like-icon.svg" class="cursor-pointer hover:text-blue-500" alt="like"/> -->
        <Heart
            size="20"
            on:click={toggleLike}
            class="cursor-pointer {isLiked
                ? 'fill-red-500 stroke-red-500'
                : ''}"
        ></Heart>
        <!-- Comment icon -->
        <MessageCircle size="20" class="cursor-pointer"></MessageCircle>

        <!-- Share icon -->
        <Share size="20" class="cursor-pointer"></Share>

        <!-- Bookmark icon -->
        <Bookmark size="20" class="cursor-pointer"></Bookmark>
    </div>
</section>
