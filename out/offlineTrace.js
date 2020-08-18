"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderList = exports.command = void 0;
var main_1 = require("./main");
var GraphToQuery_1 = require("./DataProcessing/GraphToQuery");
var SettingsManager_1 = require("./SettingsManager");
var NewThefts = [
    "FEYALUZRP9VVDKUNLUBGBDGHRMYUKLSRGX9HNRVKPT99KDELZHWOHJRATORHNKHVBEWZEWBUAOKNVPFPDQUXYPJQGZ",
];
exports.command = {
    name: "NewThefts",
    seperateRender: true,
    outputAllTxs: false,
    outputAllBundles: false,
    outputAllAddresses: false,
    outputAllPositiveAddresses: false,
    graphs: [
        new GraphToQuery_1.GraphToQuery("NewThefts", GraphToQuery_1.RenderType.ADD, "#fcc658", "#ffb621", undefined, undefined, NewThefts),
    ]
};
exports.ProviderList = [
    "https://nodes.iota.org:443"
];
SettingsManager_1.SettingsManager.GetInstance().AddNodes(exports.ProviderList);
main_1.GenerateGraph(exports.command);
//# sourceMappingURL=offlineTrace.js.map