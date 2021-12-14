const {Zilliqa} = require("@zilliqa-js/zilliqa");
const {zilAddress} = require("../share/mapTestAddresses");

module.exports = class BalanceRepository {
    constructor({nodeAPI}) {
        this._zilliqa = new Zilliqa(nodeAPI);
    }

    async getBalanceOfToken(account, tokenAddress) {
        if (tokenAddress.toLowerCase() === zilAddress) {
            const {result} = await this._zilliqa.blockchain.getBalance(account.toLowerCase());
            if (result) {
                return result.balance;
            }
            return 0;
        } else {
            const tokenContract = this._zilliqa.contracts.at(tokenAddress);
            const state = await tokenContract.getSubState("balances", [account.toLowerCase()]);
            if (state) {
                return state["balances"][account.toLowerCase()];
            }
            return 0;
        }
        return 0;
    }
}