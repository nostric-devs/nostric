dfx deploy internet_identity --argument '(null)'
dfx canister create vetkd_system_api --specified-id br5f7-7uaaa-aaaaa-qaaca-cai
dfx deploy vetkd_system_api
dfx deploy backend
dfx canister create frontend --specified-id bw4dl-smaaa-aaaaa-qaacq-cai
dfx deploy frontend
