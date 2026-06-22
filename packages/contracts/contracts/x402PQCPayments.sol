// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";

contract x402PQCPayments is Ownable {
    struct Payment {
        address payer;
        address recipient;
        uint256 amount;
        uint256 timestamp;
        bytes32 sigHash;
        bytes32 pubKeyHash;
    }

    mapping(bytes32 => Payment) private _payments;

    event PaymentRecorded(
        address indexed payer,
        address indexed recipient,
        uint256 amount,
        bytes32 indexed sigHash
    );

    constructor(address initialOwner) Ownable(initialOwner) {}

    function registerPayment(
        address payer,
        address recipient,
        uint256 amount,
        bytes32 sigHash,
        bytes32 pubKeyHash
    ) external onlyOwner {
        require(payer != address(0), "x402PQCPayments: zero payer");
        require(recipient != address(0), "x402PQCPayments: zero recipient");
        require(amount > 0, "x402PQCPayments: zero amount");
        require(_payments[sigHash].timestamp == 0, "x402PQCPayments: duplicate sigHash");

        _payments[sigHash] = Payment({
            payer: payer,
            recipient: recipient,
            amount: amount,
            timestamp: block.timestamp,
            sigHash: sigHash,
            pubKeyHash: pubKeyHash
        });

        emit PaymentRecorded(payer, recipient, amount, sigHash);
    }

    function verifyPayment(bytes32 sigHash) external view returns (bool) {
        return _payments[sigHash].timestamp != 0;
    }

    function getPayment(bytes32 sigHash) external view returns (Payment memory) {
        return _payments[sigHash];
    }

    function renounceOwnership() public override onlyOwner {
        revert("disabled");
    }
}
