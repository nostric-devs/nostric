<script>
  import UserAvatar from "./UserAvatar.svelte";

  let creation_time = "";

  export let profile = null;
  export let event = null;

  $: event ? creation_time = new Date(event.created_at * 1000).toLocaleString() : "";

</script>

<div class="bg-gray-100 mb-4 p-2 rounded">
  <div class=" flex items-start">
    <UserAvatar name={ profile?.name } image={ profile?.image }/>
    <div class="ml-2">
      <div>{ creation_time }</div>
      <p class="text-base mt-2">{ event.content }</p>
    </div>
  </div>
</div>
