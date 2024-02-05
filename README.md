# Nostric

Nostric is yet a very simple Nostr client running on the Internet Computer Protocol (ICP). We started this project as a submission to the Vetkey challenge bounty released by the DFINITY foundation. The main idea is to store Nostr private keys encrypted in the backend of the application. This makes managing private keys secure and also improves UX as an user does not need to use any Chrome extensions to sign posts.

However, there we see more synergies between Nostr and ICP and it would be great to continue with this project to deliver a fully featured Nostr client and eventually relay server as well.

### Supported features

Our client currently supports these features:

- Generate PK, SK
- Create a profile
- Update profile
- NIP-01 kind:1 Post publish
- NIP-01 kind:0 User Metadata publish

### Canisters

Current architecture consists of 4 canisters for local development:

- frontend canister
- backend canister
- vetkd_system_api canister
- internet identity canister (for local developlment only)

## Deploy locally

1. Get a clone of this repository:

```
git clone https://github.com/lukasvozda/nostric.git
```

2. [Install DFX](https://sdk.dfinity.org/docs/quickstart/local-quickstart.html) and [install Mops](https://docs.mops.one/quick-start)
3. Run npm install to install JS dependencies:

```
npm install
```

4. Start your local replica:

```
dfx start --clean
```

5. Now run in the new shell execute the deploy script:

```
dfx deploy
```

If your src/declarations folder does not create run:

```
dfx generate
```

6. Run your development server:

```
npm run dev
```
