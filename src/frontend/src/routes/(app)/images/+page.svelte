<script>
  import PlaceholderImage from "$lib/assets/images/img1.jpg";
  import { Copy, Trash, Upload } from "svelte-feathers";
  import {
    FileDropzone,
    ProgressRadial,
    clipboard,
  } from "@skeletonlabs/skeleton";

  // Images will be later loaded from store
  let images = [
    "https://images.unsplash.com/photo-1617296538902-887900d9b592?ixid=M3w0Njc5ODF8MHwxfGFsbHx8fHx8fHx8fDE2ODc5NzExMDB8&ixlib=rb-4.0.3&w=512&h=512&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1553184570-557b84a3a308?ixid=M3w0Njc5ODF8MHwxfGFsbHx8fHx8fHx8fDE2ODc5NzY2NTF8&ixlib=rb-4.0.3&w=512&h=512&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1620005839871-7ac4aed5ddbc?ixid=M3w0Njc5ODF8MHwxfGFsbHx8fHx8fHx8fDE2ODc5NzY2NzN8&ixlib=rb-4.0.3&w=300&h=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1597077962467-be16edcc6a43?ixid=M3w0Njc5ODF8MHwxfGFsbHx8fHx8fHx8fDE2ODc5NzY2MzZ8&ixlib=rb-4.0.3&w=512&h=512&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1597531072931-8fceba101e4e?ixid=M3w0Njc5ODF8MHwxfGFsbHx8fHx8fHx8fDE2ODc5NzY2OTB8&ixlib=rb-4.0.3&w=300&h=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1597077917598-97ca3922a317?ixid=M3w0Njc5ODF8MHwxfGFsbHx8fHx8fHx8fDE2ODc5NzY3MjF8&ixlib=rb-4.0.3&w=300&h=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1510111652602-195fc654aa83?ixid=M3w0Njc5ODF8MHwxfGFsbHx8fHx8fHx8fDE2ODc5NzY0Nzl8&ixlib=rb-4.0.3&w=300&h=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1612145342709-eadb6e22acca?ixid=M3w0Njc5ODF8MHwxfGFsbHx8fHx8fHx8fDE2ODc5NzY3MDh8&ixlib=rb-4.0.3&w=300&h=300&auto=format&fit=crop",
  ];

  function onChangeHandler(e) {
    console.log("file data:", e);
  }

  let copied = false;

  function onClickHandler() {
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 1000);
  }

  function deleteImage(index) {
    images = images.filter((_, i) => i !== index);
  }
</script>

<h1 class="h1 m-4">Images</h1>
<div class="m-4">
  Here you can manage your uploaded media files. If you remove image from here,
  it will not be loaded in your posts.
</div>
<div class="mx-4 my-8">
  <FileDropzone
    name="files-example-two"
    accept="image/*"
    on:change={onChangeHandler}
  >
    <div slot="lead" class="flex justify-center">
      <Upload />
    </div>
    <svelte:fragment slot="meta">PNG, JPG, and GIF allowed.</svelte:fragment>
  </FileDropzone>
</div>

<hr class="!border-t-2 mx-4" />
<section class="grid my-8 mx-4 grid-cols-2 md:grid-cols-3 gap-2">
  {#each images as image, index}
    <div class="image-container">
      <img class="h-auto max-w-full rounded-md" src={image} alt="" />
      <div class="overlay"></div>
      <div class="image-icons">
        <button
          use:clipboard={image}
          type="button"
          on:click={onClickHandler}
          class="btn variant-filled-primary font-normal"
        >
          <span>
            <Copy size="16" class="lg:mx-auto xl:mx-0" />
          </span>
          <span class="text-sm"> {copied ? "Copied 👍" : "Copy URL"} </span>
        </button>
        <button
          on:click={() => deleteImage(index)}
          type="button"
          class="btn variant-filled-warning font-normal"
        >
          <span>
            <Trash size="16" class="lg:mx-auto xl:mx-0" />
          </span>
          <span class="text-sm"> Delete </span>
        </button>
      </div>
    </div>
  {/each}
</section>
<hr class="!border-t-2 mx-4" />
<div class="flex flex-col items-center justify-center mt-8">
  <div class="text-xl font-bold m-auto text-center">
    70 % of your storage is used
  </div>
  <ProgressRadial
    stroke={120}
    value="70"
    class="mx-auto my-8"
    meter="stroke-primary-500"
    track="stroke-primary-500/30"
    strokeLinecap="butt">70%</ProgressRadial
  >
</div>
<hr class="!border-t-2 mx-4" />

<style>
  .image-container {
    position: relative;
    overflow: hidden; /* Ensures that nothing spills outside the container */
  }
  .image-container img {
    transition: all 0.3s ease;
    display: block;
  }
  .overlay {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none; /* Prevents overlay from blocking mouse events */
  }
  .image-container:hover .overlay {
    opacity: 1;
  }
  .image-icons {
    display: flex;
    flex-direction: column;
    gap: 10px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s ease;
    opacity: 0;
    pointer-events: none; /* Prevents icons from blocking mouse events */
  }
  .image-container:hover .image-icons {
    opacity: 1;
    pointer-events: auto; /* Allows interaction with the icons */
  }
  .btn {
    transition: background-color 0.3s ease; /* Smooth background transition */
  }
</style>
