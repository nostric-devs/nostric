<script>
  import PlaceholderImage from "$lib/assets/images/img1.jpg";
    import { Copy, Trash } from "svelte-feathers";
    import { filter, Emerald, BlueNight /* ... */  } from '@skeletonlabs/skeleton';

  let images = [
    "https://images.unsplash.com/photo-1617296538902-887900d9b592?ixid=M3w0Njc5ODF8MHwxfGFsbHx8fHx8fHx8fDE2ODc5NzExMDB8&ixlib=rb-4.0.3&w=512&h=512&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1553184570-557b84a3a308?ixid=M3w0Njc5ODF8MHwxfGFsbHx8fHx8fHx8fDE2ODc5NzY2NTF8&ixlib=rb-4.0.3&w=512&h=512&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1620005839871-7ac4aed5ddbc?ixid=M3w0Njc5ODF8MHwxfGFsbHx8fHx8fHx8fDE2ODc5NzY2NzN8&ixlib=rb-4.0.3&w=300&h=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1597077962467-be16edcc6a43?ixid=M3w0Njc5ODF8MHwxfGFsbHx8fHx8fHx8fDE2ODc5NzY2MzZ8&ixlib=rb-4.0.3&w=512&h=512&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1597531072931-8fceba101e4e?ixid=M3w0Njc5ODF8MHwxfGFsbHx8fHx8fHx8fDE2ODc5NzY2OTB8&ixlib=rb-4.0.3&w=300&h=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1597077917598-97ca3922a317?ixid=M3w0Njc5ODF8MHwxfGFsbHx8fHx8fHx8fDE2ODc5NzY3MjF8&ixlib=rb-4.0.3&w=300&h=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1510111652602-195fc654aa83?ixid=M3w0Njc5ODF8MHwxfGFsbHx8fHx8fHx8fDE2ODc5NzY0Nzl8&ixlib=rb-4.0.3&w=300&h=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1612145342709-eadb6e22acca?ixid=M3w0Njc5ODF8MHwxfGFsbHx8fHx8fHx8fDE2ODc5NzY3MDh8&ixlib=rb-4.0.3&w=300&h=300&auto=format&fit=crop"

  ];

  function getRandomImageUrl() {
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
  }

  let hoveredIndex = null;


  function copyImageUrl(imageUrl) {
    // Implement copying image URL logic
    console.log("Copying URL:", imageUrl);
  }  

  function deleteImage(index) {
    images = images.filter((_, i) => i !== index);
  }

</script>

<h1 class="h1 m-4">Images</h1>
<span class="m-4"
  >Here you can manage your uploaded media files. If you remove image from here,
  it will not be loaded in your posts.</span
>

<section class="grid my-8 mx-4 grid-cols-2 md:grid-cols-3 gap-2">
  {#each images as image, index}
    <div class="image-container">
      <img
        class="h-auto max-w-full rounded-md"
        src={image}
        alt=""
      />
      <div class="overlay"></div>
      <div class="image-icons">
        <button on:click={() => copyImageUrl(image)} type="button" class="btn variant-filled font-normal">
          <span>
            <Copy size="16" class="lg:mx-auto xl:mx-0"/>
          </span>
          <span class="text-sm">
            Copy URL
          </span>
        </button>
        <button on:click={() => deleteImage(index)} type="button" class="btn variant-filled-warning font-normal">
          <span>
            <Trash size="16" class="lg:mx-auto xl:mx-0"/>
          </span>
          <span class="text-sm">
            Delete
          </span>
        </button>
      </div>
    </div>
  {/each}
</section>

<!-- <section class="grid grid-cols-2 md:grid-cols-4 gap-2">
  <div class="grid gap-4">
    {#each Array.from({ length: 20 }) as item}
    <div>
      <img src={PlaceholderImage} class="h-auto max-w-full rounded-lg" alt="Image" />
    </div>
    {/each}
  </div>
</section>    -->



<style>
 .image-container {
    position: relative;
  }
  .image-container img {
    transition: all 0.3s ease; /* Transition effect for the image */
    display: block; /* To remove bottom space under the image */
  }
  .overlay {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.4); /* Semi-transparent black */
    border-radius: inherit; /* Optional, for rounded corners if your images have them */
    opacity: 0; /* Start with a fully transparent overlay */
    transition: opacity 0.3s ease; /* Transition effect for the overlay */
  }
  .image-container:hover .overlay {
    opacity: 1; /* Fully visible on hover */
  }
  .image-icons {
    display: none;
    position: absolute;
    margin: 5px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%); /* Center the icons */
    transition: opacity 0.6s ease;
    flex-direction: column; /* Stack children vertically */
    gap: 10px; /* Space between buttons */
    /* Additional styling for the icons */
  }
  .image-container:hover .image-icons {
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>