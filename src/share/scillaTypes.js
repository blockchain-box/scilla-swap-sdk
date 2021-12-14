const base16Address = (address) => {
    try {
        return fromBech32Address(address).toLowerCase();
    } catch (e) {
        return address ? address.toLowerCase() : address;
    }
};


module.exports = {
    Uint32: (name, value = BigInt(0)) => ({
        vname: name.trim(),
        type: "Uint32",
        value: value.toString().trim()
    }),
    Uint128: (name, value = BigInt(0)) => ({
        vname: name.trim(),
        type: "Uint128",
        value: value.toString().trim()
    }),
    Uint256: (name, value = BigInt(0)) => ({
        vname: name.trim(),
        type: "Uint128",
        value: value.toString().trim()
    }),
    ByStr20: (name, value = "") => ({
        vname: name.trim(),
        type: "ByStr20",
        value: base16Address(value.toString().trim())
    }),
    BNum: (name, value = "") => ({
        vname: name,
        type: "BNum",
        value: value.toString().trim(),
    }),
    ListByStr20: (name, values = []) => ({
        vname: name.trim(),
        type: "List ByStr20",
        value: values.map(value => base16Address(value.toString().trim()))
    }),
    String: (name, value = "") => ({
        vname: name.trim(),
        type: "String",
        value: value.toString().trim()
    }),
    Bool: (name, value = false) => ({
        vaname: name,
        type: "Bool",
        value: {constructor: value === true ? "True" : "False", argtypes: [], arguments: []}
    }),
    Claim: (contractAddress, epoche, address, amount, proof) => ({
        vname: "claim",
        type: contractAddress.toLowerCase() + ".Claim",
        value: {
            constructor: contractAddress.toLowerCase() + ".Claim",
            argtypes: [],
            arguments: [
                epoche.toString(),
                {
                    constructor: contractAddress.toLowerCase() + ".DistributionLeaf",
                    argtypes: [],
                    arguments: [
                        address.toString(),
                        amount.toString()
                    ]
                },
                proof
            ]
        }
    }),
};
