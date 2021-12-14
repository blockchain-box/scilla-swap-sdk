const {Zilliqa} = require("@zilliqa-js/zilliqa");
const {zilAddress} = require("../share/mapTestAddresses");
const Token = require("../model/Token");
const axios = require("axios");

const mapTestSymbols = require("../share/mapTestSymbols");
const BigNumber = require("bignumber.js");

module.exports = class TokenRepository {
    constructor({nodeAPI}) {
        this._zilliqa = new Zilliqa(nodeAPI);
    }

    getUrlOfTokenPrice(token) {
        return ("https://api.zilstream.com/tokens/") + (mapTestSymbols[token.symbol.toLowerCase()] ? mapTestSymbols[token.symbol.toLowerCase()] : token.symbol)
    }

    priceOfTokenInCarbWithPool(token, pool, carbAddress) {
        if (carbAddress === token.address) {
            throw new Error("not allowed to find price of carb in carb");
        }
        const tokenDenom = new BigNumber(10).pow(token.decimals);
        const carbDenom = new BigNumber(10).pow(8);
        const carbAmount = new BigNumber(pool.carbAmount).div(carbDenom);
        const tokenAmount = new BigNumber(pool.tokenAmount).div(tokenDenom);
        return carbAmount.div(tokenAmount).toFixed(8);
    }

    async getPriceOfTokenUSD(symbol) {
        const url = this.getUrlOfTokenPrice({symbol});
        const data = (await axios.get(url)).data;
        if (data) {
            return symbol.toLowerCase() === "zil" ? data.rate : data.rate_usd;
        }
        return 0;
    }

    async getPriceOfTokenInZil(symbol) {
        const url = this.getUrlOfTokenPrice({symbol});
        const data = (await axios.get(url)).data;
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
