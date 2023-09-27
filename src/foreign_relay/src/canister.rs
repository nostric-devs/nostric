use candid::{CandidType, encode_one, decode_one};
use ic_cdk::{print, api::time};
use std::error::Error;
use serde::{Deserialize, Serialize};

use ic_websocket_cdk::{
    ws_send, ClientPublicKey, OnCloseCallbackArgs, OnMessageCallbackArgs, OnOpenCallbackArgs,
};

#[derive(CandidType, Clone, Debug, Deserialize, Serialize, Eq, PartialEq)]
pub struct AppMessage {
    pub text: String,
    pub timestamp: u64,
}

// reply types
#[derive(Debug, Deserialize, Serialize, Clone)]
pub enum ActionTypes {
    REQ,
    CLOSE,
    EOSE,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Action {
    action: ActionTypes,
    subscription_id: String,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub enum NoticeTypes {
    NOTICE,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Notice {
    action: NoticeTypes,
    message: String,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub enum EventTypes {
    EVENT,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct EventResponse {
    action: EventTypes,
    subscription_id: String,
    event: EventData,
}


#[derive(Serialize, Deserialize, PartialEq, Eq, Debug, Clone, CandidType)]
pub struct EventData {
  id: String,
  pubkey: String,
  created_at: u32,
  kind: u32,
  tags: Vec<Vec<String>>,
  content: String,
  sig: String,
}


impl AppMessage {
    fn candid_serialize(&self) -> Vec<u8> {
        encode_one(&self).unwrap()
    }
}

use ic_cdk::{update};
use std::sync::Mutex;
use lazy_static::lazy_static;
use std::collections::HashMap;

lazy_static! {
    static ref RECEIVED_EVENTS: Mutex<Vec<EventData>> = Mutex::new(Vec::new());
    static ref ACTIVE_SUBSCRIPTIONS: Mutex<HashMap<Vec<u8>, String>> = Mutex::new(HashMap::new());
}

#[update]
pub fn add_new_event(event : EventData) {
  print(format!("ACTOR RECEIVE: {:?}", event));
  // store the event
  RECEIVED_EVENTS.lock().unwrap().push(event.clone());
  let active_subscriptions = ACTIVE_SUBSCRIPTIONS.lock().unwrap();
  // send the event to all subscribers
  for (client_key, subscription_id) in active_subscriptions.iter() {
    let response = EventResponse {
      action: EventTypes::EVENT,
      subscription_id: String::from(subscription_id),
      event: event.clone(),
    };

    let serialized = serde_json::to_string(&response).expect("Failed to serialize to JSON");
    let new_msg = AppMessage {
        text: serialized,
        timestamp: time(),
    };
    print(format!("SENDING EVENT: {:?}", new_msg.text));
    send_app_message(client_key.to_vec(), new_msg);
  }
}

pub fn on_open(args: OnOpenCallbackArgs) {
    let notice_response = Notice {
      action: NoticeTypes::NOTICE,
      message: String::from("greetings, adventurer"),
    };
    let serialized = serde_json::to_string(&notice_response).expect("Failed to serialize to JSON");
    let new_msg = AppMessage {
        text: serialized,
        timestamp: time(),
    };
    print(format!("NOTICE OK: {:?}", args.client_key));
    send_app_message(args.client_key, new_msg);
}



pub fn on_message(args: OnMessageCallbackArgs) {
    let app_msg: AppMessage = decode_one(&args.message).unwrap();
    print(format!("RECEIVED: {:?}", app_msg.text));

    // Define deserialize_json as an inline function (closure)
    let deserialize_req = |msg: &str| -> Result<Action, Box<dyn Error>> {
        let req_message: Action = serde_json::from_str(msg)?;
        Ok(req_message)
    };

    //"{\"action\":\"EVENT\",\"subscription_id\":\"06383342138296189\",\"event\":{\"id\":\"d7d354ad533d8b55d6f5f6fa2b7bd7a22f7c5e9a3c33ec3511c3580d088e0f43\",\"pubkey\":\"7278bc0c28eb4fe97e888d84f65cfa7c6704cbbd542d7a0697744f739731c927\",\"created_at\":1695723377,\"kind\":1,\"tags\":[],\"content\":\"Hello from TinaBoe44, which is saved on foreign relay.\",\"sig\":\"05978354f669b5f51316436150c82b3a573d555abe38a9090681c087503e01b86b3e73f8fac35e4c859b3a5e3c50a720bee670966d25a58cf2df3f497929c7cd\"}}"

    // for testing with foreign relay purposes only, if empty, fill with random message
    let mut received_events = RECEIVED_EVENTS.lock().unwrap();
    let is_empty = received_events.is_empty();
    if is_empty {
        received_events.push(EventData {
            id: String::from("d7d354ad533d8b55d6f5f6fa2b7bd7a22f7c5e9a3c33ec3511c3580d088e0f43"),
            pubkey: String::from("7278bc0c28eb4fe97e888d84f65cfa7c6704cbbd542d7a0697744f739731c927"),
            created_at: 1695723377,
            kind: 1,
            tags: Vec::new(),
            content: String::from("Hello from TinaBoe44, which is saved on foreign relay."),
            sig: String::from("05978354f669b5f51316436150c82b3a573d555abe38a9090681c087503e01b86b3e73f8fac35e4c859b3a5e3c50a720bee670966d25a58cf2df3f497929c7cd"),
        });
    }

    match deserialize_req(&app_msg.text) {
        Ok(deserialized) => {
            match deserialized.action {
                // parse subscription request ["REQ", <subscription_id>]
                ActionTypes::REQ => {

                    let client_key : Vec<u8> = args.client_key;
                    ACTIVE_SUBSCRIPTIONS.lock().unwrap().insert(
                      client_key.clone(),
                      deserialized.subscription_id.clone()
                    );

                    // send stored events as ["EVENT", <subscription_id>, <event json>]
                    for event in received_events.iter() {
                      let response = EventResponse {
                        action: EventTypes::EVENT,
                        subscription_id: deserialized.subscription_id.clone(),
                        event: event.clone(),
                      };

                      let serialized = serde_json::to_string(&response).expect("Failed to serialize to JSON");
                      let new_msg = AppMessage {
                          text: serialized,
                          timestamp: time(),
                      };

                      print(format!("SUBSCRIBED EVENT: {:?}", new_msg.text));
                      send_app_message(client_key.clone(), new_msg);

                    }

                    // send EOSE to indicate end of stored events ["EOSE", <subscription_id>]
                    let eose_response = Action {
                      action: ActionTypes::EOSE,
                      subscription_id: deserialized.subscription_id.clone(),
                    };
                    let serialized = serde_json::to_string(&eose_response).expect("Failed to serialize to JSON");
                    let new_msg = AppMessage {
                        text: serialized,
                        timestamp: time(),
                    };
                    println!("EOSE: {}", deserialized.subscription_id);
                    send_app_message(client_key.clone(), new_msg);

                }
                // parse close subscription request ["CLOSE", <subscription_id>]
                ActionTypes::CLOSE => {
                    ACTIVE_SUBSCRIPTIONS.lock().unwrap().remove(&args.client_key);
                    println!("CLOSE: {}", deserialized.subscription_id);
                }
                _ => {
                  // otherwise do nothing
                }
            }
        }
        Err(err) => {
            let notice_response = Notice {
              action: NoticeTypes::NOTICE,
              message: String::from("Unable to read request"),
            };
            let serialized = serde_json::to_string(&notice_response).expect("Failed to serialize to JSON");
            let new_msg = AppMessage {
                text: serialized,
                timestamp: time(),
            };
            print(format!("NOTICE ERR: {:?}", args.client_key));
            send_app_message(args.client_key, new_msg);
            // Handle the error and print your custom message
            eprintln!("Failed to deserialize JSON: {}", err);
        }
    }

}

fn send_app_message(client_key: ClientPublicKey, msg: AppMessage) {
    if let Err(e) = ws_send(client_key, msg.candid_serialize()) {
        println!("Could not send message: {}", e);
    }
}

pub fn on_close(args: OnCloseCallbackArgs) {
    ACTIVE_SUBSCRIPTIONS.lock().unwrap().remove(&args.client_key);
    print(format!("Client {:?} disconnected", args.client_key));
}
