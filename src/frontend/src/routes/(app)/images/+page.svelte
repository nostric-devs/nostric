<script lang="ts">
  import { Upload } from "svelte-feathers";
  import {
    FileDropzone,
    ProgressRadial,
    getToastStore,
    type ToastStore,
  } from "@skeletonlabs/skeleton";
  import { authUser } from "$lib/stores/Auth";
  import { onMount } from "svelte";
  import UploadImage from "$lib/components/images/UploadImage.svelte";
  import ImageTile from "$lib/components/images/ImageTile.svelte";
  import { files } from "$lib/stores/Files";

  let loading: boolean = false;

  const toastStore: ToastStore = getToastStore();

  onMount(async () => {
    if ($files.length === 0) {
      try {
        loading = true;
        await $authUser.identity.getFiles();
      } catch (error) {
        console.error(error);
        toastStore.trigger({
          message: "Unable to load user images from storage.",
          background: "variant-filled-error",
        });
      } finally {
        loading = false;
      }
    }
  });
</script>

<h1 class="h1 m-4">Images</h1>

<div class="m-4">
  Here you can manage your uploaded media files. If you remove image from here,
  it will not be loaded in your posts.
</div>

<UploadImage let:onFileLand let:processing>
  <div class="mx-4 my-8">
    <FileDropzone
      name="files-dropzone"
      accept="image/*"
      on:change={onFileLand}
      disabled={processing}
    >
      <div slot="lead" class="flex justify-center">
        {#if processing}
          <ProgressRadial value={undefined} width="w-6" />
        {:else}
          <Upload />
        {/if}
      </div>
      <svelte:fragment slot="meta">
        PNG, JPG, and GIF allowed. Max allowed file size is 2 MB.
      </svelte:fragment>
    </FileDropzone>
  </div>
</UploadImage>

<hr class="!border-t-2 mx-4" />

{#if loading}
  <div class="grid my-8 mx-4 grid-cols-2 md:grid-cols-3 gap-2">
    {#each { length: 6 } as _}
      <div class="placeholder animate-pulse py-20" />
    {/each}
  </div>
{:else if $files && $files.length > 0}
  <div class="grid my-8 mx-4 grid-cols-2 md:grid-cols-3 gap-2">
    {#each $files as url}
      <ImageTile {url} />
    {/each}
  </div>
{:else}
  <div class="px-4 my-10">This user has no stored images.</div>
{/if}

<hr class="!border-t-2 mx-4" />

<div class="flex flex-col items-center justify-center mt-8">
  <div class="text-xl font-bold m-auto text-center">
    70 % of your storage is used
  </div>

  <ProgressRadial
    stroke={120}
    value={70}
    class="mx-auto my-8"
    meter="stroke-primary-500"
    track="stroke-primary-500/30"
    strokeLinecap="butt"
  >
    70%
  </ProgressRadial>
</div>

<hr class="!border-t-2 mx-4" />
