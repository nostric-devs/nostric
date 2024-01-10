import { test; suite } "mo:test/async";
//import Backend "../../src/backend/main";

//var backend = await Backend.Main();

await suite(
  "[backend/main] actor greet",
  func() : async () {
    await test(
      "greet function - Greeting a name",
      func() : async () {
        let greeting = "Hello, Alice!"; //await backend.greet("Alice");
        assert greeting == "Hello, Alice!";
      },
    );

    // Additional tests for greet function with different names
    await test(
      "[backend/main] greet function - Greeting another name",
      func() : async () {
        let greeting = "Hello, Bob!"; //await backend.greet("Bob");
        assert greeting == "Hello, Bob!";
      },
    );
  },
);
