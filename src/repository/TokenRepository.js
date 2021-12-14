const {Zilliqa} = require("@zilliqa-js/zilliqa");
const {zilAddress} = require("../share/mapTestAddresses");
const Token = require("../model/Token");
const axios = require("axios");

module.exports = class TokenRepository {
    constructor({nodeAPI}) {
        this._zilliqa = new Zilliqa(nodeAPI);
    }

    async getPriceOfTokenUSD(symbol) {
        const data = (await axios.get("https://api.zilstream.com/tokens/" + symbol)).data;
        if (data) {
            return symbol.toLowerCase() === "zil" ? data.rate : data.rate_usd;
        }
        return 0;
    }

    async getPriceOfTokenInZil(symbol) {
        const data = (await axios.get("https://api.zilstream.com/tokens/" + symbol)).data;
        if (data) {
            return data.rate;
        }
        return 0;
    }

    async findToken(tokenAddress) {
        if (tokenAddress.toLowerCase() === zilAddress) {
            return new Token({address: zilAddress, name: "zilliqa", symbol: "zil", decimals: 12});
        }
        const fetcher = this._zilliqa.contracts.at(tokenAddress);
        const init = await fetcher.getInit();
        if (init && init.length) {
            const token = init.reduce((acc, param) => ({
                ...acc,
                [param.vname]: param.value,
            }), {address: tokenAddress});
            return new Token({
                address: tokenAddress,
                name: token.name,
                symbol: token.symbol,
                decimals: parseInt(token.decimals)
            })
        }
        return null;
    }
}