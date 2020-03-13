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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var settings_1 = require("../settings");
var core_1 = require("@iota/core");
var AddressManager_1 = require("../Address/AddressManager");
var BundleManager_1 = require("../Bundle/BundleManager");
//In time
var DIRECTION;
(function (DIRECTION) {
    DIRECTION[DIRECTION["NONE"] = 0] = "NONE";
    DIRECTION[DIRECTION["FORWARD"] = 1] = "FORWARD";
    DIRECTION[DIRECTION["BACKWARD"] = 2] = "BACKWARD";
})(DIRECTION = exports.DIRECTION || (exports.DIRECTION = {}));
function QueryTransactions(txs) {
    return __awaiter(this, void 0, void 0, function () {
        var promises, addresses, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    promises = [];
                    addresses = [];
                    for (i = 0; i < txs.length; i++) {
                        promises.push(getReceivingAddress(txs[i])
                            .then(function (bundle) {
                            addresses.push(bundle);
                        })
                            .catch(function (err) { console.log("QueryTx error"); }));
                    }
                    return [4 /*yield*/, Promise.all(promises)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, addresses];
            }
        });
    });
}
exports.QueryTransactions = QueryTransactions;
function QueryAddress(addr, maxQueryDepth, queryDirection, refresh) {
    if (queryDirection === void 0) { queryDirection = DIRECTION.FORWARD; }
    if (refresh === void 0) { refresh = false; }
    return __awaiter(this, void 0, void 0, function () {
        var nextAddressesToQuery, counter, _loop_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    nextAddressesToQuery = [addr];
                    counter = 0;
                    _loop_1 = function () {
                        var addressesToQuery, addrPromises, bundlePromises, i;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    addressesToQuery = __spreadArrays(nextAddressesToQuery);
                                    nextAddressesToQuery = [];
                                    addrPromises = [];
                                    bundlePromises = [];
                                    //Log Queue
                                    if (counter)
                                        console.log("Queue on iter " + counter + ": " + JSON.stringify(addressesToQuery));
                                    //Loop over all addresses
                                    for (i = 0; i < addressesToQuery.length; i++) {
                                        //Query the Addresses
                                        addrPromises.push(AddressManager_1.AddressManager.GetInstance().AddAddress(addressesToQuery[i], refresh, queryDirection)
                                            .then(function (newBundles) { return __awaiter(_this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                bundlePromises.push(QueryBundles(newBundles, queryDirection)
                                                    .then(function (nextAddresses) {
                                                    nextAddressesToQuery = nextAddressesToQuery.concat(nextAddresses);
                                                })
                                                    .catch(function (err) { return console.log("Top Bundle Error: " + err); }));
                                                return [2 /*return*/];
                                            });
                                        }); })
                                            .catch(function (err) { return console.log("Top Address Error: " + err); }));
                                    }
                                    //Wait for all Addresses to finish
                                    return [4 /*yield*/, Promise.all(addrPromises)];
                                case 1:
                                    //Wait for all Addresses to finish
                                    _a.sent();
                                    return [4 /*yield*/, Promise.all(bundlePromises)];
                                case 2:
                                    _a.sent();
                                    //Increment Depth
                                    counter++;
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _a.label = 1;
                case 1:
                    if (!(nextAddressesToQuery.length && counter < maxQueryDepth)) return [3 /*break*/, 3];
                    return [5 /*yield**/, _loop_1()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.QueryAddress = QueryAddress;
function QueryBundles(bundles, queryDirection, store, refresh) {
    if (queryDirection === void 0) { queryDirection = DIRECTION.FORWARD; }
    if (store === void 0) { store = true; }
    if (refresh === void 0) { refresh = false; }
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var nextAddressesToQuery, bundlePromise, k;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                nextAddressesToQuery = [];
                                bundlePromise = [];
                                for (k = 0; k < bundles.length; k++) {
                                    //Query the Bundles
                                    bundlePromise.push(BundleManager_1.BundleManager.GetInstance().AddBundle(bundles[k], undefined, queryDirection, store)
                                        .then(function (addresses) {
                                        nextAddressesToQuery = nextAddressesToQuery.concat(addresses);
                                    })
                                        .catch(function (err) { return reject(err); }));
                                }
                                //Wait for all Bundles to finish
                                return [4 /*yield*/, Promise.all(bundlePromise)];
                            case 1:
                                //Wait for all Bundles to finish
                                _a.sent();
                                //Filter out addresses already loaded before and duplicates - but only when we don't explore
                                if (store) {
                                    nextAddressesToQuery = nextAddressesToQuery.filter(function (addr, index) {
                                        return (AddressManager_1.AddressManager.GetInstance().GetAddressItem(nextAddressesToQuery[index]) == undefined && nextAddressesToQuery.indexOf(addr) === index);
                                    });
                                }
                                resolve(nextAddressesToQuery);
                                return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
exports.QueryBundles = QueryBundles;
function Query(request) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var i, provider, iota, result, err_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                i = 0;
                                _a.label = 1;
                            case 1:
                                if (!(i < settings_1.maxTryCount)) return [3 /*break*/, 6];
                                provider = settings_1.ProviderList[Math.floor(Math.random() * settings_1.ProviderList.length)];
                                iota = core_1.composeAPI({ provider: provider });
                                _a.label = 2;
                            case 2:
                                _a.trys.push([2, 4, , 5]);
                                return [4 /*yield*/, _Query(request, iota)];
                            case 3:
                                result = _a.sent();
                                resolve(result);
                                return [2 /*return*/];
                            case 4:
                                err_1 = _a.sent();
                                console.log("Error caught for node " + provider + ": " + err_1);
                                console.log("Request: " + JSON.stringify(request));
                                return [3 /*break*/, 5];
                            case 5:
                                i++;
                                return [3 /*break*/, 1];
                            case 6:
                                reject("Rejected request as MaxTryCount is reached");
                                return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
exports.Query = Query;
function _Query(request, iota) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    iota.findTransactionObjects(request)
                        .then(function (result) {
                        resolve(result);
                    })
                        .catch(function (err) {
                        reject(err);
                    });
                })];
        });
    });
}
function GetInclusionStates(transactions) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var i, provider, iota, result, err_2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                i = 0;
                                _a.label = 1;
                            case 1:
                                if (!(i < settings_1.maxTryCount)) return [3 /*break*/, 6];
                                provider = settings_1.ProviderList[Math.floor(Math.random() * settings_1.ProviderList.length)];
                                iota = core_1.composeAPI({ provider: provider });
                                _a.label = 2;
                            case 2:
                                _a.trys.push([2, 4, , 5]);
                                return [4 /*yield*/, _GetInclusionStates(transactions, iota)];
                            case 3:
                                result = _a.sent();
                                resolve(result);
                                return [2 /*return*/];
                            case 4:
                                err_2 = _a.sent();
                                console.log("Error caught for node " + provider + " : " + err_2);
                                return [3 /*break*/, 5];
                            case 5:
                                i++;
                                return [3 /*break*/, 1];
                            case 6:
                                reject("Rejected request as MaxTryCount is reached");
                                return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
