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
var Path_1 = require("./Path");
var fs = require('fs');
var SubGraph = /** @class */ (function () {
    function SubGraph(name, endpointColor, renderColor) {
        if (endpointColor === void 0) { endpointColor = "#eda151"; }
        if (renderColor === void 0) { renderColor = "#4bf2b5"; }
        this.paths = new Map();
        this.name = name;
        this.endpointColor = endpointColor;
        this.renderColor = renderColor;
    }
    SubGraph.prototype.AddAddress = function (addr) {
        if (!this.paths.has(addr)) {
            this.paths.set(addr, new Path_1.Path(addr));
        }
    };
    SubGraph.prototype.UpdateAddresses = function () {
        this.paths.forEach(function (value, key) {
            value.UpdateEndpoints();
        });
    };
    SubGraph.prototype.ExportToDOT = function () {
        DatabaseManager_1.DatabaseManager.ExportToDOT(this.name, [this.GetAddresses()], [this.GetBundles()], this.GetEdges(), [this.endpointColor], [this.renderColor]);
    };
    SubGraph.prototype.GetDOTString = function () {
        return DatabaseManager_1.DatabaseManager.GenerateDOT([this.GetAddresses()], [this.GetBundles()], this.GetEdges(), [this.endpointColor], [this.renderColor]);
    };
    SubGraph.prototype.GetAddresses = function () {
        var addrs = new Map();
        this.paths.forEach(function (value, key) {
            addrs = new Map(__spreadArrays(Array.from(addrs.entries()), Array.from(value.GetAddresses())));
        });
        return addrs;
    };
    SubGraph.prototype.GetBundles = function () {
        var bundles = new Map();
        this.paths.forEach(function (value, key) {
            bundles = new Map(__spreadArrays(Array.from(bundles.entries()), Array.from(value.GetBundles())));
        });
        return bundles;
    };
    SubGraph.prototype.GetEdges = function () {
        var edges = new Map();
        this.paths.forEach(function (value, key) {
            edges = new Map(__spreadArrays(Array.from(edges.entries()), Array.from(value.GetTransactions())));
        });
        return edges;
    };
    SubGraph.prototype.GetEndpointColor = function () {
        return this.endpointColor;
    };
    SubGraph.prototype.GetRenderColor = function () {
        return this.renderColor;
    };
    SubGraph.prototype.ExportAllTransactionHashes = function (folder) {
        this.ExportArrayToFile(Array.from(this.GetEdges().keys()), "txhashes", folder);
    };
    SubGraph.prototype.ExportAllBundleHashes = function (folder) {
        this.ExportArrayToFile(Array.from(this.GetBundles().keys()), "bundlehashes", folder);
    };
    SubGraph.prototype.ExportAllAddressHashes = function (folder) {
        this.ExportArrayToFile(Array.from(this.GetAddresses().keys()), "addrhashes", folder);
    };
    SubGraph.prototype.ExportAllUnspentAddressHashes = function (folder) {
        //Filters addresses that are spent and gets all hashes
        var addresses = Array.from(this.GetAddresses().values()).filter(function (value) {
            return !value.IsSpent();
        }).map(function (value) { return value.GetAddressHash(); });
        this.ExportArrayToFile(addresses, "unspentaddrhashes", folder);
    };
    SubGraph.prototype.ExportArrayToFile = function (data, itemname, folder) {
        var fileString = "";
        for (var i = 0; i < data.length; i++) {
            fileString = fileString.concat(data[i] + "\n");
        }
        var name = folder + "/" + itemname + "_" + this.name + ".txt";
        fs.writeFile(name, fileString, function (err) {
            if (err)
                console.log("Error writing file: " + name + ":" + err);
            else {
                console.log("Succesfully saved " + name);
            }
        });
    };
    return SubGraph;
}());
exports.SubGraph = SubGraph;
//# sourceMappingURL=SubGraph.js.map