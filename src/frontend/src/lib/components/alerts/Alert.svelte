<script lang="ts">
  import { alert, AlertTypes } from "$lib/stores/Alerts";
  import type { Alert } from "$lib/stores/Alerts";
  import { CheckCircle, AlertCircle, AlertTriangle, X } from "svelte-feathers";
  import type { ComponentType } from "svelte";
  import { onMount } from "svelte";
  import { navigating } from "$app/stores";

  let component: ComponentType;
  let classVariant: string = "";
  let alertData: Alert;

  $: $navigating, alert.clear();
  $: $alert, (alertData = alert.getData());
  $: if (alertData) {
    if (alertData.type === AlertTypes.ERROR) {
      component = AlertTriangle;
      classVariant = "variant-gradient-error-warning";
    } else if (alertData.type === AlertTypes.WARNING) {
      component = AlertCircle;
      classVariant = "variant-gradient-warning-error";
    } else {
      component = CheckCircle;
      classVariant = "variant-gradient-success-warning";
    }
  }
</script>

{#if $alert}
  <aside class="alert bg-gradient-to-br {classVariant} rounded-3xl">
    <svelte:component this={component} size="40" />
    <div class="alert-message">
      <h3 class="h3">{alertData.title}</h3>
      <p>{alertData.message}</p>
    </div>
    <div class="alert-actions">
      <button
        type="button"
        class="btn-icon variant-filled"
        on:click={() => alert.clear()}
      >
        <X />
      </button>
    </div>
  </aside>
{/if}
