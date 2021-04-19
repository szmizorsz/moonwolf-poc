// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract MoonwolfPoc is
    Initializable,
    ERC1155Upgradeable,
    PausableUpgradeable,
    OwnableUpgradeable
{
    using CountersUpgradeable for CountersUpgradeable.Counter;

    CountersUpgradeable.Counter private _ids;
    mapping(uint256 => string) private _tokenURIs;

    function initialize(string memory baseUri) public initializer {
        __Context_init_unchained();
        __ERC165_init_unchained();
        __Pausable_init_unchained();
        __ERC1155_init_unchained(baseUri);
        __Ownable_init_unchained();
    }

    function mint(uint256 amount) external {
        require(!paused(), "Not allowed while paused");
        _ids.increment();
        uint256 newItemId = _ids.current();
        _mint(msg.sender, newItemId, amount, "");
    }

    function setTokenURI(uint256 tokenId, string memory _tokenURI) external {
        require(!paused(), "Not allowed while paused");
        _tokenURIs[tokenId] = _tokenURI;
    }

    function tokenURI(uint256 tokenId) public view returns (string memory) {
        string memory _tokenURI = _tokenURIs[tokenId];

        // ERC1155 returns the same URI for *all* token types regardless of the tokenId.
        string memory base = uri(tokenId);

        // If there is no base URI, return the token URI.
        if (bytes(base).length == 0) {
            return _tokenURI;
        }
        // If both are set, concatenate the baseURI and tokenURI (via abi.encodePacked).
        return string(abi.encodePacked(base, _tokenURI));
    }

    function pause() public onlyOwner() {
        _pause();
    }
}
