<script lang="ts">

  export let profile;
  export let size = "24";

  let user_name = "";
  let image_url = "";
  const image_formats = /\.(jpeg|jpg|gif|png|webp)$/i;

  $: if (profile) {
    if (profile.name) {
      user_name = profile.name[0];
    } else if (profile.displayName) {
      user_name = profile.displayName[0];
    }
  }

  $: if (profile) {
    if (profile.image && image_formats.test(profile.image)) {
      fetch(profile.image).then((response) => {
        image_url = response.ok ? profile.image : "";
      }).catch(() => {
        image_url = "";
      })
    } else {
      image_url = "";
    }
  }

</script>

{#if image_url }
  <div class="avatar">
    <div class="rounded-full mr-4" style="width: {size}px; height: {size}px;">
      <img src="{ image_url }" alt="avatar"/>
    </div>
  </div>
{:else}
  <div class="avatar placeholder">
    <div class="bg-primary text-neutral-content rounded-fully mr-4 rounded-full" style="width: {size}px; height: {size}px;">
      <span style="font-size: {size / 2}px">{ user_name }</span>
    </div>
  </div>
{/if}
