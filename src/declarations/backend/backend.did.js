export const idlFactory = ({ IDL }) => {
  const Profile = IDL.Record({
    'pk' : IDL.Text,
    'about' : IDL.Text,
    'username' : IDL.Text,
    'avatar_url' : IDL.Text,
    'encrypted_sk' : IDL.Text,
  });
  const Error = IDL.Variant({
    'ProfileNotFound' : IDL.Null,
    'NotAuthenticated' : IDL.Null,
  });
  const Result = IDL.Variant({ 'ok' : Profile, 'err' : Error });
  const anon_class_21_1 = IDL.Service({
    'addProfile' : IDL.Func([Profile], [Result], []),
    'app_vetkd_public_key' : IDL.Func(
        [IDL.Vec(IDL.Vec(IDL.Nat8))],
        [IDL.Text],
        [],
      ),
    'encrypted_symmetric_key_for_caller' : IDL.Func(
        [IDL.Vec(IDL.Nat8)],
        [IDL.Text],
        [],
      ),
    'getProfile' : IDL.Func([], [Result], ['query']),
    'symmetric_key_verification_key' : IDL.Func([], [IDL.Text], []),
  });
  return anon_class_21_1;
};
export const init = ({ IDL }) => { return []; };
