export const idlFactory = ({ IDL }) => {
  const anon_class_20_1 = IDL.Service({
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
    'symmetric_key_verification_key' : IDL.Func([], [IDL.Text], []),
  });
  return anon_class_20_1;
};
export const init = ({ IDL }) => { return []; };
