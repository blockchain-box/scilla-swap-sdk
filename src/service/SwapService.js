const fields = require("../share/swapFields");

const {Zilliqa} = require("@zilliqa-js/zilliqa");
const tokenToNumber = require("../utils/tokenToNumber");
const axios = require("axios");

const {Uint128, Bool, ByStr20, BNum, String} = require("../share/scillaTypes");

const transitions = {
    WithdrawCarb() {
        return [];
    },
    ClaimGraph() {
        return [];
    },
    AddLiquidity({carb_amount, token_address, min_contribution_amount, max_token_amount, deadline_block}) {
        return [
            Uint128("carb_amount", carb_amount),
            ByStr20("token_address", token_address),
            Uint128("min_contribution_amount", min_contribution_amount),
            Uint128("max_token_amount", max_token_amount),
            BNum("deadline_block", deadline_block)
        ];
    },
    RemoveLiquidity({token_address, contribution_amount, min_carb_amount, min_token_amount, deadline_block}) {
        return [
            ByStr20("token_address", token_address),
            Uint128("contribution_amount", contribution_amount),
            Uint128("min_carb_amount", min_carb_amount),
            Uint128("min_token_amount", min_token_amount),
            BNum("deadline_block", deadline_block),
        ];
    },
    SwapExactCarbForTokens({
                               amount,
                               token_address,
                               min_token_amount,
                               deadline_block,
                               recipient_address,
                               is_transfer,
                               avatar
                           }) {
        return [
            Uint128("amount", amount),
            ByStr20("token_address", token_address),
            Uint128("min_token_amount", min_token_amount),
            BNum("deadline_block", deadline_block),
            ByStr20("recipient_address", recipient_address),
            Bool("is_transfer", is_transfer),
            String("avatar", avatar)
        ];
    },
    SwapExactTokensForCarb({
                               token_address,
                               token_amount,
                               min_carb_amount,
                               deadline_block,
                               recipient_address,
                               is_transfer,
                               avatar
                           }) {
        return [
            ByStr20("token_address", token_address),
            Uint128("token_amount", token_amount),
            Uint128("min_carb_amount", min_carb_amount),
            BNum("deadline_block", deadline_block),
            ByStr20("recipient_address", recipient_address),
            Bool("is_transfer", is_transfer),
            String("avatar", avatar)
        ];
    },
    SwapExactTokensForTokens({
                                 token0_address,
                                 token1_address,
                                 token0_amount,
                                 min_token1_amount,
                                 deadline_block,
                                 recipient_address,
                                 is_transfer,
                                 avatar
                             }) {
        return [
            ByStr20("token0_address", token0_address),
            ByStr20("token1_address", token1_address),
            Uint128("token0_amount", token0_amount),
            Uint128("min_token1_amount", min_token1_amount),
            BNum("deadline_block", deadline_block),
            ByStr20("recipient_address", recipient_address),
            Bool("is_transfer", is_transfer),
            String("avatar", avatar)
        ];
    },
    SwapTokensForExactTokens({
                                 token0_address,
                                 token1_address,
                                 max_token0_amount,
                                 token1_amount,
                                 deadline_block,
                                 recipient_address,
                                 is_transfer,
                                 avatar
                             }) {
        return [
            ByStr20("token0_address", token0_address),
            ByStr20("token1_address", token1_address),
            Uint128("max_token0_amount", max_token0_amount),
            Uint128("token1_amount", token1_amount),
            BNum("deadline_block", deadline_block),
            ByStr20("recipient_address", recipient_address),
            Bool("is_transfer", is_transfer),
            String("avatar", avatar)
        ];
    },
};

const SwapValue = require("../value/SwapValue");

const {zilAddress} = require("../share/mapTestAddresses");
const BigNumber = require("bignumber.js");
const TokenRepository = require("../repository/TokenRepository");
const TokenAccountValue = require("../value/TokenAccountValue");
const mapTokenToLogo = require("../share/mapTokenToLogo");
const BalanceRepository = require("../repository/BalanceRepository");

