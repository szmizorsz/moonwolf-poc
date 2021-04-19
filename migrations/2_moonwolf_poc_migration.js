const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const MoonwolfPoc = artifacts.require('MoonwolfPoc');

module.exports = async function (deployer) {
    const instance = await deployProxy(MoonwolfPoc, [""], { deployer });
};