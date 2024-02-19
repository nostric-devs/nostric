#!/bin/bash
if [ "$DFX_NETWORK" != "ic" ]; then
  echo "Building local CKBTC ledger canister"
  sed -i '' 's/service : {/service : (ledger_arg : LedgerArg) -> {/' icrc1.local.did
  dfx deploy ckbtc_ledger
  sed -i '' 's/service : (ledger_arg : LedgerArg) -> {/service : {/g' icrc1.local.did
fi
