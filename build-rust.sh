#!/bin/bash

cargo build --target wasm32-unknown-unknown --release --package $1

wasm-opt target/wasm32-unknown-unknown/release/$1.wasm --strip-debug -Oz -o target/wasm32-unknown-unknown/release/$1-opt.wasm

