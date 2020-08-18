"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderType = exports.GraphToQuery = void 0;
/**
 * Graph to query
 * @description Data structure
 */
var GraphToQuery = /** @class */ (function () {
    function GraphToQuery(name, renderType, inputColor, renderColor, TxsToSearch, BundlesToSearch, AddressesToSearch) {
        if (TxsToSearch === void 0) { TxsToSearch = []; }
        if (BundlesToSearch === void 0) { BundlesToSearch = []; }
        if (AddressesToSearch === void 0) { AddressesToSearch = []; }
        this.name = name;
        this.renderType = renderType;
        this.inputColor = inputColor;
        this.renderColor = renderColor;
        this.TxsToSearch = TxsToSearch;
        this.bundlesToSearch = BundlesToSearch;
        this.addressesToSearch = AddressesToSearch;
    }
    return GraphToQuery;
}());
exports.GraphToQuery = GraphToQuery;
var RenderType;
(function (RenderType) {
    RenderType[RenderType["ADD"] = 0] = "ADD";
    RenderType[RenderType["SUBTRACT"] = 1] = "SUBTRACT";
    RenderType[RenderType["NONE"] = 2] = "NONE";
})(RenderType = exports.RenderType || (exports.RenderType = {}));
//# sourceMappingURL=GraphToQuery.js.map