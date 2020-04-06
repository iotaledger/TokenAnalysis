"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var AddressManager_1 = require("../Address/AddressManager");
var BundleManager_1 = require("../Bundle/BundleManager");
var TransactionManager_1 = require("../Transactions/TransactionManager");
var fs = require('fs');
var Path = /** @class */ (function () {
    function Path(addr, maxDepth) {
        if (maxDepth === void 0) { maxDepth = 1000; }
        this.originalAddress = addr;
        this.addresses = new Map();
        this.bundles = new Map();
        this.edges = new Map();
        //Load initial path
        this.AddAddrToPath(addr, maxDepth);
    }
    Path.prototype.AddAddrToPath = function (addr, maxDepth) {
        var _this = this;
        if (maxDepth === void 0) { maxDepth = 1000; }
        var addressesToCheck = [addr];
        //Create a List of all nodes (Addresses & Bundles)
        var counter = 0;
        while (addressesToCheck.length && counter < maxDepth) {
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
            counter++;
        }
        this.calculateEdges();
    };
    Path.prototype.calculateEdges = function () {
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
    Path.prototype.Cache = function (folder) {
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
        fs.writeFile(folder + "/" + this.originalAddress + ".csv", fileString, function (err) {
            if (err)
                console.log("Error writing file: " + _this.originalAddress + ":" + err);
            else {
                console.log("Succesfully saved " + _this.originalAddress);
            }
        });
    };
    Path.prototype.GetAddresses = function () {
        return this.addresses;
    };
    Path.prototype.GetBundles = function () {
        return this.bundles;
    };
    Path.prototype.GetTransactions = function () {
        return this.edges;
    };
    return Path;
}());
exports.Path = Path;
//# sourceMappingURL=Path.js.map