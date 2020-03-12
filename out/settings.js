"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GraphToQuery_1 = require("./DataProcessing/GraphToQuery");
exports.maxTryCount = 8;
exports.maxQueryDepth = 1000;
exports.ProviderList = [
    //"https://nodes.iota.org:443",
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
var NewThefts = [
    "VPDRB9I9WIJA9N9HGEYLPFRDRZH9YRIZIJNZQVPKH9INTCDLTWHD9JNEFFAK9ABVZ9PBEITROFLPLAYAW",
    "9BHLFKQGEBEESQBNUOEDOKWJEOFKFTFBFIPLEIYQ9KJCIRUHFHNVTOOYSSZIHQTEXXL9GLFBRADUDWJKX",
    "GUMDQOFUBXLISNJLWFVKAERLIXIMFGIEY9VZFSOIKBJXFTTJOTSKRAJJJKBNCHFPFKUKISHIVNXGTFFEB",
    "XGAESRZLTFJN9HXVDASKBVSBNGSZKAUBSSRTBFGIGHUEDCJLY9JVIRLISUXRETKWGUZKCFTEWJFFLBSBB"
];
exports.command = {
    name: "NewThefts",
    seperateRender: true,
    outputAllTxs: false,
    outputAllBundles: false,
    outputAllAddresses: false,
    outputAllPositiveAddresses: false,
    graphs: [
        new GraphToQuery_1.GraphToQuery("NewThefts", GraphToQuery_1.RenderType.ADD, "#fcc658", "#ffb621", undefined, NewThefts, undefined),
    ]
};
//# sourceMappingURL=settings.js.map