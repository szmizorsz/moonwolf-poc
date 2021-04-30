const Krill = artifacts.require("Krill");
const MasterChef = artifacts.require("MasterChef");

const devaddr = "0x0f5b2FD00d4A2Bc6F0Fb01d375Bb089d2cA8631d";
const feeAddress = "0x21659BB268D4A10559561F4CC9024b00F90B8760";
const krillPerBlock = 1;
const startBlock = 0;

module.exports = async (deployer) => {
    await deployer.deploy(Krill);
    await deployer.deploy(MasterChef, Krill.address, devaddr, feeAddress, krillPerBlock, startBlock);
};