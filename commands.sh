# run this to get the blob of the subAccount of specific user
# get the Principal of the logged in user from the UI
dfx canister call backend getSubaccountForPrincipal '("x5xek-wakn3-5bwcf-pihmz-yneos-chtig-pm3dx-qct5r-qvhwm-6jjak-nqe")'


# run this to make a payment locally
# owner principal should be a backend canister ID
# subaccount should be a blob that you can get from getSubaccount call
dfx canister call ckbtc_ledger icrc1_transfer '(
record {
    to = record {
      owner = principal "asrmz-lmaaa-aaaaa-qaaeq-cai";
      subaccount = opt blob "\00\00\1d\0an\fa\1b\08\afA\d9\9c4\8e\90\8f4\19\ec\d8\ef\01O\b1\85Ofy)\02\9b\02";
    };
    amount = 100 : nat;
  },
)'
