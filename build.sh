dfx deploy backend
dfx deploy frontend
dfx canister create ckbtc_ledger --specified-id mxzaz-hqaaa-aaaar-qaada-cai
PRINCIPAL=$(dfx identity get-principal)
dfx deploy ckbtc_ledger --argument "(variant {Init = record {minting_account = record { owner = principal \"$PRINCIPAL\" };transfer_fee = 0;token_symbol = \"ckBTC\";token_name = \"Token ckBTC\";metadata = vec {};initial_balances = vec {};archive_options = record {num_blocks_to_archive = 10_000;trigger_threshold = 20_000;cycles_for_archive_creation = opt 4_000_000_000_000;controller_id = principal \"$PRINCIPAL\";};}})"
