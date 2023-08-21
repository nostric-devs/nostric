<script lang="ts">
  import { onMount } from "svelte";
  import Login from "./components/Login.svelte"
  import { crypto_service, auth_state, AuthStates, logout_from_ii } from "./store/auth";
  import { generatePrivateKey, getPublicKey, validateEvent, verifySignature, getSignature, getEventHash, relayInit} from 'nostr-tools'
  import Profile from "./components/Profile.svelte";


  // initiate nostr relay
  const relay = relayInit('wss://relay.nostr.band')


  relay.on('connect', () => {
    console.log(`connected to ${relay.url}`)
  })
  relay.on('error', () => {
    console.log(`failed to connect to ${relay.url}`)
  })

  const connectRelay = async () => {
    await relay.connect()
  }

  // generate nostr sk and pk
  //let sk = generatePrivateKey() // `sk` is a hex string
  //let pk = getPublicKey(sk) // `pk` is a hex string
  let sk = "ad67dc60bf6eae493ce6820c380e39a9f682d39c2131b47078f012d3ce916bb4"
  let pk = "d804dda30c35fc76fc79a92c913537231e91c90e8a1461a2edc1dab0af956e15"
  console.log("secret key", sk)
  console.log("public key", pk)

  let sub = relay.sub([
    {
      kinds: [1],
      authors: [getPublicKey(pk)]
    }
  ])

  sub.on('event', event => {
    console.log('got event:', event)
  })

  // create a nostr event
  let event = {
    kind: 1,
    created_at: Math.floor(Date.now() / 1000),
    tags: [],
    content: 'hello this is my first noster post',
    pubkey: getPublicKey(pk)
  }
  console.log(getPublicKey(pk))
  event.id = getEventHash(event)
  event.sig = getSignature(event, pk)

  let ok = validateEvent(event)
  let veryOk = verifySignature(event)
  console.log(ok,veryOk)
  

  // publish event
  const publishEvent = async () => {
    await relay.publish(event)
    console.log("event published", event.id)
    

  }


  let key = "0123456789101112";
  let encrypted = "";
  let decrypted = "";

  const plug_and_play = async () => {
    encrypted = await crypto_service.encrypt(key);
    decrypted = await crypto_service.decrypt(encrypted);
  }
  //onMount(connectRelay)
</script>
<div class="lg:container lg:mx-auto">
  <div class="navbar bg-primary text-primary-content">
    <div class="navbar-start">
    <a href="/" class="btn btn-ghost normal-case text-xl">Nostric</a>
    </div>
    <div class="navbar-end">
      <button on:click={logout_from_ii} class="btn">Logout</button>
    </div>
  </div>
  
</div>


{#if $auth_state === AuthStates.AUTHENTICATED}

  <!-- <div>
    <div>key value: { key }</div>
    <button class="btn btn-primary" on:click={plug_and_play}>
      click to showcase encrypt & decrypt the above key
    </button>
    <div>encrypted: { encrypted }</div>
    <div>decrypted: { decrypted }</div>
  </div>

  <button class="btn btn-primary" on:click={publishEvent}>
    Publish event
  </button>

  <button class="btn btn-primary" on:click={getProfile}>
    get profile
  </button> -->
  <!-- {profile} -->
  <Profile />
{:else}
  <Login />
{/if}

<style lang="postcss" global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>
