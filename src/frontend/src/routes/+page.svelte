<script lang="ts">
	import "../../../app.postcss";
	import {
    createActor,
	} from "../../../declarations/backend";
	import { AuthClient } from "@dfinity/auth-client";
	import { HttpAgent } from "@dfinity/agent";
	import * as vetkd from "../../vetkd_user_lib/ic_vetkd_utils.js";


	const logIn = async () => {
		let authClient = await AuthClient.create();
    
    // start the login process and wait for it to finish
    await new Promise((resolve) => {
        authClient.login({
            identityProvider:
                process.env.DFX_NETWORK === "ic"
                    ? "https://identity.ic0.app" :
                    `http://${process.env.INTERNET_IDENTITY_CANISTER_ID}.localhost:8000/#authorize`,
            onSuccess: resolve,
        });
    });
    const identity = authClient.getIdentity();
    const agent = new HttpAgent({ identity });
    let actor = createActor(import.meta.env.VITE_INTERNET_IDENTITY_CANISTER_ID, {
        agent,
    });
		console.log(authClient.isAuthenticated())
    return false;
};

</script>

<main>
	<img src="logo2.svg" alt="DFINITY logo" />
	<br />
	<br />

	<button type="button" on:click={logIn} class="btn variant-filled">Login</button>

</main>

<style lang="scss">
	img {
		max-width: 50vw;
		max-height: 25vw;
		display: block;
		margin: auto;
	}
</style>
