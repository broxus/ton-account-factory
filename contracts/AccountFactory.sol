pragma solidity >= 0.6.0;
pragma AbiHeader expire;
pragma AbiHeader pubkey;

import "./Account.sol";


contract AccountFactory {
    uint256 static public owner;
    TvmCell static public account_code;

    function deploy(
        uint256 account_owner,
        uint128 account_value
    ) external returns(address account) {
        require(msg.pubkey() == owner, 101);
        tvm.accept();

        account = new Account{
            value: account_value,
            code: account_code,
            pubkey: tvm.pubkey(),
            varInit: {
                owner: account_owner
            }
        }();
    }
}
