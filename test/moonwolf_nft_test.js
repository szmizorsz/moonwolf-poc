const MoonwolfNft = artifacts.require("MoonwolfNft");
const truffleAssert = require("truffle-assertions");
const ipfsClient = require('ipfs-http-client')
const BufferList = require('bl');

contract("Moonwolf Nft", async function (accounts) {
    let contractInstance;
    let tokenOwner = accounts[0];
    const ipfs = ipfsClient({ host: "ipfs.infura.io", port: 5001, protocol: "https" })

    beforeEach(async function () {
        contractInstance = await MoonwolfNft.new();
    });

    it("should mint a new token with empty URI", async function () {
        let tokenURI = "";
        await contractInstance.mint(tokenOwner, tokenURI);
        let mintedTokenId = 1;
        let ownerBalance = await contractInstance.balanceOf(tokenOwner);
        assert(ownerBalance.toNumber() === 1);
        let ownerOfMintedToken = await contractInstance.ownerOf(mintedTokenId);
        assert(tokenOwner === ownerOfMintedToken);
    });

    it("should upload metadata to IPFS and mint a new token with the cid as token URI for the token", async function () {
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
        // Get the content identifier of the uploadedfile
        let cid = metaDataFileOnIpfs.path;
        // print a URL with an IPFS public gateway where the uploaded file could be downloaded from
        console.log("https://gateway.ipfs.io/ipfs/" + cid);
        // mint a new token with the cid as tokenURI
        await contractInstance.mint(tokenOwner, cid);
        // verify the minted token
        let mintedTokenId = 1;
        let ownerBalance = await contractInstance.balanceOf(tokenOwner);
        assert(ownerBalance.toNumber() === 1);
        let ownerOfMintedToken = await contractInstance.ownerOf(mintedTokenId);
        assert(tokenOwner === ownerOfMintedToken);
        // Verification of the uploaded file: get the cid from the contract
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
        await truffleAssert.reverts(
            contractInstance.mint(tokenOwner, ""),
            "Pausable: paused");
    });

});

