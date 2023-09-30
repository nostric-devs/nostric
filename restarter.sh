cargo build --target wasm32-unknown-unknown --release --package relay
wasm-opt target/wasm32-unknown-unknown/release/relay.wasm --strip-debug -Oz -o target/wasm32-unknown-unknown/release/relay-opt.wasm

dfx deploy backend
dfx deploy frontend

# NOTE: this is only for local testing, relays are created dynamically
#dfx canister create relay --specified-id bd3sg-teaaa-aaaaa-qaaba-cai
#dfx deploy relay

# NOTE: do not deploy ckbtc_ledger to the IC it's already there
dfx canister create ckbtc_ledger --specified-id mxzaz-hqaaa-aaaar-qaada-cai
#dfx deploy ckbtc_ledger
#PRINCIPAL=$(dfx identity get-principal) && dfx deploy ckbtc_ledger --argument \"(variant {Init = record {minting_account = record { owner = principal \\\"$PRINCIPAL\\\" };transfer_fee = 10;token_symbol = \\\"ckBTC\\\";token_name = \\\"Token ckBTC\\\";metadata = vec {};initial_balances = vec {record { record {owner = principal \\\"$PRINCIPAL\\\"}; 100_000_000_000 } };archive_options = record {num_blocks_to_archive = 10_000;trigger_threshold = 20_000;cycles_for_archive_creation = opt 4_000_000_000_000;controller_id = principal \\\"$PRINCIPAL\\\";};}})\"  --mode=reinstall -y
PRINCIPAL=$(dfx identity get-principal)
dfx deploy ckbtc_ledger --argument "(variant {Init = record {minting_account = record { owner = principal \"$PRINCIPAL\" };transfer_fee = 0;token_symbol = \"ckBTC\";token_name = \"Token ckBTC\";metadata = vec {};initial_balances = vec {};archive_options = record {num_blocks_to_archive = 10_000;trigger_threshold = 20_000;cycles_for_archive_creation = opt 4_000_000_000_000;controller_id = principal \"$PRINCIPAL\";};}})"
