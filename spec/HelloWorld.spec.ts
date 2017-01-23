import "mocha";
import {expect} from "chai";

import {HelloWorld} from "../src/HelloWorld";

describe("HelloWorld Class", () => {
    it("Should say Hello", () => {
        let h = new HelloWorld();
        expect(h.say()).to.equal("hello, world!");
    });

    it("Should not ...", () => {
        let h = new HelloWorld();
        expect(h.dontSay()).to.be.undefined;
    });
});
