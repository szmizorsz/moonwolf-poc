# MoonwolfNFT contract

I used the Openzeppelin contracts libary with the following contracts to inherit from:
- ERC721
- ERC721Enumerable: for being able to list tokens for owners
- ERC721URIStorage: for being able to set different tokenURIs (metadat + media) for different tokens
- Ownable: there is an admin for the contract
- Pausable: all  functions can be paused by the admin

NFT airdrop related important functions:
- mint: mint new tokens with a given tokenURI, usage flow:
    - get the link of the media file or upload it to IPFS and get the cid (content identifier) - see unit test for details
    - create the relevant metadata json file with required (name, description, image = link of the media file) fields and optionals (shoud be defined) and upload it somewhere (could be IPFS) - see unit test for details
    - call the mint function with the owner and the link to the metadata json
- tokenUri: returns the URI of a token which is the link to the metadata json
- pause: pause the contract's write and transfer functions: mint, transfer, stc., only the owner can call it
- unpause
- enumeration related functions: e.g.: how to iterate over on tokens of a given address:
    - balanceOf(owner) + in a loop gettig each token by index: tokenOfOwnerByIndex(owner, i)

For keeping things simple I did not use the upgradable version of the contract libary.

## Unit tests

I created the following unit tests:
- Mint a new token with empty tokenURI
- Mint a new token with a new metadata file on IPFS with the following steps:
    - Create a metadata json file and upload to IPFS and get the cid (content identifier) of the uploaded file
    - Mint the new token to an owner with the cid of the uploaded metadate json
    - As a verification:
        - Get the tokenURI (cid) of the token from the contract
        - Download the json file from IPFS pointed by the cid
        - Compare the downloaded content with the uploaded content
        - The test also prints a URL to the console: where the file could be downloaded from with a public IPFS gateway
- Test the unavalability of the mint function when the contract is paused        

## Matic mumbai deployment

I deployed the contract to the Matic Mumbai testnet.
The deployment output with the contact addresses is available in the following file:
NFT_matic_mumbai_deployment

You can interact with the contract through truffle if matic is present in the truffle-config.js:

truffle console --network matic

let moonwolfNFT = await MoonwolfNFT.at('0x2FEB61e614b2f13c251C814446626f6c3e18e312')

You can mint a new token:

let tokenOwner = accounts[1]

let cid = "https://gateway.ipfs.io/ipfs/QmR98CHh6keViVwTbjUnzq8BkXb5B5XsngAAuj7dDjj3Fp"

let result = await moonwolfNFT.mint(tokenOwner, cid);

You can verify the result, for example there is 'Transfer' event in the logs:

result.logs[0].args

It can show you the minted token id:

let tokenId = result.logs[0].args.tokenId.toNumber()

With the tokenId you can check the tokenURI:

let tokenURI = await moonwolfNFT.tokenURI(tokenId);

# MoonwolfPoc contract

I used the Openzeppelin upgradable contracts libary with the following contracts to inherit from:
- ERC155
- Ownable: there is an admin for the contract
- Pausable: critical functions can be paused by the admin

There is only a few functions at the moment:
- mint: mint new tokens with a given amount (fractions for the generated token)
- setTokenUri: set a URI (ipfs cid in our case) for a token
- tokenUri: get the URI of a token
- pause: pause the contract's write functions: mint, setTokenUri

More about upgradable contracts:
[https://docs.openzeppelin.com/upgrades-plugins/1.x/](https://docs.openzeppelin.com/upgrades-plugins/1.x/)

## Unit tests

I created the following unit tests:
- Mint a new token
- Mint a new token with a new metadata file on IPFS with the following steps:
    - Mint the new token
    - Create a metadata json file and upload to IPFS
    - Register the uploaded file's contient identifier hash (a.k.a cid) as a tokenURI for the token
    - As a verification:
        - Get the tokenURI (cid) of the token from the contract
        - Download the json file from IPFS pointed by the cid
        - Compare the downloaded content with the uploaded content
        - The test also prints a URL to the console: where the file could be downloaded from with a public IPFS gateway
- Test the unavalability of the mint function when the contract is paused        

## Matic mumbai deployment

I deployed the contract to the Matic Mumbai testnet.
The deployment output with the contact addresses is available in the following file:
POC_matic_mumbai_deployment

You can interact with the contract through truffle if matic is present in the truffle-config.js:

truffle console --network matic

Because it is an upgradable contract you have to interact with the proxy contract (AdminUpgradeabilityProxy) instead of the real contract:

let moonwolfProxy = await MoonwolfPoc.at('0x5c7A3BDec2B9FE55462a9C7EafAe1CfAf6fE31A3')

You can mint a new token:

let result = await moonwolfProxy.mint(50);

You can verify the result, for example there is 'TransferSingle' event in the logs:

result.logs[0].args

It can show you the minted token id:

result.logs[0].args.id.toNumber()