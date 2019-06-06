pragma solidity ^0.5.0;


/**
* [In progress] modifier of onlyProductionOwner 
*/
contract ProductionOwnable {
    address private _productionOwner;  // [To do]：Change assigning value next time from msg.sender to another value

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev The ProductionOwnable constructor sets the original `productionOwner` of the contract to the sender
     * account.
     */
    constructor () internal {
        _productionOwner = msg.sender;
        emit OwnershipTransferred(address(0), _productionOwner);
    }

    /**
     * @return the address of the Production Owner.
     */
    function productionOwner() public view returns (address) {
        return _productionOwner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyProductionOwner() {
        require(isProductionOwner());
        _;
    }

    /**
     * @return true if `msg.sender` is the owner of the contract.
     */
    function isProductionOwner() public view returns (bool) {
        return msg.sender == _productionOwner;
    }








    /**
     * @dev Allows the current owner to relinquish control of the contract.
     * @notice Renouncing to ownership will leave the contract without an owner.
     * It will not be possible to call the functions with the `onlyOwner`
     * modifier anymore.
     */
    function renounceOwnership() public onlyProductionOwner {
        emit OwnershipTransferred(_productionOwner, address(0));
        _productionOwner = address(0);
    }

    /**
     * @dev Allows the current owner to transfer control of the contract to a newOwner.
     * @param newOwner The address to transfer ownership to.
     */
    function transferOwnership(address newOwner) public onlyProductionOwner {
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers control of the contract to a newOwner.
     * @param newOwner The address to transfer ownership to.
     */
    function _transferOwnership(address newOwner) internal {
        require(newOwner != address(0));
        emit OwnershipTransferred(_productionOwner, newOwner);
        _productionOwner = newOwner;
    }
}
