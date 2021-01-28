import { assertThrowsAsync } from "https://deno.land/std@0.84.0/testing/asserts.ts";
import cli from './cli.js';

Deno.test("CLI throws for unrecognized command", async () => {
    await assertThrowsAsync(async () => cli(["burn"]))
});

Deno.test("CLI build builds", async () => {

});