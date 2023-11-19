<script lang="ts">
  import { Autocomplete } from "@skeletonlabs/skeleton";
  import { computePosition, autoUpdate, offset, shift, flip, arrow } from "@floating-ui/dom";
  import { storePopup } from '@skeletonlabs/skeleton';
  import { popup } from '@skeletonlabs/skeleton';
  import type { PopupSettings } from '@skeletonlabs/skeleton';
  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

  let popupSettings: PopupSettings = {
    event: "focus-click",
    target: "popupAutocomplete",
    placement: "bottom",
  };

  function onPopUpSelect(event: CustomEvent): void {
    console.log(event.detail.label);
    inputValue = event.detail.label;
  }

  export let options = [];
  export let inputValue = "";


</script>

<input
  class="input autocomplete px-3 py-2 rounded-2xl"
  type="search"
  name="autocomplete-search"
  bind:value={inputValue}
  placeholder="Start typing"
  use:popup={popupSettings}
/>
<div data-popup="popupAutocomplete">
  <Autocomplete
    bind:input={inputValue}
    options={options}
    on:selection={onPopUpSelect}
  />
</div>
