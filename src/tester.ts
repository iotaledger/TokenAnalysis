import { QueryNestedAddresses, DIRECTION } from "./DataProcessing/query";
import { AddressManager } from "./Address/AddressManager";

function UpdateQueryProgress(_processedTxCount : number, _foundTXCount : number, _depth : number) {
    console.log(_processedTxCount + " " + _foundTXCount + " " + _depth);
}

async function Execute() {
    let t0 = new Date().getTime();
    await QueryNestedAddresses(["FEYALUZRP9VVDKUNLUBGBDGHRMYUKLSRGX9HNRVKPT99KDELZHWOHJRATORHNKHVBEWZEWBUAOKNVPFPDQUXYPJQGZ"], DIRECTION.FORWARD, false, UpdateQueryProgress, 0);
    let t1 = new Date().getTime();
    let executiontime = t1-t0;
    console.log("Time to execute task: " + executiontime/1000 + " seconds");
    console.log( AddressManager.GetInstance().GetAddresses().size + " addresses found");
}

Execute();

