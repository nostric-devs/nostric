mod businesslogic;
mod env;
mod lifetime;

use crate::businesslogic::{BusinessState, EffectiveIndex};
use crate::env::{CanisterEnv, EmptyEnv, Environment, TimestampMillis};
use ic_cdk::export::candid::{CandidType, Principal, candid_method, export_service};
use ic_cdk_macros::*;
use serde::Deserialize;

use std::cell::{Ref, RefCell, RefMut};
use ic_cdk::api;
use lazy_static::lazy_static;
use std::sync::Mutex;

#[derive(Debug)]
pub struct Error {
    pub code: u8,
    pub msg: String,
}

thread_local! {
    static RUNTIME_STATE: RefCell<RuntimeState> = RefCell::default();
}

lazy_static! {
    static ref PRINCIPAL_STORAGE: Mutex<PrincipalStorage> = Mutex::new(PrincipalStorage::new());
}

struct RuntimeState {
    pub env: Box<dyn Environment>,
    pub data: Data,
}

struct PrincipalStorage {
    creator: Principal
}

impl PrincipalStorage {
    fn new() -> Self {
        PrincipalStorage {
            creator: Principal::anonymous()
        }
    }
}


impl Default for RuntimeState {
    fn default() -> Self {
        RuntimeState {
            env: Box::new(EmptyEnv {}),
            data: Data::default(),
        }
    }
}

#[derive(CandidType, Deserialize)]
struct IndexCanisterSettings {
    reindex_interval: TimestampMillis,
    desired_free_slots: u128,
}

impl Default for IndexCanisterSettings {
    fn default() -> Self {
        IndexCanisterSettings {
            // 5 seconds
            reindex_interval: 5_000_000_000,
            desired_free_slots: 60,
        }
    }
}

#[derive(CandidType, Default, Deserialize)]
struct Data {
    canister_settings: IndexCanisterSettings,
    business_state: BusinessState,
}

// MAIN FUNCTIONALITY
// Inter canister calls are named with snake case

#[update(name = "add_bucket_index")]
#[candid_method]
fn add_bucket_index(bucket_index: EffectiveIndex) -> bool {
    RUNTIME_STATE.with(|state| add_bucket_index_impl(bucket_index, state.borrow_mut()))
}

fn add_bucket_index_impl(
    bucket_index: EffectiveIndex,
    mut runtime_state: RefMut<RuntimeState>,
) -> bool {
    let caller = runtime_state.env.caller();
    runtime_state
        .data
        .business_state
        .add_bucket_index(caller, bucket_index);

    true
}

#[update(name = "spawn_bucket")]
#[candid_method]
async fn spawn_bucket() -> String {
    set_owner();
    let creator = get_creator();
    let runtime_caller = get_runtime_caller();
    if creator != runtime_caller || creator == Principal::anonymous() {
        panic!("Only the creator can spawn buckets, creator: {}, runtime_caller: {}", creator, runtime_caller);
    }
    ic_cdk::print(format!("spawn_bucket: creator: {}, runtime_caller: {}", creator, runtime_caller));
    businesslogic::spawn_bucket().await
}

fn set_owner() {
    let is_new_canister = PRINCIPAL_STORAGE.lock().unwrap().creator == Principal::anonymous();
    let canister_id = ic_cdk::id();
    if is_new_canister {
        PRINCIPAL_STORAGE.lock().unwrap().creator = get_runtime_caller();
        ic_cdk::print(format!("Initialized creator {} for canister: {}", get_creator(), canister_id.to_text()));
    }
}

#[update(name = "get_creator")]
#[candid_method]
fn get_creator() -> Principal {
    PRINCIPAL_STORAGE.lock().unwrap().creator
}

fn get_runtime_caller() -> Principal {
    RUNTIME_STATE.with(|state| state.borrow().env.caller())
}

#[update(name = "get_canister_id")]
#[candid_method]
async fn get_canister_id() -> Principal {
    api::id()
}

// Client facing calls are camelCase
// getMetrics is used for demo purposes

#[query(name = "get_metrics")]
#[candid_method(query)]
fn get_metrics() -> String {
    RUNTIME_STATE.with(|state| get_metrics_impl(state.borrow()))
}

// Just for demo purposes
#[query(name = "get_global_index")]
#[candid_method(query)]
fn get_global_index() -> Vec<Vec<String>> {
    RUNTIME_STATE.with(|state| get_global_index_impl(state.borrow()))
}

fn get_metrics_impl(runtime_state: Ref<RuntimeState>) -> String {
    format!(
        "CanisterID: {}\n
Cycles: {}\n
All Buckets: {:?}\n
Memory: {}\n
Caller: {}\n",
        runtime_state.env.canister_id(),
        runtime_state.env.cycles_balance(),
        runtime_state
            .data
            .business_state
            .get_all_buckets()
            .iter()
            .map(|b| b.to_text())
            .collect::<Vec<String>>(),
        runtime_state.env.memory_used(),
        runtime_state.env.caller().to_text(),
    )
}

fn get_global_index_impl(runtime_state: Ref<RuntimeState>) -> Vec<Vec<String>> {
    runtime_state.data.business_state.get_index_tag2can_as_vec()
}

// Main call used by a client to get a list of buckets where it can find the
// data related to a #tag
#[query(name = "get_index_by_tag")]
#[candid_method(query)]
fn get_index_by_tag(tag: String) -> Vec<Principal> {
    RUNTIME_STATE.with(|state| get_index_by_tag_impl(tag, state.borrow()))
}

fn get_index_by_tag_impl(tag: String, runtime_state: Ref<RuntimeState>) -> Vec<Principal> {
    runtime_state.data.business_state.get_index_by_tag(&tag)
}

// Useful for demo purposes; could also be used by a client to "randomly" upload data
// to any canister, if this is something that works for their case.
#[query(name = "get_all_indexes")]
#[candid_method(query)]
fn get_all_indexes() -> Vec<Principal> {
    RUNTIME_STATE.with(|state| get_all_indexes_impl(state.borrow()))
}

fn get_all_indexes_impl(runtime_state: Ref<RuntimeState>) -> Vec<Principal> {
    runtime_state.data.business_state.get_all_buckets()
}

#[query(name = "__get_candid_interface_tmp_hack")]
fn export_candid() -> String {
    export_service!();
    __export_service()
}


#[cfg(test)]
mod tests {
    use super::export_candid;
    #[test]
    fn save_candid() {
        use std::env;
        use std::fs::write;
        use std::path::PathBuf;

        let dir = PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap());
        let dir = dir
            .parent()
            .unwrap()
            .parent()
            .unwrap()
            .join("src")
            .join("dynamic_relays");
        write(dir.join("dynamic_relays.did"), export_candid()).expect("Write failed.");
    }
}
