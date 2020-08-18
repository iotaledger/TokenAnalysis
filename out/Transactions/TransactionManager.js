"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionManager = void 0;
var Transaction_1 = require("./Transaction");
var TransactionManager = /** @class */ (function () {
    function TransactionManager() {
        this.transactions = new Map();
    }
    TransactionManager.prototype.AddTransaction = function (input, output, value, tag, hash) {
        var tx;
        if (!this.transactions.has(hash)) {
            tx = new Transaction_1.Transaction(input, output, value, tag, hash);
            this.transactions.set(hash, tx);
        }
        else {
            tx = this.transactions.get(hash);
        }
        return tx;
    };
    TransactionManager.prototype.GetTransactionItem = function (hash) {
        return this.transactions.get(hash);
    };
    TransactionManager.prototype.GetTransactions = function () {
        return this.transactions;
    };
    TransactionManager.GetInstance = function () {
        if (!this.instance) {
            this.instance = new TransactionManager();
        }
        return this.instance;
    };
    return TransactionManager;
}());
exports.TransactionManager = TransactionManager;
//# sourceMappingURL=TransactionManager.js.map