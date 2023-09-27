<script lang="ts">
  import { actor, auth_user, nostric_service } from "../../store/auth";
  import { alert } from "../../store/alert";
  import { QRCodeImage } from "svelte-qrcode-image";
  import { onMount } from "svelte";
  import Spinner from "../utils/Spinner.svelte";
  import ClipboardCopy from "../utils/ClipboardCopy.svelte";
  import { Icon } from "svelte-feathers";

  let initializing : boolean = false;
  let address;
  let principal;

  const verify = async () => {
    initializing = true;
    let response = await actor.handlePayment(process.env.DFX_NETWORK === "ic");
    if (response["ok"]){
      auth_user.is_pro = true;
      auth_user.private_relay = response["ok"];
      nostric_service.close_pool();
      nostric_service.init_private_relay(response["ok"].gateway_url, response["ok"].canister_id);
      alert.success("We have successfully verified the payment! Your relay will be activated shortly");
    } else {
      alert.error("Couldn't verify the payment, try again!");
    }
    initializing = false;
  };

  onMount(async () => {
    if (!auth_user.is_pro) {
      initializing = true;
      address = await actor.getDepositAddress();
      principal = await actor.whoAmI();
      initializing = false;
    }
  });

</script>

{#if initializing}
  <div class="d-flex justify-center content-center">
    <div class="text-center opacity-70">
      <Spinner width="10"/>
    </div>
  </div>
{:else}
<div class="w-full">
  {#if !auth_user.is_pro }
    <div class="text-center shadow-2xl bg-base-100">
      <h1 class="text-3xl text-white mb-6 font-bold">
        Get Nostr<span class="text-primary">ic</span> Pro features
      </h1>
      <div>Your principal</div>
      <div>{ principal }</div>
      <div>
        <img class="w-24 text-center mx-auto my-8" src="/img/ckbtc.png" alt="ckbtc">
        <h2 class="text-xl mt-4 mb-4">Deposit 10 sats (ckBTC) to this address to become a pro:</h2>
        <div class="w-3/4">
          <ClipboardCopy copyValue={ address }></ClipboardCopy>
        </div>
        <QRCodeImage
          text={ address }
          displayStyle="border-style: dotted;"
          width="200"
          displayWidth="200"
          displayClass="mt-8 mx-auto text-center"
        />
      </div>
    </div>
  {:else}
    <div class="pl-6">
      <div class="text-3xl text-white mb-8 font-bold flex">
        Nostric
        <span class="mx-2 flex text-warning">
          PRO <Icon name="star" width="35" height="35" color="#F7DC6F"></Icon>
        </span>
        is active
      </div>
      <div class="grid grid-cols-6 items-center">
        <div class="mr-2 text-primary font-bold">Gateway URL</div>
        <div class="col-span-5">
          <ClipboardCopy copyValue={ auth_user.private_relay.gateway_url } />
        </div>
      </div>
      <div class="grid grid-cols-6 items-center">
        <div class="mr-2 text-primary font-bold">Canister ID</div>
        <div class="col-span-5">
          <ClipboardCopy copyValue={ auth_user.private_relay.canister_id } />
        </div>
      </div>
    </div>
  {/if}
</div>
{/if}
