"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GraphToQuery_1 = require("./DataProcessing/GraphToQuery");
exports.maxTryCount = 8;
exports.maxQueryDepth = 1000;
exports.ProviderList = [
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
var Addresses = [
    "FEYALUZRP9VVDKUNLUBGBDGHRMYUKLSRGX9HNRVKPT99KDELZHWOHJRATORHNKHVBEWZEWBUAOKNVPFPD"
];
exports.command = {
    name: "PH_Graph",
    seperateRender: true,
    outputAllTxs: false,
    outputAllBundles: false,
    outputAllAddresses: false,
    outputAllPositiveAddresses: false,
    graphs: [
        new GraphToQuery_1.GraphToQuery("PH_Subgraph", GraphToQuery_1.RenderType.ADD, "#fcc658", "#ffb621", undefined, undefined, Addresses),
    ]
};
//# sourceMappingURL=settings.js.map