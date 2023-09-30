
use crate::{Principal, RuntimeState, TimestampMillis, RUNTIME_STATE};
use candid::{CandidType, Encode, Nat};

use ic_cdk::{print};
use serde::{Deserialize, Serialize};
use std::cell::{RefMut};

use std::collections::HashMap;

//Business State
#[derive(CandidType, Deserialize, Debug, Default)]
pub struct BusinessState {
    bucket_indexes: HashMap<Principal, EffectiveIndex>,
    pub(crate) global_index: GlobalIndex,
}

#[derive(CandidType, Deserialize, Debug, Default, Clone)]
pub struct GlobalIndex {
    pub(crate) tag_to_canisters: HashMap<String, Vec<Principal>>,
    pub(crate) last_updated: TimestampMillis,
}

#[derive(CandidType, Default, Debug, Serialize, Deserialize, Eq, PartialEq, Clone)]
pub struct EffectiveIndex {
    tags: Vec<String>,
    current_entries: u64,
    bucket_max_entries: u64,
}


// This way of importing creates a larger index canister binary. We could upload the bucket wasm
// bytes after the installation, in a config update call. This would create a smaller
// Index binary but it would require a two step process in installing the canister.
const BUCKET_WASM: &[u8] = std::include_bytes!(
    "../../../target/wasm32-unknown-unknown/release/relay-opt.wasm"
);

// This is the section that implements all our business logic, on top
// of the business state.
impl BusinessState {
    pub fn add_bucket_index(&mut self, canister_id: Principal, effective_index: EffectiveIndex) {
        self.bucket_indexes.insert(canister_id, effective_index);
    }

    pub fn get_index_by_tag(&self, tag: &str) -> Vec<Principal> {
        self.global_index
            .tag_to_canisters
            .get(tag)
            .unwrap_or(&vec![])
            .clone()
    }

    pub fn get_all_buckets(&self) -> Vec<Principal> {
        self.bucket_indexes.keys().map(|key| key.clone()).collect()
    }

    // We can't send a hashmap<String, Vec<Principal>> as candid encoded data,
    // so we convert everything to strings. This will only be used for demo
    // purposes, so we should be fine here. This is not needed for business logic.
    pub fn get_index_tag2can_as_vec(&self) -> Vec<Vec<String>> {
        let mut t2c_vec: Vec<Vec<String>> = vec![];

        for (key, value) in self.global_index.tag_to_canisters.iter() {
            let mut row: Vec<String> = vec![];
            row.push(key.clone());
            for p in value.iter() {
                row.push(p.clone().to_string())
            }
            t2c_vec.push(row);
        }

        t2c_vec
    }
}

// New bucket spawning, Inter canister communication and other canister 2 canister

pub async fn spawn_bucket() -> String {

    // prep canister create
    let canister_create_args =
        RUNTIME_STATE.with(|state| prep_canister_create(state.borrow_mut()));

    // call canister create
    let canister_id = call_canister_create(canister_create_args).await;

    // call_canister_create will return anonymous if it can't create a bucket
    if canister_id != Principal::anonymous() {
        print(format!("Created canister: {}", canister_id.to_text()));

        // prep canister install
        let canister_install_args = Encode!(&CanisterInstallSendArgs {
            greet: "Hello from Index".to_string(),
            controllers: vec![Principal::from_text(
                "l6s27-7ndcl-nowe5-xeyf7-ymdnq-dkemz-jkhfw-zr5wu-jvf2p-aupzq-2qe",
            )
            .unwrap(),],
        })
        .unwrap();

        // call canister install
        let result: bool = call_canister_install(&canister_id, canister_install_args).await;
        print(format!("Cannister install: {}", result));
        return canister_id.to_text();
    }
    String::new()
}

async fn call_canister_install(canister_id: &Principal, canister_install_args: Vec<u8>) -> bool {
    let install_config: CanisterInstall = CanisterInstall {
        mode: InstallMode::Install,
        canister_id: canister_id.clone(),
        wasm_module: BUCKET_WASM.to_vec(),
        arg: canister_install_args,
    };

    match ic_cdk::api::call::call_with_payment(
        Principal::management_canister(),
        "install_code",
        (install_config,),
        110_000_000_000,
    )
    .await
    {
        Ok(x) => x,
        Err((code, msg)) => {
            print(format!(
                "An error happened during the call: {}: {}",
                code as u8, msg
            ));
            return false;
        }
    };

    true
}

async fn call_canister_create(canister_create_args: CreateCanisterArgs) -> Principal {
    print("creating bucket...");

    #[derive(CandidType)]
    struct In {
        settings: Option<CreateCanisterSettings>,
    }

    let in_arg = In {
        settings: Some(canister_create_args.settings),
    };

    let (create_result,): (CanisterIdRecord,) = match ic_cdk::api::call::call_with_payment(
        Principal::management_canister(),
        "create_canister",
        (in_arg,),
        110_000_000_000,
    )
    .await
    {
        Ok(x) => x,
        Err((code, msg)) => {
            print(format!(
                "An error happened during the call: {}: {}",
                code as u8, msg
            ));

            (CanisterIdRecord {
                canister_id: Principal::anonymous(),
            },)
        }
    };

    // print(format!("{}", create_result.canister_id.to_text()));

    create_result.canister_id
}

fn prep_canister_create(runtime_state: RefMut<RuntimeState>) -> CreateCanisterArgs {
    let controller_id = runtime_state.env.canister_id();

    // Add your own principal as a controller, in case manual control is needed
    let create_args = CreateCanisterArgs {
        cycles: 100_000_000_000,
        settings: CreateCanisterSettings {
            controllers: Some(vec![
                controller_id.clone(),
                Principal::from_text(
                    "l6s27-7ndcl-nowe5-xeyf7-ymdnq-dkemz-jkhfw-zr5wu-jvf2p-aupzq-2qe",
                )
                .unwrap(),
            ]),
            compute_allocation: None,
            memory_allocation: None,
            freezing_threshold: None,
        },
    };

    create_args
}


#[derive(CandidType, Deserialize)]
struct CanisterInstallSendArgs {
    greet: String,
    controllers: Vec<Principal>,
}

#[derive(CandidType, Clone, Deserialize, Debug)]
pub struct CanisterIdRecord {
    pub canister_id: Principal,
}

#[derive(CandidType, Debug, Clone, Deserialize)]
pub struct CreateCanisterSettings {
    pub controllers: Option<Vec<Principal>>,
    pub compute_allocation: Option<Nat>,
    pub memory_allocation: Option<Nat>,
    pub freezing_threshold: Option<Nat>,
}

#[derive(CandidType, Clone, Deserialize)]
pub struct CreateCanisterArgs {
    pub cycles: u64,
    pub settings: CreateCanisterSettings,
}

#[derive(CandidType, Deserialize)]
enum InstallMode {
    #[serde(rename = "install")]
    Install,
    #[serde(rename = "reinstall")]
    Reinstall,
    #[serde(rename = "upgrade")]
    Upgrade,
}

#[derive(CandidType, Deserialize)]
struct CanisterInstall {
    mode: InstallMode,
    canister_id: Principal,
    #[serde(with = "serde_bytes")]
    wasm_module: Vec<u8>,
    #[serde(with = "serde_bytes")]
    arg: Vec<u8>,
}
