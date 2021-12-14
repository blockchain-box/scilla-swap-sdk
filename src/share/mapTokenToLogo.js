const Token = require("../model/Token");
const {toBech32Address} = require("@zilliqa-js/crypto");
const {tokens} = require("./mapTestAddresses");
const bech32 = (token_address) => toBech32Address(tokens[token_address] ? tokens[token_address] : token_address);

module.exports = (token = new Token({})) => token.isZil() ? "https://meta.viewblock.io/ZIL/logo" : `https://meta.viewblock.io/zilliqa.${bech32(token.address)}/logo`