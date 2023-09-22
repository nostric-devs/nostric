<script lang="ts">
  import { onMount } from "svelte";
  import { NostricHandler } from "./websockets/nostric";
  import { nostric_events } from "./store/nostric";

  // let canister_id = "bd3sg-teaaa-aaaaa-qaaba-cai";
  let ic_url = "http://localhost:8000";
  let gateway_url = "ws://0.0.0.0:8089";
  let foreign_relay_canister_id = "b77ix-eeaaa-aaaaa-qaada-cai";

  let public_key = "7c3a7e0bce2f99be4d3c7ca146097c0c5344b691e859d33f60a7e4386f488bc4";
  let private_key = "e349f55622c9682ec8bdc05d66cc1600a23099796cb02c95946621f4c2402046";
  let nostric_handler = new NostricHandler(
    private_key,
    public_key,
    gateway_url,
    ic_url,
    true,
    false,
  );

  onMount(async () => {
    console.log("initializing private relay");
    await nostric_handler.init_private_relay();


    const foreign_relay = nostric_handler.init_foreign_relay(
      gateway_url, foreign_relay_canister_id
    );

    console.log("initializing pool containing our relay and a foreign user relay");
    await nostric_handler.init_pool([foreign_relay], public_key);

    // console.log("pushing to private relay");
    // await nostric_handler.publish_to_private_relay("hello world");

  });

</script>

<div>
  {#each $nostric_events as event}
    <div>Kind: { event.kind }</div>
    <div>Tags: { event.tags }</div>
    <div>Content: { event.content }</div>
    <div>Created at: { event.created_at }</div>
    <div>Pubkey: { event.pubkey }</div>
    <div>Id: { event.id }</div>
    <div>Sig: { event.sig }</div>
    <div>-----------------</div>
  {/each}
</div>
