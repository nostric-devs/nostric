import {test; suite} "mo:test/async";
import Backend "../../src/backend/main";

var backend = await Backend.Main();

await suite("actor greet", func() : async () {
    await test("greet function - Greeting a name", func() : async () {
        let greeting = await backend.greet("Alice");
        assert greeting == "Hello, Alice!";
    });

    // Additional tests for greet function with different names
    await test("greet function - Greeting another name", func() : async () {
        let greeting = await backend.greet("Bob");
        assert greeting == "Hello, Bob!";
    });
});

