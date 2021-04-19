const MoonwolfPoc = artifacts.require("MoonwolfPoc");
const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const truffleAssert = require("truffle-assertions");
const ipfsClient = require('ipfs-http-client')
const BufferList = require('bl');

contract("Moonwolf Poc", async function (accounts) {
    let contractInstance;
    let tokenOwner = accounts[0];
    const ipfs = ipfsClient({ host: "ipfs.infura.io", port: 5001, protocol: "https" })

    beforeEach(async function () {
        contractInstance = await deployProxy(MoonwolfPoc, [""]);
    });

    it("should mint a new token", async function () {
        let amount = 100;
        await contractInstance.mint(amount);
        let mintedTokenId = 1;
        let ownerBalance = await contractInstance.balanceOf(tokenOwner, mintedTokenId);
        assert(ownerBalance.toNumber() === amount);
    });

    it("should mint a new token and upload metadata to IPFS and set token URI for the token", async function () {
        // mint a new token
        let amount = 100;
        await contractInstance.mint(amount);
        // verify the minted amount
        let mintedTokenId = 1;
        let ownerBalance = await contractInstance.balanceOf(tokenOwner, mintedTokenId);
        assert(ownerBalance.toNumber() === amount);
        // upload a metadata json to IPFS
        const metaDataJson = {
            "name": "Red hat satellite robo",
            "description": "It can detect signals from the universe.",
            "image": "https://robohash.org/1",
            "properties": {
                "color": "red",
                "serial_number": {
                    "name": "Serial number",
                    "value": "1.2",
                    "display_value": "Version number 1.2"
                },
                "previous_versions": {
                    "name": "Previous versions",
                    "value": [1.0, 1.1, 1.2]
                }
            }
        }
        const metaDataFileOnIpfs = await ipfs.add(Buffer.from(JSON.stringify(metaDataJson)));
        // Register the cid as a tokenURI for the token
        let cid = metaDataFileOnIpfs.path;
        await contractInstance.setTokenURI(mintedTokenId, cid);
        // print a URL with an IPFS public gateway where the uploaded file could be downloaded from
        console.log("https://gateway.ipfs.io/ipfs/" + cid);
        // Verification: get the cid from the contract
        let cidFromChain = await contractInstance.tokenURI(mintedTokenId);
        // download the file from IPFS pointed by the cid
        let metadataFromIPFS;
        for await (const file of ipfs.get(cidFromChain)) {
            const content = new BufferList()
            for await (const chunk of file.content) {
                content.append(chunk)
            }
            metadataFromIPFS = content.toString();
        }
        // compare the content of the uploaded file with the downloaded one
        assert(JSON.stringify(metaDataJson) == metadataFromIPFS);
    });

    it("should not mint token while the contract is paused", async function () {
        await contractInstance.pause();
        let amount = 100;
        await truffleAssert.reverts(
            contractInstance.mint(amount),
            "Not allowed while paused");
    });

});

