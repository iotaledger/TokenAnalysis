"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Address_1 = require("../Address/Address");
var Bundle_1 = require("../Bundle/Bundle");
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
var DatabaseManager;
(function (DatabaseManager) {
    function ImportFromCSV(folder, filename) {
        var name = folder + "/" + filename + ".csv";
        if (fs.existsSync(name)) {
            var data = fs.readFileSync(name);
            var singleItems = data.toString().split("\n");
            //Load all items
            for (var i = 0; i < singleItems.length; i++) {
                var line = singleItems[i];
                var singleDatapoints = line.split(";");
                if (singleDatapoints[0] == "tx") {
                    //Transaction loading
                    TransactionManager_1.TransactionManager.GetInstance().AddTransaction(singleDatapoints[2], singleDatapoints[3], parseInt(singleDatapoints[4]), singleDatapoints[5], singleDatapoints[1]);
                }
                else if (singleDatapoints[0] == "addr") {
                    //Address Loading
                    var newAddress = new Address_1.Address(singleDatapoints[1]);
                    newAddress.SetData(singleDatapoints[1], parseInt(singleDatapoints[2]), parseInt(singleDatapoints[3]), JSON.parse(singleDatapoints[4]), JSON.parse(singleDatapoints[5]));
                    AddressManager_1.AddressManager.GetInstance().LoadAddress(newAddress);
                }
                else if (singleDatapoints[0] == "bundle") {
                    //Bundle Loading
                    var newBundle = new Bundle_1.Bundle(singleDatapoints[1]);
                    newBundle.SetData(singleDatapoints[1], parseInt(singleDatapoints[2]), JSON.parse(singleDatapoints[3]), JSON.parse(singleDatapoints[4]));
                    BundleManager_1.BundleManager.GetInstance().LoadBundle(newBundle);
                }
            }
        }
    }
    DatabaseManager.ImportFromCSV = ImportFromCSV;
    function ExportToDOT(filename, addresses, bundles, edges, outputColors, renderColors) {
        var name = "DOT/" + filename + ".gv";
        //Loop over the subgraphs
        var subgraphcount = Math.min(addresses.length, bundles.length, outputColors.length, renderColors.length);
        //Initialize the data
        //console.log("Started writing to " + name);
        var fileString = "";
        //Opening
        fileString = fileString.concat("digraph \"" + filename + "\" {\n");
        fileString = fileString.concat("rankdir=LR;\n");
        //Render all Ending Addresses
        for (var i = 0; i < subgraphcount; i++) {
            fileString = fileString.concat("node [shape=box " + colorLabel(outputColors[i]) + "]\n");
            addresses[i].forEach(function (value, key) {
                if (!value.IsSpent()) {
                    fileString = fileString.concat("\"" + key + "\"[label=\"" + key.substr(0, 3) + "..." + key.substr(key.length - 3, 3) + "\"]\n");
                }
            });
        }
        //Render the other Addresses
        for (var i = 0; i < subgraphcount; i++) {
            fileString = fileString.concat("node [shape=box " + colorLabel(renderColors[i]) + "]\n");
            addresses[i].forEach(function (value, key) {
                if (value.IsSpent()) {
                    fileString = fileString.concat("\"" + key + "\"[label=\"" + key.substr(0, 3) + "..." + key.substr(key.length - 3, 3) + "\"]\n");
                }
            });
        }
        //Render the Bundles
        for (var i = 0; i < subgraphcount; i++) {
            fileString = fileString.concat("node [shape=ellipse " + colorLabel(renderColors[i]) + "]\n");
            bundles[i].forEach(function (value, key) {
                fileString = fileString.concat("\"" + key + "\"[label=\"" + key.substr(0, 3) + "..." + key.substr(key.length - 3, 3) + "\n " + timestampLabel(value.GetTimestamp()) + "\"]\n");
            });
        }
        //Render the edges
        edges.forEach(function (value, key) {
            fileString = fileString.concat("\"" + value.GetInput() + "\" -> \"" + value.GetOutput() + "\"");
            fileString = fileString.concat("[label=\"" + valueLabel(value.GetValue()) + "\"];\n");
        });
        //Closing
        fileString = fileString.concat("}");
        //Write to file
        if (name.length) {
            fs.writeFile(name, fileString, function (err) {
                if (err)
                    console.log("Error writing file: " + name + ":" + err);
                else {
                    //console.log("Succesfully saved " + name);
                }
            });
        }
        return fileString;
    }
    DatabaseManager.ExportToDOT = ExportToDOT;
})(DatabaseManager = exports.DatabaseManager || (exports.DatabaseManager = {}));
//# sourceMappingURL=DatabaseManager.js.map