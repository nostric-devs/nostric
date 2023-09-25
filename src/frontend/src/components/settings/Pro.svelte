<script lang="ts">
  import { actor } from "../../store/auth";
  import { alert } from "../../store/alert";
  import { QRCodeImage } from "svelte-qrcode-image";
  import { onMount } from "svelte";
  import Spinner from "../utils/Spinner.svelte";
  import ClipboardCopy from "../utils/ClipboardCopy.svelte";

  let initializing : boolean = true;
  let address;
  let principal;
  let is_pro = false;

  const verify = async () => {
    initializing = true;
    let response = await actor.verifyPayment();
    if (response["ok"]){
      is_pro = true;
      alert.success("We have successfully verified the payment!");
    } else {
      alert.error("Couldn't verify the payment, try again!");
    }
    initializing = false;
  };

  onMount(async () => {
    initializing = true;
    address = await actor.getDepositAddress();
    principal = await actor.whoAmI();
    is_pro = await actor.verifyPayment(); // TODO get this from the user's profile instead
    initializing = false;
  });

</script>


{#if initializing}
  <div class="d-flex justify-center content-center">
    <div class="text-center opacity-70">
      <Spinner width="10"/>
    </div>
  </div>
{:else}
<div class="text-center">
  <div class="w-full shadow-2xl bg-base-100">
    <div>
      {#if !is_pro }
      <h1 class="text-2xl text-white font-bold">
        Get Nostric Pro features
      </h1>
      <div>Your principal: {principal}</div>
      <div>
        <img class="w-24 text-center mx-auto my-8" src="/img/ckbtc.png" alt="ckbtc">
        <h2 class="text-xl mt-4 mb-4">Deposit 10 sats (ckBTC) to this address to become a pro:</h2>
        <ClipboardCopy copyValue={address}></ClipboardCopy>
        <QRCodeImage
        text={address}
        displayStyle="border-style: dotted;"
        width="200"
        displayWidth="200"
        displayClass="mt-8 mx-auto text-center"
        />
      </div>
      <!-- Get the principal to generate subaAccount blob and make a payment locally via shell command -->

      <!-- <div>Is pro? {isPro}</div> -->
      <button class="btn btn-primary my-8 mx-16" on:click={verify}>Verify payment</button>
      {:else}
        <h1 class="text-2xl text-white font-bold">Congratulations! You are a Nostr Pro user!</h1>
      {/if}
    </div>
  </div>
</div>
{/if}
