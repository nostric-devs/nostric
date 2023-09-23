use candid::Principal;
use rand::rngs::StdRng;
use rand::{RngCore, SeedableRng};

pub type TimestampMillis = u64;
type Cycles = u128;

pub trait Environment {
    fn now(&self) -> TimestampMillis;
    fn caller(&self) -> Principal;
    fn canister_id(&self) -> Principal;
    fn random_u32(&mut self) -> u32;
    fn cycles_balance(&self) -> Cycles;
    fn memory_used(&self) -> u64;
}

pub struct CanisterEnv {
    rng: StdRng,
}

impl CanisterEnv {
    pub fn new() -> Self {
        CanisterEnv {
            // Seed the PRNG with the current time.
            rng: {
                let now_millis = ic_cdk::api::time();
                let mut seed = [0u8; 32];
                seed[..8].copy_from_slice(&now_millis.to_be_bytes());
                seed[8..16].copy_from_slice(&now_millis.to_be_bytes());
                seed[16..24].copy_from_slice(&now_millis.to_be_bytes());
                seed[24..32].copy_from_slice(&now_millis.to_be_bytes());
                StdRng::from_seed(seed)
            },
        }
    }
}

impl Environment for CanisterEnv {
    fn now(&self) -> TimestampMillis {
        ic_cdk::api::time()
    }

    fn caller(&self) -> Principal {
        ic_cdk::caller()
    }

    fn canister_id(&self) -> Principal {
        ic_cdk::id()
    }

    fn random_u32(&mut self) -> u32 {
        self.rng.next_u32()
    }

    fn cycles_balance(&self) -> Cycles {
        ic_cdk::api::canister_balance().into()
    }

    fn memory_used(&self) -> u64 {
        #[cfg(target_arch = "wasm32")]
        {
            const UPPER_LIMIT_WASM_SIZE_BYTES: u64 = 3 * 1024 * 1024; // 3MB
            UPPER_LIMIT_WASM_SIZE_BYTES + (core::arch::wasm32::memory_size(0) * 65536) as u64
        }

        #[cfg(not(target_arch = "wasm32"))]
        {
            // This branch won't actually ever be taken
            0
        }
    }
}

pub struct TestEnv {
    pub now: u64,
    pub caller: Principal,
    pub canister_id: Principal,
    pub random_u32: u32,
    pub cycles_balance: Cycles,
    pub memory_used: u64,
}

impl Environment for TestEnv {
    fn now(&self) -> u64 {
        self.now
    }

    fn caller(&self) -> Principal {
        self.caller
    }

    fn canister_id(&self) -> Principal {
        self.canister_id
    }

    fn random_u32(&mut self) -> u32 {
        self.random_u32
    }

    fn cycles_balance(&self) -> Cycles {
        self.cycles_balance
    }

    fn memory_used(&self) -> u64 {
        self.memory_used
    }
}

pub struct EmptyEnv {}

impl Environment for EmptyEnv {
    fn now(&self) -> TimestampMillis {
        0
    }

    fn caller(&self) -> Principal {
        Principal::anonymous()
    }

    fn canister_id(&self) -> Principal {
        Principal::anonymous()
    }

    fn random_u32(&mut self) -> u32 {
        0
    }

    fn cycles_balance(&self) -> Cycles {
        0
    }

    fn memory_used(&self) -> u64 {
        0
    }
}
