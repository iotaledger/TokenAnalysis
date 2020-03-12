import { GenerateGraph } from "./main";
import { Settings, GraphToQuery, RenderType } from "./DataProcessing/GraphToQuery";
import { AddressManager } from "./Address/AddressManager";
import { Address } from "./Address/Address";
import { QueryAddress } from "./DataProcessing/query";


Trace(process.argv[2])

async function Trace(addressToTrace : string) {
    //Known transactions
    let settings : Settings = {
        name : addressToTrace,
        seperateRender : false,
        outputAllAddresses : false,
        outputAllBundles : false,
        outputAllPositiveAddresses : false,
        outputAllTxs : false,
        graphs : [
            new GraphToQuery("RecentTrace", RenderType.ADD, "#fcc658", "#ffb621", undefined, undefined, [addressToTrace] )
        ]
    };
    await GenerateGraph(settings);

    //Send first test to API
    let KnownAddresses = FilterAddressesForValue(AddressManager.GetInstance().GetAddresses());

    AddressManager.GetInstance().GetAddresses().forEach((value : Address, key : string) => {
        console.log("OutBundles: " + JSON.stringify(value.GetOutBundles()));
        console.log("OutTxs: " + JSON.stringify(value.GetOutTxs()));
        console.log("Known address: " + key);
    });

    //Ping the address
    let tracing : boolean = true;
    let counter : number = 0;
    while(tracing && counter < 30) {
        let addrArray = Array.from(KnownAddresses.keys());
        for(let i=0; i<addrArray.length; i++) {
            await QueryAddress( addrArray[i], 5000);
        }
        
        //Get latest addresses
        let currentAddresses = FilterAddressesForValue(AddressManager.GetInstance().GetAddresses());
        currentAddresses.forEach((value : Address, key : string) => {
            console.log("Known address: " + key);
        });

        //New Addresses
        let newAddresses = SubtractMaps(currentAddresses, KnownAddresses);
        newAddresses.forEach((value : Address, key : string) => {
            console.log("New address: " + key);
        });
        
        //Update known list
        KnownAddresses = currentAddresses;
        counter++;

        await delay(10000);
        console.log("Ping");
        //tracing = false;
    }
}

function FilterAddressesForValue(addrs : Map<string, Address>) : Map<string, Address> {
    let map = new Map<string,Address>();
    addrs.forEach((value : Address, key : string) => {
        if(!value.IsSpent()) {
            map.set(key, value);
        }
    });
    return map;
}

function SubtractMaps(current : Map<string,Address>, known : Map<string,Address>) : Map<string, Address> {
    let newAddresses = new Map<string,Address>();
    current.forEach((value : Address, key : string) => {
        if(!known.has(key)) {
            newAddresses.set(key, value);
        }
    });
    return newAddresses;
}

export function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}