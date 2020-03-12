"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Transaction = /** @class */ (function () {
    function Transaction(input, output, value, tag, hash) {
        this.input = input;
        this.output = output;
        this.value = value;
        this.tag = tag;
        this.hash = hash;
    }
    Transaction.prototype.GetTag = function () {
        return this.tag;
    };
    Transaction.prototype.GetTransactionHash = function () {
        return this.hash;
    };
    Transaction.prototype.GetInput = function () {
        return this.input;
    };
    Transaction.prototype.GetOutput = function () {
        return this.output;
    };
    Transaction.prototype.GetValue = function () {
        return this.value;
    };
    return Transaction;
}());
exports.Transaction = Transaction;
//# sourceMappingURL=Transaction.js.map