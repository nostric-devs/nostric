import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type CanisterIncomingMessage = {
    'IcWebSocketGatewayStatus' : GatewayStatusMessage
  } |
  { 'IcWebSocketEstablished' : Uint8Array | number[] } |
  { 'DirectlyFromClient' : DirectClientMessage } |
  { 'RelayedByGateway' : RelayedClientMessage };
export interface CanisterOutputCertifiedMessages {
  'messages' : Array<CanisterOutputMessage>,
  'cert' : Uint8Array | number[],
  'tree' : Uint8Array | number[],
}
export interface CanisterOutputMessage {
  'key' : string,
  'content' : Uint8Array | number[],
  'client_key' : Uint8Array | number[],
}
export interface CanisterWsCloseArguments {
  'client_key' : Uint8Array | number[],
}
export interface CanisterWsGetMessagesArguments { 'nonce' : bigint }
export interface CanisterWsMessageArguments { 'msg' : CanisterIncomingMessage }
export interface CanisterWsOpenResultValue {
  'client_key' : Uint8Array | number[],
  'canister_id' : Principal,
  'nonce' : bigint,
}
export interface DirectClientMessage {
  'client_key' : Uint8Array | number[],
  'message' : Uint8Array | number[],
}
export interface EventData {
  'id' : string,
  'sig' : string,
  'content' : string,
  'kind' : number,
  'tags' : Array<Array<string>>,
  'pubkey' : string,
  'created_at' : number,
}
export interface GatewayStatusMessage { 'status_index' : bigint }
export interface RelayedClientMessage {
  'sig' : Uint8Array | number[],
  'content' : Uint8Array | number[],
}
export type Result = { 'Ok' : null } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : CanisterOutputCertifiedMessages } |
  { 'Err' : string };
export type Result_2 = { 'Ok' : CanisterWsOpenResultValue } |
  { 'Err' : string };
export interface _SERVICE {
  'add_new_event' : ActorMethod<[EventData], undefined>,
  'get_number_of_active_subscriptions' : ActorMethod<[], number>,
  'get_owner' : ActorMethod<[], Principal>,
  'set_owner' : ActorMethod<[Principal], undefined>,
  'ws_close' : ActorMethod<[CanisterWsCloseArguments], Result>,
  'ws_get_messages' : ActorMethod<[CanisterWsGetMessagesArguments], Result_1>,
  'ws_message' : ActorMethod<[CanisterWsMessageArguments], Result>,
  'ws_open' : ActorMethod<[RelayedClientMessage], Result_2>,
  'ws_register' : ActorMethod<[CanisterWsCloseArguments], Result>,
}
