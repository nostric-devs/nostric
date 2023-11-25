<script>

    import { Avatar } from "@skeletonlabs/skeleton";

</script>
<h1 class="h1">User detail</h1>

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
<section class="card p-5 m-5">
    <a href="/user/1">
        <div class="post-head mx-auto flex md:flex-row flex-col">
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
                <div class="font-bold">Lukas Vozda</div>
                <span class="text-sm">@lukas</span>
            </div>
        </div>
    </a>
    <p class="my-2 text-lg">Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Morbi commodo, ipsum sed pharetra gravida, orci magna rhoncus neque, id pulvinar odio lorem non turpis. Nullam sit amet enim. Suspendisse id velit vitae ligula volutpat condimentum. Aliquam erat volutpat. Sed quis velit. Nulla facilisi. Nulla libero. Vivamus pharetra posuere sapien. </p>
    <p class="text-sm">1 st Nov 2023</p>
</section>
{/each}