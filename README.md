npm install
dfx stop
rm -rf .dfx
dfx start --clean
dfx deploy internet_identity --argument '(null)'
dfx canister create vetkd_system_api --specified-id s55qq-oqaaa-aaaaa-aaakq-cai
dfx deploy vetkd_system_api
dfx deploy backend
dfx deploy frontend
