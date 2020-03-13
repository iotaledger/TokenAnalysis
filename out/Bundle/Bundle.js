"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var query_1 = require("../DataProcessing/query");
var TransactionManager_1 = require("../Transactions/TransactionManager");
var Bundle = /** @class */ (function () {
    function Bundle(bundleHash) {
        this.hash = bundleHash;
        this.timestamp = 0;
        this.inTxs = [];
        this.outTxs = [];
    }
    Bundle.prototype.SetData = function (bundle, timestamp, inTxs, outTxs) {
        this.hash = bundle;
        this.timestamp = timestamp;
        this.inTxs = inTxs;
        this.outTxs = outTxs;
    };
    Bundle.prototype.Query = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        query_1.Query({ bundles: [_this.hash] })
                            .then(function (transactions) {
                            var transactionHashes = [];
                            for (var k = 0; k < transactions.length; k++) {
                                transactionHashes.push(transactions[k].hash);
                            }
                            query_1.GetInclusionStates(transactionHashes)
                                .then(function (inclusionResults) {
                                //Filter out unconfirmed and 0-value transactions
                                transactions = transactions.filter(function (transaction, index) {
                                    return (inclusionResults[index] && transactions[index].value != 0);
                                });
                                //Loop over the Transactions
                                for (var i = 0; i < transactions.length; i++) {
                                    //Update timestamp to latest
                                    _this.timestamp = (_this.timestamp > transactions[i].timestamp) ? _this.timestamp : transactions[i].timestamp;
                                    //Sort Transactions as in or out
                                    if (transactions[i].value > 0) {
                                        //Create the Transactions
                                        var tx = TransactionManager_1.TransactionManager.GetInstance().AddTransaction(_this.hash, transactions[i].address, transactions[i].value, transactions[i].tag, transactions[i].hash);
                                        _this.outTxs.push(tx.GetTransactionHash());
                                    }
                                    else {
                                        //Create the Transactions
                                        var tx = TransactionManager_1.TransactionManager.GetInstance().AddTransaction(transactions[i].address, _this.hash, transactions[i].value, transactions[i].tag, transactions[i].hash);
                                        _this.inTxs.push(tx.GetTransactionHash());
                                    }
                                }
                                resolve((transactions.length > 0));
                            })
                                .catch(function (err) { return reject(err); });
                        })
                            .catch(function (err) { reject("Bundles error " + _this.hash + " :" + err); });
                    })];
            });
        });
    };
    Bundle.prototype.GetBundleHash = function () {
        return this.hash;
    };
    Bundle.prototype.hasTrinityTag = function () {
        var _a;
        for (var i = 0; i < this.outTxs.length; i++) {
            if (((_a = TransactionManager_1.TransactionManager.GetInstance().GetTransactionItem(this.outTxs[i])) === null || _a === void 0 ? void 0 : _a.GetTag().substr(0, 7)) == "TRINITY") {
                return true;
            }
        }
        return false;
    };
    Bundle.prototype.GetOutTxs = function () {
        return this.outTxs;
    };
    Bundle.prototype.GetInTxs = function () {
        return this.inTxs;
    };
    Bundle.prototype.GetInAddresses = function () {
        var inAddresses = [];
        for (var i = 0; i < this.inTxs.length; i++) {
            var tx = TransactionManager_1.TransactionManager.GetInstance().GetTransactionItem(this.inTxs[i]);
            if (tx) {
                inAddresses.push(tx.GetInput());
            }
        }
        return inAddresses;
    };
    Bundle.prototype.GetOutAddresses = function () {
        var outAddresses = [];
        for (var i = 0; i < this.outTxs.length; i++) {
            var tx = TransactionManager_1.TransactionManager.GetInstance().GetTransactionItem(this.outTxs[i]);
            if (tx) {
                outAddresses.push(tx.GetOutput());
            }
        }
        return outAddresses;
    };
    Bundle.prototype.GetTimestamp = function () {
        return this.timestamp;
    };
    return Bundle;
}());
exports.Bundle = Bundle;
//# sourceMappingURL=Bundle.js.map