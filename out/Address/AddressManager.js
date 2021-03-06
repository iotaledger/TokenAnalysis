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
var Address_1 = require("./Address");
var Query_1 = require("../DataProcessing/Query");
var DatabaseManager_1 = require("../DataProcessing/DatabaseManager");
var AddressManager = /** @class */ (function () {
    function AddressManager() {
        this.addresses = new Map();
    }
    AddressManager.prototype.LoadAddress = function (addr) {
        this.addresses.set(addr.GetAddressHash(), addr);
    };
    AddressManager.prototype.AddAddress = function (addr, refresh, useCache, loadDirection) {
        if (refresh === void 0) { refresh = false; }
        if (useCache === void 0) { useCache = false; }
        if (loadDirection === void 0) { loadDirection = Query_1.DIRECTION.FORWARD; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var newAddr_1;
                        var _this = this;
                        var _a;
                        return __generator(this, function (_b) {
                            //Check if the address was cached and load it
                            if (useCache) {
                                DatabaseManager_1.DatabaseManager.ImportFromCSV("Cache", addr);
                            }
                            //Load the Addresses
                            if (!this.addresses.has(addr) || refresh) {
                                newAddr_1 = new Address_1.Address(addr);
                                newAddr_1.Query()
                                    .then(function (exists) {
                                    //Add Address to the list
                                    if (!exists) {
                                        resolve([]);
                                        return;
                                    }
                                    _this.addresses.set(addr, newAddr_1);
                                    //Return the next bundles to process
                                    if (loadDirection == Query_1.DIRECTION.FORWARD) {
                                        resolve(newAddr_1.GetOutBundles());
                                    }
                                    else if (loadDirection == Query_1.DIRECTION.BACKWARD) {
                                        resolve(newAddr_1.GetInBundles());
                                    }
                                })
                                    .catch(function (err) { return reject(err); });
                            }
                            else {
                                //Addresses has already been loaded
                                resolve((_a = this.GetAddressItem(addr)) === null || _a === void 0 ? void 0 : _a.GetOutBundles());
                            }
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    AddressManager.GetInstance = function () {
        if (!this.instance) {
            this.instance = new AddressManager();
        }
        return this.instance;
    };
    AddressManager.prototype.GetAddressItem = function (addr) {
        return this.addresses.get(addr);
    };
    AddressManager.prototype.GetAddresses = function () {
        return this.addresses;
    };
    return AddressManager;
}());
exports.AddressManager = AddressManager;
//# sourceMappingURL=AddressManager.js.map