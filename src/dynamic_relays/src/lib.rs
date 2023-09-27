mod businesslogic;
mod env;
mod lifetime;

use crate::businesslogic::{BusinessState, EffectiveIndex};
use crate::env::{CanisterEnv, EmptyEnv, Environment, TimestampMillis};
use ic_cdk::export::candid::{CandidType, Principal, candid_method, export_service};
use ic_cdk_macros::*;
use serde::Deserialize;

use std::cell::{Ref, RefCell, RefMut};

#[derive(Debug)]
pub struct Error {
    pub code: u8,
    pub msg: String,
}

thread_local! {
    static RUNTIME_STATE: RefCell<RuntimeState> = RefCell::default();
}

struct RuntimeState {
    pub env: Box<dyn Environment>,
    pub data: Data,
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

#[candid_method]
#[update(name = "add_bucket_index")]
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

#[candid_method]
#[update(name = "spawn_bucket")]
async fn spawn_bucket() {
    businesslogic::spawn_bucket().await;
}

// Client facing calls are camelCase
// getMetrics is used for demo purposes

#[candid_method(query)]
#[query(name = "get_metrics")]
fn get_metrics() -> String {
    RUNTIME_STATE.with(|state| get_metrics_impl(state.borrow()))
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

// Just for demo purposes
#[candid_method(query)]
#[query(name = "get_global_index")]
fn get_global_index() -> Vec<Vec<String>> {
    RUNTIME_STATE.with(|state| get_global_index_impl(state.borrow()))
}

fn get_global_index_impl(runtime_state: Ref<RuntimeState>) -> Vec<Vec<String>> {
    runtime_state.data.business_state.get_index_tag2can_as_vec()
}

// Main call used by a client to get a list of buckets where it can find the
// data related to a #tag
#[candid_method(query)]
#[query(name = "get_index_by_tag")]
fn get_index_by_tag(tag: String) -> Vec<Principal> {
    RUNTIME_STATE.with(|state| get_index_by_tag_impl(tag, state.borrow()))
}

fn get_index_by_tag_impl(tag: String, runtime_state: Ref<RuntimeState>) -> Vec<Principal> {
    runtime_state.data.business_state.get_index_by_tag(&tag)
}

// Useful for demo purposes; could also be used by a client to "randomly" upload data
// to any canister, if this is something that works for their case.
#[candid_method(query)]
#[query(name = "get_all_indexes")]
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
