<script lang="ts">
  import { getToastStore, type ToastStore } from "@skeletonlabs/skeleton";
  import { authUser } from "$lib/stores/Auth";

  let processing: boolean = false;
  const toastStore: ToastStore = getToastStore();

  const onFileLand = async (event: Event) => {
    const inputFiles = (event.target as HTMLInputElement).files;

    if (inputFiles && inputFiles.length > 0) {
      if (inputFiles[0].size > 2097152) {
        toastStore.trigger({
          message: "You cannot upload an image with size exceeding 2 MB.",
          background: "variant-filled-warning",
        });
      } else {
        processing = true;
        try {
          await $authUser.identity.uploadFile(inputFiles[0]);
          toastStore.trigger({
            message: "Image successfully uploaded to storage.",
            background: "variant-filled-success",
          });
        } catch (error) {
          console.error(error);
          toastStore.trigger({
            message: "Unable to upload image.",
            background: "variant-filled-error",
          });
        } finally {
          processing = false;
        }
      }
    }
  };
</script>

<slot {onFileLand} {processing} />
