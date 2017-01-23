import "mocha"
import {expect, should, use} from "chai"
import * as chaiAsPromised from "chai-as-promised"
import * as sinon from "sinon"

should()
use(chaiAsPromised)

import {HelloWorld} from "../src/HelloWorld"

describe("HelloWorld Class", () => {
    it("Should say Hello", () => {
        let h = new HelloWorld()
        expect(h.say()).to.equal("hello, world!")
    })

    it("Should not ...", () => {
        let h = new HelloWorld()
        expect(h.dontSay()).to.be.undefined
    })
})
