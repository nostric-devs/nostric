#!/bin/bash
if [ "$DFX_NETWORK" != "ic" ]; then
  echo "Building local CKBTC ledger canister"
  if [[ $(uname) == "Linux" ]]; then
      # Linux (GNU sed)
      SED_INPLACE="-i"
  else
      # macOS (BSD sed)
      SED_INPLACE="-i .bak"
  fi
  sed $SED_INPLACE 's/service : {/service : (ledger_arg : LedgerArg) -> {/' icrc1.local.did
  dfx deploy ckbtc_ledger
  sed $SED_INPLACE 's/service : (ledger_arg : LedgerArg) -> {/service : {/g' icrc1.local.did
  if [ -f "icrc1.local.did.bak" ]; then
      rm "icrc1.local.did.bak"
  fi
fi
