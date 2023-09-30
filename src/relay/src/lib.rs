use candid::{candid_method, export_service, Principal};
use ic_cdk_macros::*;

use canister::{on_close, on_message, on_open, EventData};
use ic_websocket_cdk::{
    CanisterWsCloseArguments, CanisterWsCloseResult, CanisterWsGetMessagesArguments,
    CanisterWsGetMessagesResult, CanisterWsMessageArguments, CanisterWsMessageResult,
    CanisterWsOpenArguments, CanisterWsOpenResult, CanisterWsRegisterArguments,
    CanisterWsRegisterResult, WsHandlers,
};

mod canister;

#[cfg(feature = "dev")]
pub const GATEWAY_PRINCIPAL: &str =
    "3bccy-ycuov-uxdme-kw35s-nrwvs-53cgd-wd4hy-valqf-koy7r-3xdt2-eqe";

#[cfg(not(feature = "dev"))]
pub const GATEWAY_PRINCIPAL: &str =
     "3656s-3kqlj-dkm5d-oputg-ymybu-4gnuq-7aojd-w2fzw-5lfp2-4zhx3-4ae";

#[init]
fn init() {
    let handlers = WsHandlers {
        on_open: Some(on_open),
        on_message: Some(on_message),
        on_close: Some(on_close),
    };

    ic_websocket_cdk::init(handlers, GATEWAY_PRINCIPAL);
    ic_cdk::print(format!("Canister initialized with GATEWAY_PRINCIPAL: {}", GATEWAY_PRINCIPAL));
}

#[post_upgrade]
fn post_upgrade() {
    let handlers = WsHandlers {
        on_open: Some(on_open),
        on_message: Some(on_message),
        on_close: Some(on_close),
    };

    ic_websocket_cdk::init(handlers, GATEWAY_PRINCIPAL);
    ic_cdk::print(format!("Canister upgraded with GATEWAY_PRINCIPAL: {}", GATEWAY_PRINCIPAL));
}

// method called by the client SDK when instantiating a new IcWebSocket
#[update]
#[candid_method]
fn ws_register(args: CanisterWsRegisterArguments) -> CanisterWsRegisterResult {
    ic_cdk::print("REGISTER WAS CALLED");
    ic_websocket_cdk::ws_register(args)
}

// method called by the WS Gateway after receiving FirstMessage from the client
#[update]
#[candid_method]
fn ws_open(args: CanisterWsOpenArguments) -> CanisterWsOpenResult {
    ic_websocket_cdk::ws_open(args)
}

// method called by the Ws Gateway when closing the IcWebSocket connection
#[update]
#[candid_method]
fn ws_close(args: CanisterWsCloseArguments) -> CanisterWsCloseResult {
    ic_websocket_cdk::ws_close(args)
}

// method called by the WS Gateway to send a message of type GatewayMessage to the canister
#[update]
#[candid_method]
fn ws_message(args: CanisterWsMessageArguments) -> CanisterWsMessageResult {
    ic_websocket_cdk::ws_message(args)
}

// method called by the WS Gateway to get messages for all the clients it serves
#[query]
#[candid_method]
fn ws_get_messages(args: CanisterWsGetMessagesArguments) -> CanisterWsGetMessagesResult {
    ic_websocket_cdk::ws_get_messages(args)
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
            .join("relay");
        write(dir.join("relay.did"), export_candid()).expect("Write failed.");
    }
}
