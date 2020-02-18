import { involvedAddress } from "./involvedAddress";
import { StartAddresses } from "./settings";
import { AddressManager } from "./AddressManager";

//Init
async function LoadInitialAddresses() {
    for(let i = 0; i < StartAddresses.length; i++) {
        await AddressManager.GetInstance().AddAddress(StartAddresses[i]);
    }
}

LoadInitialAddresses();

