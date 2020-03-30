"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SettingsManager = /** @class */ (function () {
    function SettingsManager() {
        this.nodes = [];
        this.restTime = 2000;
        this.maxTryCount = 3;
        this.maxQueryDepth = 100;
    }
    /**
     * @param restTime Determines how long a node is not used when it fails. RestTime is in milliseconds. {Default = 2000 ms}
     */
    SettingsManager.prototype.SetRestTime = function (restTime) {
        this.restTime = restTime;
    };
    /**
     * @param maxQueryDepth The amount of layers a search is allowed to do before it returns prematurly. This prevents super long and endless queries.
     */
    SettingsManager.prototype.SetMaxQueryDepth = function (maxQueryDepth) {
        this.maxQueryDepth = maxQueryDepth;
    };
    /**
     * Returns the amount of layers a search is allowed to do before it returns.
     */
    SettingsManager.prototype.GetMaxQueryDepth = function () {
        return this.maxQueryDepth;
    };
    /**
     * @param maxTryCount The amount of times a query must fail before it no longer tries. {Default = 3}
     */
    SettingsManager.prototype.SetMaxTryCount = function (maxTryCount) {
        this.maxTryCount = maxTryCount;
    };
    /**
     * Returns the amount of times a query must fail before it no longer tries.
     */
    SettingsManager.prototype.GetMaxTryCount = function () {
        return this.maxTryCount;
    };
    /**
     * @param nodes Adds an array of node URLS (including ports) to the program. It randomly picks a node for every request.
     */
    SettingsManager.prototype.AddNodes = function (nodes) {
        this.nodes = this.nodes.concat(nodes);
    };
    SettingsManager.prototype.GetRandomNode = function () {
        return this.nodes[Math.floor(Math.random() * this.nodes.length)];
    };
    /**
     * Makes a node take a break for RestTime amount of milliseconds. This prevents a node from continuously throwing errors. Will ignore if it is the last node.
     * @param node The node URL to Rest
     */
    SettingsManager.prototype.RestNode = function (node) {
        var _this = this;
        if (this.nodes.length > 1) {
            var index = this.nodes.indexOf(node);
            var removedNodes_1 = this.nodes.splice(index, 1);
            if (removedNodes_1) {
                setTimeout(function () {
                    _this.AddNodes(removedNodes_1);
                }, this.restTime);
            }
        }
    };
    /**
     * Singleton design. Returns the instance of SettingsManager. If it doesn't exists yet, it creates a new instance before returning it.
     */
    SettingsManager.GetInstance = function () {
        if (!this.instance) {
            this.instance = new SettingsManager();
        }
        return this.instance;
    };
    return SettingsManager;
}());
exports.SettingsManager = SettingsManager;
//# sourceMappingURL=SettingsManager.js.map