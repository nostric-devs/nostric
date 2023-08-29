# Nostric

Nostric is yet a very simple Nostr client running on the Internet Computer Protocol (ICP). We started this project as a submission to the Vetkey challenge bounty released by the DFINITY foundation. The main idea is to store Nostr private keys encrypted in the backend of the application. This makes managing private keys secure and also improves UX as an user does not need to use any Chrome extensions to sign posts.

However, there we see more synergies between Nostr and ICP and it would be great to continue with this project to deliver a fully featured Nostr client and eventually relay server as well.

## Deploy locally

1. Get a clone of this repository:
```
git clone https://github.com/lukasvozda/nostric.git
```
2. [Install DFX](https://sdk.dfinity.org/docs/quickstart/local-quickstart.html)
3. Run npm install to install JS dependencies:
```
npm install
```
4. Start your local replica
```
dfx start --clean
```
5. Now run in the new shell execute the deploy script:
```
sh ./restarter.sh
```
Or you can execute these commands one by one:
```
dfx deploy internet_identity --argument '(null)'
dfx canister create vetkd_system_api --specified-id br5f7-7uaaa-aaaaa-qaaca-cai
dfx deploy vetkd_system_api
dfx deploy backend
dfx deploy frontend
```
If your src/declarations folder does not create run:
```
dfx generate
```
6. Run your development server
```
npm run dev
```