exports.GetInclusionStates = GetInclusionStates;
function _GetInclusionStates(transactions, iota) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        iota.getLatestInclusion(transactions)
                            .then(function (result) {
                            resolve(result);
                        })
                            .catch(function (err) {
                            reject(err);
                        });
                        return [2 /*return*/];
                    });
                }); })];
        });
    });
}
function getReceivingAddress(transactions) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var i, provider, iota, result, err_3;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                i = 0;
                                _a.label = 1;
                            case 1:
                                if (!(i < settings_1.maxTryCount)) return [3 /*break*/, 6];
                                provider = settings_1.ProviderList[Math.floor(Math.random() * settings_1.ProviderList.length)];
                                iota = core_1.composeAPI({ provider: provider });
                                _a.label = 2;
                            case 2:
                                _a.trys.push([2, 4, , 5]);
                                return [4 /*yield*/, iota.getTransactionObjects([transactions])];
                            case 3:
                                result = _a.sent();
                                resolve(result[0].address);
                                return [2 /*return*/];
                            case 4:
                                err_3 = _a.sent();
                                console.log("Error caught for node " + provider + " : " + err_3);
                                return [3 /*break*/, 5];
                            case 5:
                                i++;
                                return [3 /*break*/, 1];
                            case 6:
                                reject("Rejected request as MaxTryCount is reached");
                                return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
exports.getReceivingAddress = getReceivingAddress;
//# sourceMappingURL=query.js.map