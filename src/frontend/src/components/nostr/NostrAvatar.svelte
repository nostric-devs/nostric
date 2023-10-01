<script lang="ts">

  export let profile;
  export let size = "24";

  const image_formats = /\.(jpeg|jpg|gif|png|webp)$/i;
  let user_name : string = "";
  let display_placeholder : boolean = true;
  let img_element;

  $: if (profile) {
    if (profile.name) {
      user_name = profile.name[0];
    } else if (profile.displayName) {
      user_name = profile.displayName[0];
    }
    if (profile.image && image_formats.test(profile.image)) {
      display_placeholder = false;
    }
  }

  const handle_load = () => {
    display_placeholder = img_element.naturalWidth === 0 && img_element.naturalHeight === 0;
  }

</script>

{#if !display_placeholder }
  <div class="avatar">
    <div class="rounded-full mr-4" style="width: {size}px; height: {size}px;">
      <img
        src="{ profile?.image }"
        alt="avatar"
        on:error={ () => display_placeholder = true }
        on:load={ handle_load }
        bind:this={ img_element }
      />
    </div>
  </div>
{:else}
  <div class="avatar placeholder">
    <div class="bg-primary text-neutral-content rounded-fully mr-4 rounded-full" style="width: {size}px; height: {size}px;">
      <span style="font-size: {size / 2}px">{ user_name }</span>
    </div>
  </div>
{/if}
