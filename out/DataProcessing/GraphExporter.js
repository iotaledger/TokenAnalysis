"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphExporter = void 0;
var AddressManager_1 = require("../Address/AddressManager");
var BundleManager_1 = require("../Bundle/BundleManager");
var TransactionManager_1 = require("../Transactions/TransactionManager");
var fs = require('fs');
function valueLabel(value) {
    var negative = (value < 0);
    value = Math.abs(value);
    var label;
    if (value < 1000) {
        label = value + " i";
    }
    else if (value < 1000000) {
        label = Math.floor(value / 1000) + "." + Math.floor((value % 1000) / 10) + " Ki";
    }
    else if (value < 1000000000) {
        label = Math.floor(value / 1000000) + "." + Math.floor((value % 1000000) / 10000) + " Mi";
    }
    else { // if (value < 1000000000000) {
        label = Math.floor(value / 1000000000) + "." + Math.floor((value % 1000000000) / 10000000) + " Gi";
    }
    if (negative) {
        label = "-" + label;
    }
    return label;
}
function timestampLabel(timestamp) {
    var date = new Date(timestamp * 1000);
    return date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}
function colorLabel(renderColor) {
    var colorString = "";
    if (renderColor) {
        colorString = ", style=filled, color=\"" + renderColor + "\"";
    }
    return colorString;
}
var GraphExporter = /** @class */ (function () {
    function GraphExporter(name, inputColor, renderColor) {
        if (inputColor === void 0) { inputColor = "#eda151"; }
        if (renderColor === void 0) { renderColor = "#4bf2b5"; }
        this.name = name;
        this.addresses = new Map();
        this.bundles = new Map();
        this.edges = new Map();
    }
    GraphExporter.prototype.AddAll = function () {
        //Store all
        this.addresses = AddressManager_1.AddressManager.GetInstance().GetAddresses();
        this.bundles = BundleManager_1.BundleManager.GetInstance().GetBundles();
        this.calculateEdges();
    };
    GraphExporter.prototype.AddAddressSubGraph = function (addr) {
        var _this = this;
        var addressesToCheck = [addr];
        //Create a List of all nodes (Addresses & Bundles)
        while (addressesToCheck.length) {
            var currentAddresses = __spreadArrays(addressesToCheck);
            addressesToCheck = [];
            //Loop over the addresses
            for (var i = 0; i < currentAddresses.length; i++) {
                var inMemAddr = AddressManager_1.AddressManager.GetInstance().GetAddressItem(currentAddresses[i]);
                if (inMemAddr) {
                    inMemAddr = inMemAddr;
                    this.addresses.set(currentAddresses[i], inMemAddr);
                    //Loop over the Bundles
                    var outBundles = inMemAddr.GetOutBundles();
                    for (var k = 0; k < outBundles.length; k++) {
                        var outBundle = BundleManager_1.BundleManager.GetInstance().GetBundleItem(outBundles[k]);
                        //Prevent adding unknowns and duplicates
                        if (outBundle && !this.bundles.has(outBundles[k])) {
                            this.bundles.set(outBundles[k], outBundle);
                            addressesToCheck = addressesToCheck.concat(outBundle.GetOutAddresses());
                        }
                    }
                }
            }
            //Remove addresses we already processed and duplicates
            addressesToCheck = addressesToCheck.filter(function (addr, index) {
                return !_this.addresses.has(addr) && addressesToCheck.indexOf(addr) === index;
            });
        }
        this.calculateEdges();
    };
    GraphExporter.prototype.calculateEdges = function () {
        var _this = this;
        //Create a list of edges
        var transactions = TransactionManager_1.TransactionManager.GetInstance().GetTransactions();
        transactions.forEach(function (value, key) {
            //Check if the nodes are included
            var inputHash = value.GetInput();
            var outputHash = value.GetOutput();
            if ((_this.addresses.has(inputHash) || _this.bundles.has(inputHash)) && (_this.addresses.has(outputHash) || _this.bundles.has(outputHash))) {
                _this.edges.set(key, value);
            }
        });
    };
    GraphExporter.prototype.ExportToDOT = function () {
        var _this = this;
        //Initialize the data
        console.log("Started writing to file.gv");
        var fileString = "";
        //Opening
        fileString = fileString.concat("digraph \"" + this.name + "\" {\n");
        fileString = fileString.concat("rankdir=LR;\n");
        //Define all addresses without balance
        fileString = fileString.concat("node [shape=box]\n");
        this.addresses.forEach(function (value, key) {
            if (value.IsSpent()) {
                fileString = fileString.concat("\"" + key + "\"[label=\"" + key.substr(0, 3) + "..." + key.substr(key.length - 3, 3) + "\" " + colorLabel(undefined) + "]\n");
            }
        });
        //Render all addresses with balance
        fileString = fileString.concat("node [style=filled, color=\"green\"]\n");
        this.addresses.forEach(function (value, key) {
            if (!value.IsSpent()) {
                fileString = fileString.concat("\"" + key + "\"[label=\"" + key.substr(0, 3) + "..." + key.substr(key.length - 3, 3) + "\\n" + valueLabel(value.GetCurrentValue()) + "\"]\n");
            }
        });
        //Define all bundles
        fileString = fileString.concat("node [shape=ellipse, style=unfilled, color=\"black\"]\n");
        this.bundles.forEach(function (value, key) {
            fileString = fileString.concat("\"" + key + "\"[label=\"" + timestampLabel(value.GetTimestamp()) + "\"" + colorLabel(undefined) + "]\n");
        });
        //Add all edges
        this.edges.forEach(function (value, key) {
            fileString = fileString.concat("\"" + value.GetInput() + "\" -> \"" + value.GetOutput() + "\"");
            fileString = fileString.concat("[label=\"" + valueLabel(value.GetValue()) + "\"];\n");
        });
        //Closing
        fileString = fileString.concat("}");
        //Write to file
        fs.writeFile("DOT/" + this.name + ".gv", fileString, function (err) {
            if (err)
                console.log("Error writing file: " + _this.name + ":" + err);
            else {
                console.log("Succesfully saved " + _this.name);
            }
        });
    };
    GraphExporter.prototype.ExportToCSV = function (folder) {
        var _this = this;
        //Initialize
        var fileString = "";
        //Save Transactions
        this.edges.forEach(function (value, key) {
            fileString = fileString.concat("tx;" + key + ";" + value.GetInput() + ';' + value.GetOutput() + ";" + value.GetValue() + ";" + value.GetTag() + "\n");
        });
        //Save Addresses
        this.addresses.forEach(function (value, key) {
            //Initial Values
            fileString = fileString.concat("addr;" + key + ";" + value.GetTimestamp() + ";" + value.GetCurrentValue());
            //Arrays
            fileString = fileString.concat(";" + JSON.stringify(value.GetInTxs()));
            fileString = fileString.concat(";" + JSON.stringify(value.GetOutTxs()));
            //Finish
            fileString = fileString.concat("\n");
        });
        //Save Bundles
        this.bundles.forEach(function (value, key) {
            //Initial Values
            fileString = fileString.concat("bundle;" + key + ";" + value.GetTimestamp());
            //Arrays
            fileString = fileString.concat(";" + JSON.stringify(value.GetInTxs()));
            fileString = fileString.concat(";" + JSON.stringify(value.GetOutTxs()));
            //Finish
            fileString = fileString.concat("\n");
        });
        //Store to File
        fs.writeFile(folder + "/" + this.name + ".csv", fileString, function (err) {
            if (err)
                console.log("Error writing file: " + _this.name + ":" + err);
            else {
                //console.log("Succesfully saved " + this.name);
            }
        });
    };
    GraphExporter.prototype.ExportAllTransactionHashes = function (folder) {
        this.ExportArrayToFile(Array.from(this.edges.keys()), "txhashes", folder);
    };
    GraphExporter.prototype.ExportAllBundleHashes = function (folder) {
        this.ExportArrayToFile(Array.from(this.bundles.keys()), "bundlehashes", folder);
    };
    GraphExporter.prototype.ExportAllAddressHashes = function (folder) {
        this.ExportArrayToFile(Array.from(this.addresses.keys()), "addrhashes", folder);
    };
    GraphExporter.prototype.ExportAllUnspentAddressHashes = function (folder) {
        //Filters addresses that are spent and gets all hashes
        var addresses = Array.from(this.addresses.values()).filter(function (value) {
            return !value.IsSpent();
        }).map(function (value) { return value.GetAddressHash(); });
        this.ExportArrayToFile(addresses, "unspentaddrhashes", folder);
    };
    GraphExporter.prototype.ExportArrayToFile = function (data, itemname, folder) {
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
    GraphExporter.prototype.GetUnspentValue = function () {
        var unspentValue = 0;
        Array.from(this.addresses.values()).filter(function (value) {
            return !value.IsSpent();
        }).map(function (value) { unspentValue += value.GetCurrentValue(); });
        ;
        return unspentValue;
    };
    return GraphExporter;
}());
exports.GraphExporter = GraphExporter;
//# sourceMappingURL=GraphExporter.js.map