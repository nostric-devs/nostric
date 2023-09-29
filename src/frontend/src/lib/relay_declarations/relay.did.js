export const idlFactory = ({ IDL }) => {
  const EventData = IDL.Record({
    'id' : IDL.Text,
    'sig' : IDL.Text,
    'content' : IDL.Text,
    'kind' : IDL.Nat32,
    'tags' : IDL.Vec(IDL.Vec(IDL.Text)),
    'pubkey' : IDL.Text,
    'created_at' : IDL.Nat32,
  });
  const CanisterWsCloseArguments = IDL.Record({
    'client_key' : IDL.Vec(IDL.Nat8),
  });
  const Result = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text });
  const CanisterWsGetMessagesArguments = IDL.Record({ 'nonce' : IDL.Nat64 });
  const CanisterOutputMessage = IDL.Record({
    'key' : IDL.Text,
    'content' : IDL.Vec(IDL.Nat8),
    'client_key' : IDL.Vec(IDL.Nat8),
  });
  const CanisterOutputCertifiedMessages = IDL.Record({
    'messages' : IDL.Vec(CanisterOutputMessage),
    'cert' : IDL.Vec(IDL.Nat8),
    'tree' : IDL.Vec(IDL.Nat8),
  });
  const Result_1 = IDL.Variant({
    'Ok' : CanisterOutputCertifiedMessages,
    'Err' : IDL.Text,
  });
  const GatewayStatusMessage = IDL.Record({ 'status_index' : IDL.Nat64 });
  const DirectClientMessage = IDL.Record({
    'client_key' : IDL.Vec(IDL.Nat8),
    'message' : IDL.Vec(IDL.Nat8),
  });
  const RelayedClientMessage = IDL.Record({
    'sig' : IDL.Vec(IDL.Nat8),
    'content' : IDL.Vec(IDL.Nat8),
  });
  const CanisterIncomingMessage = IDL.Variant({
    'IcWebSocketGatewayStatus' : GatewayStatusMessage,
    'IcWebSocketEstablished' : IDL.Vec(IDL.Nat8),
    'DirectlyFromClient' : DirectClientMessage,
    'RelayedByGateway' : RelayedClientMessage,
  });
  const CanisterWsMessageArguments = IDL.Record({
    'msg' : CanisterIncomingMessage,
  });
  const CanisterWsOpenResultValue = IDL.Record({
    'client_key' : IDL.Vec(IDL.Nat8),
    'canister_id' : IDL.Principal,
    'nonce' : IDL.Nat64,
  });
  const Result_2 = IDL.Variant({
    'Ok' : CanisterWsOpenResultValue,
    'Err' : IDL.Text,
  });
  return IDL.Service({
    'add_new_event' : IDL.Func([EventData], [], []),
    'get_number_of_active_subscriptions' : IDL.Func([], [IDL.Int32], []),
    'get_owner' : IDL.Func([], [IDL.Principal], []),
    'set_owner' : IDL.Func([IDL.Principal], [], []),
    'ws_close' : IDL.Func([CanisterWsCloseArguments], [Result], []),
    'ws_get_messages' : IDL.Func(
        [CanisterWsGetMessagesArguments],
        [Result_1],
        [],
      ),
    'ws_message' : IDL.Func([CanisterWsMessageArguments], [Result], []),
    'ws_open' : IDL.Func([RelayedClientMessage], [Result_2], []),
    'ws_register' : IDL.Func([CanisterWsCloseArguments], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
