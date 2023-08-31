<script>
  import { Icon } from "svelte-feathers";
  import { alert } from "../store/alert";

  // Tailwind won't load dynamic alert class, hotfix
  let level_to_icon_map = {
    info: { icon_name: "info", color: "hsl(var(--in))" },
    success: { icon_name: "check-circle", color: "hsl(var(--su))"},
    warning: { icon_name: "alert-circle", color: "hsl(var(--wa))"},
    error: { icon_name: "alert-triangle", color: "hsl(var(--er))"}
  }

  let active_alert;
  $: active_alert = $alert;

  let alert_class;
  let alert_icon;
  $: alert_class = active_alert ? level_to_icon_map[active_alert?.level].color : "";
  $: alert_icon = active_alert ? level_to_icon_map[active_alert?.level].icon_name : "";

</script>
{#if active_alert !== null}
<div class="alert w-5/6 mx-auto rounded-3xl" style="background-color: {alert_class};">
  <div class="flex content-center">
    <Icon name={ alert_icon } class="mr-6"/>
    <span>{ active_alert.text }</span>
  </div>
  <div class="ml-auto">
    <Icon
      name="x-circle"
      class="cursor-pointer hover:scale-110"
      on:click={ () => alert.clear() }
    />
  </div>
</div>
{/if}