module.exports = class SwapService {
    constructor({
                    contractAddress,
                    host,
                    nodeAPI,
                    carbAddress,
                    tokenRepository = new TokenRepository({}),
                    balanceRepository = new BalanceRepository({}),
                }) {
        this._address = contractAddress;
        this._host = host;
        this._zilliqa = new Zilliqa(nodeAPI);
        this._fetcher = this._zilliqa.contracts.at(contractAddress);
        this._carbAddress = carbAddress;
        this._deadline_block = 10;
        this._tokenRepository = tokenRepository;
        this._balanceRepository = balanceRepository;
    }


    async getBlockNumber() {
        const {result} = await this._zilliqa.blockchain.getNumTxBlocks();
        return parseInt(result ? result : "100");
    }

    async getAddLiquidityCall({carbAmount, tokenAddress, blocks, maxTokenAmount, minCarbAmount}) {
        this._deadline_block = blocks ? blocks : this._deadline_block;
        const blockNum = await this.getBlockNumber();
        const deadlineBlock = blockNum + this._deadline_block;
        const params = transitions.AddLiquidity({
            carb_amount: carbAmount,
            token_address: tokenAddress,
            deadline_block: deadlineBlock,
            max_token_amount: maxTokenAmount,
            min_contribution_amount: minCarbAmount
        });
        return {
            params,
            tag: "AddLiquidity",
            zilAmount: tokenAddress === zilAddress ? maxTokenAmount : 0
        };
    }

    async getRemoveLiquidityCall({
                                     blocks,
                                     carbAmount,
                                     tokenAddress,
                                     minCarbAmount,
                                     minTokenAmount,
                                     contributionAmount
                                 }) {
        this._deadline_block = blocks ? blocks : this._deadline_block;
        const blockNum = await this.getBlockNumber();
        const deadlineBlock = blockNum + this._deadline_block;
        const params = transitions.RemoveLiquidity({
            token_address: tokenAddress,
            min_carb_amount: minCarbAmount,
            min_token_amount: minTokenAmount,
            contribution_amount: contributionAmount,
            deadline_block: deadlineBlock,
        });
        return {
            params,
            tag: "RemoveLiquidity",
            zilAmount: 0,
        };
    }

    async getSwapTokenToTokenCall({
                                      isFrom,
                                      fromToken,
                                      toToken,
                                      fromAmount,
                                      toAmount,
                                      avatar = "empty",
                                      isTransfer,
                                      recipientAddress,
                                      slippage,
                                      blocks,
                                  }) {
        let params;
        let zilAmount = 0;
        let tag;

        this._deadline_block = blocks ? blocks : this._deadline_block;
        const blockNum = await this.getBlockNumber();
        const deadlineBlock = blockNum + this._deadline_block;

        const min = new BigNumber(toAmount).multipliedBy(slippage);
        const minToTokenAmount = new BigNumber(toAmount).minus(min).toString();
        if (fromToken.address === this._carbAddress) {
            params = transitions.SwapExactCarbForTokens({
                amount: fromAmount,
                token_address: toToken.address,
                min_token_amount: minToTokenAmount,
                recipient_address: recipientAddress,
                deadline_block: deadlineBlock,
                is_transfer: isTransfer,
                avatar
            });
            tag = "SwapExactCarbForTokens";
        } else if (toToken.address === this._carbAddress) {
            params = transitions.SwapExactTokensForCarb({
                token_address: fromToken.address,
                min_carb_amount: minToTokenAmount,
                token_amount: fromToken,
                recipient_address: recipientAddress,
                deadline_block: deadlineBlock,
                is_transfer: isTransfer,
                avatar,
            });
            zilAmount = fromToken.address === zilAddress ? fromAmount : 0;
            tag = "SwapExactTokensForCarb";
        } else {
            if (isFrom) {
                params = transitions.SwapExactTokensForTokens({
                    token0_address: fromToken.address,
                    token1_address: toToken.address,
                    token0_amount: fromAmount,
                    min_token1_amount: minToTokenAmount,
                    recipient_address: recipientAddress,
                    deadline_block: deadlineBlock,
                    is_transfer: isTransfer,
                    avatar,
                });
                zilAmount = fromToken.address === zilAddress ? fromAmount : 0;
                tag = "SwapExactTokensForTokens";
            } else {
                const min = new BigNumber(fromAmount).multipliedBy(slippage);
                const maxFromTokenAmount = new BigNumber(fromAmount).plus(min).toString();
                params = transitions.SwapTokensForExactTokens({
                    token0_address: fromToken.address,
                    token1_address: toToken.address,
                    max_token0_amount: maxFromTokenAmount,
                    token1_amount: toAmount,
                    recipient_address: recipientAddress,
                    deadline_block: deadlineBlock,
                    is_transfer: isTransfer,
                    avatar
                });
                zilAmount = fromToken.address === zilAddress ? maxFromTokenAmount : 0;
                tag = "SwapExactTokensForTokens";
            }
        }


        return new SwapValue({
            tag,
            params,
            zilAmount
        });

    }

    async isTokenUnLocked({tokenAddress, account, amount}) {
        const fetcher = this._zilliqa.contracts.at(tokenAddress);
        const state = await fetcher.getSubState("allowances", [account.toLowerCase()]);
        if (state && state["allowances"][account.toLowerCase()][this._address.toLowerCase()]) {
            return BigInt(state["allowances"][account.toLowerCase()][this._address.toLowerCase()]) >= BigInt(amount ? amount : 0);
        }
        return false;
    }

    async getCarbBalance(account) {
        if (!account) {
            return "0.000";
        }
        const state = await this._fetcher.getSubState(fields.carb_balances.carb_balances, [account.toLowerCase()]);
        if (state) {
            return new BigNumber(state[fields.carb_balances.carb_balances][account.toLowerCase()]).shiftedBy(-8).toNumber().toFixed(8);
        }
        return "0.000";
    }

    async getGraphBalance(account) {
        if (!account) {
            return "0.000";
        }
        const state = await this._fetcher.getSubState(fields.graph_balances.graph_balances, [account.toLowerCase()]);
        if (state) {
            return new BigNumber(state[fields.graph_balances.graph_balances][account.toLowerCase()]).shiftedBy(-8).toNumber().toFixed(8);
        }
        return "0.000";
    }

    async getTokens(forAddress) {
        const SwapState = await this._fetcher.getSubState(fields.pools.pools);
        if (SwapState) {
            const pools = SwapState[fields.pools.pools];
            const tokens = await Promise.all(Object.keys(pools).map(async tokenAddress => await this._tokenRepository.findToken(tokenAddress)));
            const tokenValues = await Promise.all(tokens.map(async token => new TokenAccountValue({
                address: token.address,
                logo: mapTokenToLogo(token),
                priceUSD: await this._tokenRepository.getPriceOfTokenUSD(token.symbol),
                priceZIL: await this._tokenRepository.getPriceOfTokenInZil(token.symbol),
                symbol: token.symbol,
                name: token.name,
                balance: forAddress ? await this._balanceRepository.getBalanceOfToken(forAddress, token.address) : 0,
                decimals: token.decimals,
                priceCarb: this._tokenRepository.priceOfTokenInCarbWithPool(token, {
                    carbAmount: pools[token.address].arguments[0],
                    tokenAmount: pools[token.address].arguments[1]
                }, this._carbAddress)
            })));
            const carbToken = await this._tokenRepository.findToken(this._carbAddress);
            tokenValues.push(new TokenAccountValue({
                address: carbToken.address,
                symbol: carbToken.symbol,
                name: carbToken.name,
                balance: forAddress ? await this._balanceRepository.getBalanceOfToken(forAddress, carbToken.address) : 0,
                priceZIL: await this._tokenRepository.getPriceOfTokenInZil(carbToken.symbol),
                logo: mapTokenToLogo(carbToken),
                priceUSD: await this._tokenRepository.getPriceOfTokenUSD(carbToken.symbol),
                decimals: carbToken.decimals,
                priceCarb: 1,
            }));
            return tokenValues;
        }
        return [];
    }
}
