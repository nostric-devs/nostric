<script lang="ts">
  import { actor } from "../../store/auth";
  import { alert } from "../../store/alert";
  import { onMount } from "svelte";
  import Spinner from "../utils/Spinner.svelte";

  let initializing : boolean = true;
  let address;
  let principal;
  let isPro = false;

  const init = async () => {
    initializing = true;
    address = await actor.getDepositAddress();
    principal = await actor.whoAmI();
    isPro = await actor.verifyPayment();
    console.log(address);
    initializing = false;
  }

  const verify = async () => {
    initializing = true;
    let res = await actor.verifyPayment();
    if (res){
      isPro = true;
      alert.success("We have successfully verified the payment!");
    } else {
      alert.error("Couldn't verify the payment, try again!");
    }
    initializing = false;
  };



  onMount(init);
</script>


{#if initializing}
  <div class="d-flex justify-center content-center">
    <div class="text-center opacity-70">
      <Spinner width="10"/>
    </div>
  </div>
{:else}
<div class="max-w-2xl mx-auto text-center">
  <div class="card w-full shadow-2xl bg-base-100">
    <div class="card-body p-0">
      {#if !isPro }
      <h1 class="text-2xl text-white font-bold">
        Get Nostric Pro features
      </h1>
      <div>Your principal: {principal}</div>
      <div>
        <img class="w-24 text-center mx-auto my-8" src="/img/ckbtc.png" alt="ckbtc">
        <h2 class="text-xl mt-4 mb-4">Deposit 10 sats (ckBTC) to this address to become a pro:</h2>
        {address}
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