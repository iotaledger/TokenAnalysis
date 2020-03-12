import { GraphToQuery, RenderType, Settings } from "./DataProcessing/GraphToQuery";

export const maxTryCount = 8;
export const maxQueryDepth = 1000;

export const ProviderList = [
    "https://nodes.iota.org:443",
    "http://bare01.mainnet.iota.cafe:14265",
    "http://bare02.mainnet.iota.cafe:14265",
    "http://bare03.mainnet.iota.cafe:14265",
    "http://bare04.mainnet.iota.cafe:14265",
    "http://iri01.mainnet.iota.cafe:14265",
    "http://iri02.mainnet.iota.cafe:14265",
    "http://iri03.mainnet.iota.cafe:14265",
    "http://iri04.mainnet.iota.cafe:14265",
    "http://iri05.mainnet.iota.cafe:14265"
];

const Addresses : string[] = [
    
];

export const command : Settings = {
    name : "PH_Graph",
    seperateRender : true,
    outputAllTxs : false,
    outputAllBundles : false,
    outputAllAddresses : false,
    outputAllPositiveAddresses : false,
    graphs : [ 
        new GraphToQuery("PH_Subgraph", RenderType.ADD, "#fcc658", "#ffb621", undefined, Addresses, undefined ),
        //new GraphToQuery("OKEx", RenderType.SUBTRACT, "#fa7602", "#fc8f30", OKExTxs, undefined, undefined ),
        //new GraphToQuery("OKExExtra", RenderType.SUBTRACT, "#C252F3", "#9D28CF", OKExExtraTransactions, undefined, undefined ),
    ]
};