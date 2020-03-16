"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var DatabaseManager_1 = require("../DataProcessing/DatabaseManager");
var TransactionManager_1 = require("../Transactions/TransactionManager");
var Graph = /** @class */ (function () {
    function Graph(name) {
        this.name = name;
        this.addressess = [];
        this.bundles = [];
        this.edges = new Map();
        this.outputColors = [];
        this.renderColors = [];
    }
    Graph.prototype.SubGraphAddition = function (subgraph) {
        //Just add the graph data
        this.addressess.push(subgraph.GetAddresses());
        this.bundles.push(subgraph.GetBundles());
        this.calculateEdges();
        this.outputColors.push(subgraph.GetEndpointColor());
        this.renderColors.push(subgraph.GetRenderColor());
    };
    Graph.prototype.SubGraphSubtraction = function (subgraph) {
        var _this = this;
        //Loop through all existing graphs and remove overlap
        subgraph.GetAddresses().forEach(function (value, key) {
            for (var k = 0; k < _this.addressess.length; k++) {
                _this.addressess[k].delete(key);
            }
        });
        subgraph.GetBundles().forEach(function (value, key) {
            for (var k = 0; k < _this.bundles.length; k++) {
                _this.bundles[k].delete(key);
            }
        });
        //Add edge addresses for nicer render
        var edgeAddresses = new Map();
        subgraph.GetAddresses().forEach(function (value, key) {
            var inBundles = value.GetInBundles();
            inbundles: for (var m = 0; m < inBundles.length; m++) {
                for (var k = 0; k < _this.bundles.length; k++) {
                    if (_this.bundles[k].has(inBundles[m])) {
                        edgeAddresses.set(key, value);
                        break inbundles;
                    }
                }
            }
        });
        if (edgeAddresses.size > 0) {
            this.addressess.push(edgeAddresses);
            this.bundles.push(new Map());
            this.outputColors.push(subgraph.GetEndpointColor());
            this.renderColors.push(subgraph.GetRenderColor());
        }
        this.calculateEdges();
    };
    Graph.prototype.calculateEdges = function () {
        var _this = this;
        //Combined list
        var combinedAddresses = new Map();
        var combinedBundles = new Map();
        for (var i = 0; i < this.addressess.length; i++) {
            combinedAddresses = new Map(__spreadArrays(Array.from(combinedAddresses.entries()), Array.from(this.addressess[i].entries())));
            combinedBundles = new Map(__spreadArrays(Array.from(combinedBundles.entries()), Array.from(this.bundles[i].entries())));
        }
        //Reset Edges
        this.edges = new Map();
        //Create a list of edges
        var transactions = TransactionManager_1.TransactionManager.GetInstance().GetTransactions();
        transactions.forEach(function (value, key) {
            //Check if the nodes are included
            var inputHash = value.GetInput();
            var outputHash = value.GetOutput();
            if ((combinedAddresses.has(inputHash) || combinedBundles.has(inputHash)) && (combinedAddresses.has(outputHash) || combinedBundles.has(outputHash))) {
                _this.edges.set(key, value);
            }
        });
    };
    Graph.prototype.ExportToDOT = function () {
        DatabaseManager_1.DatabaseManager.ExportToDOT(this.name, this.addressess, this.bundles, this.edges, this.outputColors, this.renderColors);
    };
    Graph.prototype.GetDOTString = function () {
        return DatabaseManager_1.DatabaseManager.GenerateDOT(this.addressess, this.bundles, this.edges, this.outputColors, this.renderColors);
    };
    return Graph;
}());
exports.Graph = Graph;
//# sourceMappingURL=Graph.js.map