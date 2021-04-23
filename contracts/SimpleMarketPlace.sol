// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/IERC1155Upgradeable.sol";

contract SimpleMarketPlace is
    Initializable,
    PausableUpgradeable,
    OwnableUpgradeable
{
    using CountersUpgradeable for CountersUpgradeable.Counter;

    struct Market {
        uint256 id;
        address tokenContract;
        uint256 tokenId;
        uint256 totalSupply;
    }

    struct Ask {
        uint256 id;
        uint256 marketId;
        uint256 amount;
        uint256 price;
        address asker;
        uint256 filled;
    }

    CountersUpgradeable.Counter private _marketIds;
    CountersUpgradeable.Counter private _askIds;
    Market[] markets;
    mapping(uint256 => Market) marketsById;
    mapping(uint256 => Ask[]) asksByMarketId;
    mapping(uint256 => Ask) asksById;

    function initialize() public initializer {
        __Pausable_init_unchained();
        __Ownable_init_unchained();
    }

    /**
     * @dev register an ERC1155 token as a market so it is tradable
     */
    function registerMarket(
        address tokenContract,
        uint256 tokenId,
        uint256 totalSupply
    ) external onlyOwner() {
        _marketIds.increment();
        uint256 newMarketId = _marketIds.current();
        Market memory market =
            Market(newMarketId, tokenContract, tokenId, totalSupply);
        markets.push(market);
        marketsById[newMarketId] = market;
    }

    /**
     * @dev returns all registered markets - can be rendered on the UI market list page
     */
    function getMarkets() external view returns (Market[] memory) {
        return markets;
    }

    /**
     * @dev creates an Ask for a market
     * the price is given in Matic
     *
     * Requirements:
     * - contract should not be paused
     * - market has to exist
     * - the sender has to own more than the amount given plus the amounts reserved in other asks
     */
    function createAskInMatic(
        uint256 marketId,
        uint256 amount,
        uint256 price
    ) external {
        require(!paused(), "Not allowed while paused");
        require(
            marketsById[marketId].tokenContract != address(0),
            "this market does not exist"
        );
        IERC1155Upgradeable erc1155Contract =
            IERC1155Upgradeable(marketsById[marketId].tokenContract);
        uint256 senderBalance =
            erc1155Contract.balanceOf(
                msg.sender,
                marketsById[marketId].tokenId
            );
        uint256 amountInReserve;
        for (uint256 i = 0; i < asksByMarketId[marketId].length; i++) {
            if (asksByMarketId[marketId][i].asker == msg.sender) {
                amountInReserve += asksByMarketId[marketId][i].amount;
            }
        }
        require(
            senderBalance >= amount + amountInReserve,
            "amount is bigger than the balance"
        );
        _askIds.increment();
        uint256 newAskId = _askIds.current();
        Ask memory ask = Ask(newAskId, marketId, amount, price, msg.sender, 0);
        asksByMarketId[marketId].push(ask);
        asksById[newAskId] = ask;
    }

    /**
     * @dev matches an existing ask:
     * - purchases the given amount
     * - with the Matic sent to the functions as value (msg.value)
     *
     * Requirements:
     * - contract should not be paused
     * - Ask has to exist
     * - market has to exist
     * - the Matic sent to the function has to match: price * amount in the given Ask
     */
    function matchAskInMatic(
        uint256 askId,
        uint256 marketId,
        uint256 amount
    ) external payable {
        require(!paused(), "Not allowed while paused");
        require(
            marketsById[marketId].tokenContract != address(0),
            "this market does not exist"
        );
        require(asksById[askId].id != 0, "this ask does not exist");

        //to be finished
    }

    /**
     * @dev owner can pause the contract
     */
    function pause() public onlyOwner() {
        _pause();
    }
}
