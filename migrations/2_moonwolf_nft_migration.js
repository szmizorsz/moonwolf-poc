const MoonwolfNft = artifacts.require("MoonwolfNft");

module.exports = async (deployer) => {
    await deployer.deploy(MoonwolfNft);
};