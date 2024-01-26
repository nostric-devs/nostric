<script lang="ts">
  export let disabled: boolean = false;
  export let popupMessage: string;
</script>

<button
  type="button"
  class="btn btn-sm max-w-[38px] hover:max-w-[250px] h-[38px] transition-[max-width] ease-in-out duration-500 px-2 rounded-3xl variant-soft group"
  {disabled}
  on:click
>
  <span class="mx-1 [&>*]:pointer-events-none"><slot /></span>
  <span
    class="!mx-0 max-w-0 transition-[max-width] ease-in-out duration-500 group-hover:max-w-[300px] overflow-hidden"
  >
    {popupMessage}
  </span>
</button>
