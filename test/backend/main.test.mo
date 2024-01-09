import { test } "mo:test";

test(
  "[backend/main] simple test",
  func() {
    assert true;
  },
);

test(
  "[backend/main] test my number",
  func() {
    assert 1 > 0;
  },
);
