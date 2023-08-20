import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type Error = { 'ProfileNotFound' : null } |
  { 'NotAuthenticated' : null };
export interface Profile {
  'pk' : string,
  'about' : string,
  'username' : string,
  'avatar_url' : string,
  'encrypted_sk' : string,
}
export type Result = { 'ok' : Profile } |
  { 'err' : Error };
export interface anon_class_21_1 {
  'addProfile' : ActorMethod<[Profile], Result>,
  'app_vetkd_public_key' : ActorMethod<[Array<Uint8Array | number[]>], string>,
  'encrypted_symmetric_key_for_caller' : ActorMethod<
    [Uint8Array | number[]],
    string
  >,
  'getProfile' : ActorMethod<[], Result>,
  'symmetric_key_verification_key' : ActorMethod<[], string>,
}
export interface _SERVICE extends anon_class_21_1 {}
