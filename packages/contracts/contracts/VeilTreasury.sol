// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract VEILTreasury is Ownable, ReentrancyGuard {
    IERC20 public immutable veilToken;

    uint256 public constant TIMELOCK_DELAY = 48 hours;

    struct WithdrawalRequest {
        address recipient;
        uint256 amount;
        uint256 readyAt;
        bool executed;
        bool cancelled;
    }

    mapping(uint256 => WithdrawalRequest) public withdrawalRequests;
    uint256 public nextRequestId;

    event WithdrawalProposed(uint256 indexed requestId, address indexed recipient, uint256 amount, uint256 readyAt);
    event WithdrawalExecuted(uint256 indexed requestId, address indexed recipient, uint256 amount);
    event WithdrawalCancelled(uint256 indexed requestId);
    event TokensReceived(address indexed from, uint256 amount);

    constructor(address initialOwner, address _veilToken) Ownable(initialOwner) {
        veilToken = IERC20(_veilToken);
    }

    /// @notice Propose a withdrawal; it becomes executable after TIMELOCK_DELAY.
    function proposeWithdrawal(address recipient, uint256 amount) external onlyOwner returns (uint256 requestId) {
        require(recipient != address(0), "VeilTreasury: zero recipient");
        require(amount > 0, "VeilTreasury: zero amount");
        require(veilToken.balanceOf(address(this)) >= amount, "VeilTreasury: insufficient balance");

        requestId = nextRequestId++;
        uint256 readyAt = block.timestamp + TIMELOCK_DELAY;

        withdrawalRequests[requestId] = WithdrawalRequest({
            recipient: recipient,
            amount: amount,
            readyAt: readyAt,
            executed: false,
            cancelled: false
        });

        emit WithdrawalProposed(requestId, recipient, amount, readyAt);
    }

    /// @notice Execute a previously proposed withdrawal once the timelock has passed.
    function executeWithdrawal(uint256 requestId) external onlyOwner nonReentrant {
        WithdrawalRequest storage req = withdrawalRequests[requestId];
        require(!req.executed, "VeilTreasury: already executed");
        require(!req.cancelled, "VeilTreasury: cancelled");
        require(block.timestamp >= req.readyAt, "VeilTreasury: timelock active");

        req.executed = true;
        require(veilToken.transfer(req.recipient, req.amount), "VeilTreasury: transfer failed");

        emit WithdrawalExecuted(requestId, req.recipient, req.amount);
    }

    /// @notice Cancel a pending withdrawal before it executes.
    function cancelWithdrawal(uint256 requestId) external onlyOwner {
        WithdrawalRequest storage req = withdrawalRequests[requestId];
        require(!req.executed, "VeilTreasury: already executed");
        require(!req.cancelled, "VeilTreasury: already cancelled");

        req.cancelled = true;
        emit WithdrawalCancelled(requestId);
    }

    /// @notice View current VEIL balance held by the treasury.
    function balance() external view returns (uint256) {
        return veilToken.balanceOf(address(this));
    }
}
