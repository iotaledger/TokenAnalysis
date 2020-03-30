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
var Bundle_1 = require("./Bundle");
var Query_1 = require("../DataProcessing/Query");
var BundleManager = /** @class */ (function () {
    function BundleManager() {
        this.bundles = new Map();
    }
    BundleManager.prototype.LoadBundle = function (bundle) {
        this.bundles.set(bundle.GetBundleHash(), bundle);
    };
    BundleManager.prototype.AddBundle = function (bundleHash, refresh, loadDirection, store) {
        if (refresh === void 0) { refresh = false; }
        if (loadDirection === void 0) { loadDirection = Query_1.DIRECTION.FORWARD; }
        if (store === void 0) { store = true; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var _a, _b;
                        //Load the Bundles
                        if (!_this.bundles.has(bundleHash) || refresh) {
                            var bundle_1 = new Bundle_1.Bundle(bundleHash);
                            bundle_1.Query()
                                .then(function (exists) {
                                if (!exists) {
                                    resolve([]);
                                    return;
                                }
                                //Add Bundle to the list
                                if (store)
                                    _this.bundles.set(bundleHash, bundle_1);
                                //Return the next addresses to process
                                if (loadDirection == Query_1.DIRECTION.FORWARD) {
                                    resolve(bundle_1.GetOutAddresses());
                                }
                                else if (loadDirection == Query_1.DIRECTION.BACKWARD) {
                                    resolve(bundle_1.GetInAddresses());
                                }
                            })
                                .catch(function (err) { return reject(err); });
                        }
                        else {
                            if (!store) {
                                if (loadDirection == Query_1.DIRECTION.FORWARD) {
                                    resolve((_a = _this.bundles.get(bundleHash)) === null || _a === void 0 ? void 0 : _a.GetOutAddresses());
                                }
                                else if (loadDirection == Query_1.DIRECTION.BACKWARD) {
                                    resolve((_b = _this.bundles.get(bundleHash)) === null || _b === void 0 ? void 0 : _b.GetInAddresses());
                                }
                            }
                            else {
                                resolve([]);
                            }
                        }
                    })];
            });
        });
    };
    BundleManager.GetInstance = function () {
        if (!this.instance) {
            this.instance = new BundleManager();
        }
        return this.instance;
    };
    BundleManager.prototype.GetBundleItem = function (bundleHash) {
        return this.bundles.get(bundleHash);
    };
    BundleManager.prototype.GetBundles = function () {
        return this.bundles;
    };
    return BundleManager;
}());
exports.BundleManager = BundleManager;
//# sourceMappingURL=BundleManager.js.map