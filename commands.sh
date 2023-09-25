# run this to get the blob of the subAccount of specific user
# get the Principal of the logged in user from the UI
dfx canister call backend getSubaccountForPrincipal '("c3kbn-fs43t-4eoog-es4az-o2ina-a2gu6-yiiti-ovxvd-6jvkg-yk77a-qae")'


# run this to make a payment locally 
# owner principal should be a backend canister ID
# subaccount should be a blob that you can get from getSubaccount call
dfx canister call ckbtc_ledger icrc1_transfer '(
record {
    to = record {
      owner = principal "be2us-64aaa-aaaaa-qaabq-cai";
      subaccount = opt blob "\00\00\1d\5c\dc\f8G8\c4\97\01\97i\0d\004j{\08D\d0\ea\de\a3\f2j\a3a_\f8 \02";
    };
    amount = 100 : nat;
  },
)'