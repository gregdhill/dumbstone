pragma solidity >=0.0.0;

abstract contract Agreement {
    address payable owner;
    address parent;
    address[] addresses;
    function done() external virtual view returns (bool);
    function cancel() external virtual {
        if (msg.sender == owner) selfdestruct(owner);
    }
}

contract Expirable is Agreement {
    uint expires;

    constructor(address _parent, address[] memory _addresses, uint _expires) public {
        owner = msg.sender;
        parent = _parent;
        addresses = _addresses;
        expires = _expires;
    }

    function done() external override view returns (bool) {
        bool next = now < expires;
        if (parent != address(0x0)) 
            return Agreement(parent).done() && next;
        return next;
    }
}

contract Renewable is Agreement {
    uint expires;

    constructor(address _parent, address[] memory _addresses, uint _expires) public {
        owner = msg.sender;
        parent = _parent;
        addresses = _addresses;
        expires = _expires;
    }

    function renew(uint expiry) public {
        if (msg.sender == owner) {
            expires = expiry;
        }
    }

    function done() external override view returns (bool) {
        bool next = now < expires;
        if (parent != address(0x0)) 
            return Agreement(parent).done() && next;
        return next;
    }
}

contract Deliverable is Agreement {
    address from;
    string link;

    constructor(address _parent, address _from) public {
        owner = msg.sender;
        parent = _parent;
        from = _from;
    }

    function submit(string memory _link) public {
        if (msg.sender == from) {
            link = _link;
        }
    }

    function done() external override view returns (bool) {
        bool next = bytes(link).length > 0;
        if (parent != address(0x0)) 
            return Agreement(parent).done() && next;
        return next;
    }
}

contract Signable is Agreement {
    struct entry {
        bool exists;
        bool signed;
    }
    mapping (address => entry) parties;
    uint signatures;

    constructor(address _parent, address[] memory _addresses) public {
        owner = msg.sender;
        parent = _parent;
        addresses = _addresses;
        for (uint i = 0; i < _addresses.length; i++) {
            parties[_addresses[i]] = entry(true, false);
        }
        signatures = 0;
    }

    function sign() external {
        if (parties[msg.sender].exists && !parties[msg.sender].signed) {
            parties[msg.sender].signed = true;
            signatures++;
        }
    }

    function done() external override view returns (bool) {
        bool next = addresses.length == signatures;
        if (parent != address(0x0))
            return Agreement(parent).done() && next;
        return next;
    }
}