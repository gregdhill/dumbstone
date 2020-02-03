import { Readable } from "stream";
interface Provider<Tx> {
    deploy(msg: Tx, callback: (err: Error, addr: Uint8Array) => void): void;
    call(msg: Tx, callback: (err: Error, exec: Uint8Array) => void): void;
    listen(signature: string, address: string, callback: (err: Error, event: any) => void): Readable;
    payload(data: string, address?: string): Tx;
    encode(name: string, inputs: string[], ...args: any[]): string;
    decode(data: Uint8Array, outputs: string[]): any;
}
function Call<Tx, Output>(client: Provider<Tx>, addr: string, data: string, callback: (exec: Uint8Array) => Output): Promise<Output> {
    const payload = client.payload(data, addr);
    return new Promise((resolve, reject) => {
        client.call(payload, (err, exec) => { err ? reject(err) : resolve(callback(exec)); });
    });
}
function Replace(bytecode: string, name: string, address: string): string {
    address = address + Array(40 - address.length + 1).join("0");
    const truncated = name.slice(0, 36);
    const label = "__" + truncated + Array(37 - truncated.length).join("_") + "__";
    while (bytecode.indexOf(label) >= 0)
        bytecode = bytecode.replace(label, address);
    return bytecode;
}
export module Agreement {
    export class Contract<Tx> {
        private client: Provider<Tx>;
        public address: string;
        constructor(client: Provider<Tx>, address: string) {
            this.client = client;
            this.address = address;
        }
        cancel() {
            const data = Encode(this.client).cancel();
            return Call<Tx, void>(this.client, this.address, data, (exec: Uint8Array) => {
                return Decode(this.client, exec).cancel();
            });
        }
        done() {
            const data = Encode(this.client).done();
            return Call<Tx, [boolean]>(this.client, this.address, data, (exec: Uint8Array) => {
                return Decode(this.client, exec).done();
            });
        }
    }
    export const Encode = <Tx>(client: Provider<Tx>) => { return {
        cancel: () => { return client.encode("EA8A1AF0", []); },
        done: () => { return client.encode("AE8421E1", []); }
    }; };
    export const Decode = <Tx>(client: Provider<Tx>, data: Uint8Array) => { return {
        cancel: (): void => { return; },
        done: (): [boolean] => { return client.decode(data, ["bool"]); }
    }; };
}
export module Deliverable {
    export function Deploy<Tx>(client: Provider<Tx>, _parent: string, _from: string): Promise<string> {
        let bytecode = "608060405234801561001057600080fd5b5060405161055c38038061055c8339818101604052604081101561003357600080fd5b810190808051906020019092919080519060200190929190505050336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555081600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555080600360006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550505061043b806101216000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c8063ae8421e114610046578063d99a8dc314610068578063ea8a1af014610123575b600080fd5b61004e61012d565b604051808215151515815260200191505060405180910390f35b6101216004803603602081101561007e57600080fd5b810190808035906020019064010000000081111561009b57600080fd5b8201836020820111156100ad57600080fd5b803590602001918460018302840111640100000000831117156100cf57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f82011690508083019250505050505050919291929050505061025e565b005b61012b6102cf565b005b60008060006004805460018160011615610100020316600290049050119050600073ffffffffffffffffffffffffffffffffffffffff16600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161461025657600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663ae8421e16040518163ffffffff1660e01b815260040160206040518083038186803b15801561020a57600080fd5b505afa15801561021e573d6000803e3d6000fd5b505050506040513d602081101561023457600080fd5b8101908080519060200190929190505050801561024e5750805b91505061025b565b809150505b90565b600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614156102cc5780600490805190602001906102ca929190610360565b505b50565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141561035e576000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16ff5b565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106103a157805160ff19168380011785556103cf565b828001600101855582156103cf579182015b828111156103ce5782518255916020019190600101906103b3565b5b5090506103dc91906103e0565b5090565b61040291905b808211156103fe5760008160009055506001016103e6565b5090565b9056fea264697066735822122076a2f612c0aa1ead52f990fbc7d4bb61c86ff29819774b5553ab89f2c7db160964736f6c63430006020033";
        const data = bytecode + client.encode("", ["address", "address"], _parent, _from);
        const payload = client.payload(data);
        return new Promise((resolve, reject) => {
            client.deploy(payload, (err, addr) => {
                if (err)
                    reject(err);
                else {
                    const address = Buffer.from(addr).toString("hex").toUpperCase();
                    resolve(address);
                }
            });
        });
    }
    export class Contract<Tx> {
        private client: Provider<Tx>;
        public address: string;
        constructor(client: Provider<Tx>, address: string) {
            this.client = client;
            this.address = address;
        }
        cancel() {
            const data = Encode(this.client).cancel();
            return Call<Tx, void>(this.client, this.address, data, (exec: Uint8Array) => {
                return Decode(this.client, exec).cancel();
            });
        }
        done() {
            const data = Encode(this.client).done();
            return Call<Tx, [boolean]>(this.client, this.address, data, (exec: Uint8Array) => {
                return Decode(this.client, exec).done();
            });
        }
        submit(_link: string) {
            const data = Encode(this.client).submit(_link);
            return Call<Tx, void>(this.client, this.address, data, (exec: Uint8Array) => {
                return Decode(this.client, exec).submit();
            });
        }
    }
    export const Encode = <Tx>(client: Provider<Tx>) => { return {
        cancel: () => { return client.encode("EA8A1AF0", []); },
        done: () => { return client.encode("AE8421E1", []); },
        submit: (_link: string) => { return client.encode("D99A8DC3", ["string"], _link); }
    }; };
    export const Decode = <Tx>(client: Provider<Tx>, data: Uint8Array) => { return {
        cancel: (): void => { return; },
        done: (): [boolean] => { return client.decode(data, ["bool"]); },
        submit: (): void => { return; }
    }; };
}
export module Expirable {
    export function Deploy<Tx>(client: Provider<Tx>, _parent: string, _addresses: string[], _expires: number): Promise<string> {
        let bytecode = "608060405234801561001057600080fd5b506040516104ae3803806104ae8339818101604052606081101561003357600080fd5b81019080805190602001909291908051604051939291908464010000000082111561005d57600080fd5b8382019150602082018581111561007357600080fd5b825186602082028301116401000000008211171561009057600080fd5b8083526020830192505050908051906020019060200280838360005b838110156100c75780820151818401526020810190506100ac565b5050505090500160405260200180519060200190929190505050336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555082600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508160029080519060200190610178929190610188565b5080600381905550505050610255565b828054828255906000526020600020908101928215610201579160200282015b828111156102005782518260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550916020019190600101906101a8565b5b50905061020e9190610212565b5090565b61025291905b8082111561024e57600081816101000a81549073ffffffffffffffffffffffffffffffffffffffff021916905550600101610218565b5090565b90565b61024a806102646000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063ae8421e11461003b578063ea8a1af01461005d575b600080fd5b610043610067565b604051808215151515815260200191505060405180910390f35b610065610183565b005b60008060035442109050600073ffffffffffffffffffffffffffffffffffffffff16600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161461017b57600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663ae8421e16040518163ffffffff1660e01b815260040160206040518083038186803b15801561012f57600080fd5b505afa158015610143573d6000803e3d6000fd5b505050506040513d602081101561015957600080fd5b810190808051906020019092919050505080156101735750805b915050610180565b809150505b90565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415610212576000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16ff5b56fea2646970667358221220b3688dfff25208efe52c63cfa68aa6561afb6a529f6fb7f08563083b6935cc9564736f6c63430006020033";
        const data = bytecode + client.encode("", ["address", "address[]", "uint256"], _parent, _addresses, _expires);
        const payload = client.payload(data);
        return new Promise((resolve, reject) => {
            client.deploy(payload, (err, addr) => {
                if (err)
                    reject(err);
                else {
                    const address = Buffer.from(addr).toString("hex").toUpperCase();
                    resolve(address);
                }
            });
        });
    }
    export class Contract<Tx> {
        private client: Provider<Tx>;
        public address: string;
        constructor(client: Provider<Tx>, address: string) {
            this.client = client;
            this.address = address;
        }
        cancel() {
            const data = Encode(this.client).cancel();
            return Call<Tx, void>(this.client, this.address, data, (exec: Uint8Array) => {
                return Decode(this.client, exec).cancel();
            });
        }
        done() {
            const data = Encode(this.client).done();
            return Call<Tx, [boolean]>(this.client, this.address, data, (exec: Uint8Array) => {
                return Decode(this.client, exec).done();
            });
        }
    }
    export const Encode = <Tx>(client: Provider<Tx>) => { return {
        cancel: () => { return client.encode("EA8A1AF0", []); },
        done: () => { return client.encode("AE8421E1", []); }
    }; };
    export const Decode = <Tx>(client: Provider<Tx>, data: Uint8Array) => { return {
        cancel: (): void => { return; },
        done: (): [boolean] => { return client.decode(data, ["bool"]); }
    }; };
}
export module Renewable {
    export function Deploy<Tx>(client: Provider<Tx>, _parent: string, _addresses: string[], _expires: number): Promise<string> {
        let bytecode = "608060405234801561001057600080fd5b506040516105473803806105478339818101604052606081101561003357600080fd5b81019080805190602001909291908051604051939291908464010000000082111561005d57600080fd5b8382019150602082018581111561007357600080fd5b825186602082028301116401000000008211171561009057600080fd5b8083526020830192505050908051906020019060200280838360005b838110156100c75780820151818401526020810190506100ac565b5050505090500160405260200180519060200190929190505050336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555082600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508160029080519060200190610178929190610188565b5080600381905550505050610255565b828054828255906000526020600020908101928215610201579160200282015b828111156102005782518260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550916020019190600101906101a8565b5b50905061020e9190610212565b5090565b61025291905b8082111561024e57600081816101000a81549073ffffffffffffffffffffffffffffffffffffffff021916905550600101610218565b5090565b90565b6102e3806102646000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80635baa750914610046578063ae8421e114610074578063ea8a1af014610096575b600080fd5b6100726004803603602081101561005c57600080fd5b81019080803590602001909291905050506100a0565b005b61007c610100565b604051808215151515815260200191505060405180910390f35b61009e61021c565b005b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614156100fd57806003819055505b50565b60008060035442109050600073ffffffffffffffffffffffffffffffffffffffff16600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161461021457600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663ae8421e16040518163ffffffff1660e01b815260040160206040518083038186803b1580156101c857600080fd5b505afa1580156101dc573d6000803e3d6000fd5b505050506040513d60208110156101f257600080fd5b8101908080519060200190929190505050801561020c5750805b915050610219565b809150505b90565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614156102ab576000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16ff5b56fea264697066735822122037ad0fb430b22ba12ab09b52d1825972e54a0878b9f011f32ad88f9cec04f9b164736f6c63430006020033";
        const data = bytecode + client.encode("", ["address", "address[]", "uint256"], _parent, _addresses, _expires);
        const payload = client.payload(data);
        return new Promise((resolve, reject) => {
            client.deploy(payload, (err, addr) => {
                if (err)
                    reject(err);
                else {
                    const address = Buffer.from(addr).toString("hex").toUpperCase();
                    resolve(address);
                }
            });
        });
    }
    export class Contract<Tx> {
        private client: Provider<Tx>;
        public address: string;
        constructor(client: Provider<Tx>, address: string) {
            this.client = client;
            this.address = address;
        }
        cancel() {
            const data = Encode(this.client).cancel();
            return Call<Tx, void>(this.client, this.address, data, (exec: Uint8Array) => {
                return Decode(this.client, exec).cancel();
            });
        }
        done() {
            const data = Encode(this.client).done();
            return Call<Tx, [boolean]>(this.client, this.address, data, (exec: Uint8Array) => {
                return Decode(this.client, exec).done();
            });
        }
        renew(expiry: number) {
            const data = Encode(this.client).renew(expiry);
            return Call<Tx, void>(this.client, this.address, data, (exec: Uint8Array) => {
                return Decode(this.client, exec).renew();
            });
        }
    }
    export const Encode = <Tx>(client: Provider<Tx>) => { return {
        cancel: () => { return client.encode("EA8A1AF0", []); },
        done: () => { return client.encode("AE8421E1", []); },
        renew: (expiry: number) => { return client.encode("5BAA7509", ["uint256"], expiry); }
    }; };
    export const Decode = <Tx>(client: Provider<Tx>, data: Uint8Array) => { return {
        cancel: (): void => { return; },
        done: (): [boolean] => { return client.decode(data, ["bool"]); },
        renew: (): void => { return; }
    }; };
}
export module Signable {
    export function Deploy<Tx>(client: Provider<Tx>, _parent: string, _addresses: string[]): Promise<string> {
        let bytecode = "608060405234801561001057600080fd5b506040516106a63803806106a68339818101604052604081101561003357600080fd5b81019080805190602001909291908051604051939291908464010000000082111561005d57600080fd5b8382019150602082018581111561007357600080fd5b825186602082028301116401000000008211171561009057600080fd5b8083526020830192505050908051906020019060200280838360005b838110156100c75780820151818401526020810190506100ac565b50505050905001604052505050336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555081600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550806002908051906020019061016b929190610248565b5060008090505b815181101561023857604051806040016040528060011515815260200160001515815250600360008484815181106101a657fe5b602002602001015173ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008201518160000160006101000a81548160ff02191690831515021790555060208201518160000160016101000a81548160ff0219169083151502179055509050508080600101915050610172565b5060006004819055505050610315565b8280548282559060005260206000209081019282156102c1579160200282015b828111156102c05782518260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555091602001919060010190610268565b5b5090506102ce91906102d2565b5090565b61031291905b8082111561030e57600081816101000a81549073ffffffffffffffffffffffffffffffffffffffff0219169055506001016102d8565b5090565b90565b610382806103246000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80632ca1512214610046578063ae8421e114610050578063ea8a1af014610072575b600080fd5b61004e61007c565b005b61005861019a565b604051808215151515815260200191505060405180910390f35b61007a6102bb565b005b600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160009054906101000a900460ff1680156101255750600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160019054906101000a900460ff16155b15610198576001600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160016101000a81548160ff0219169083151502179055506004600081548092919060010191905055505b565b600080600454600280549050149050600073ffffffffffffffffffffffffffffffffffffffff16600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16146102b357600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663ae8421e16040518163ffffffff1660e01b815260040160206040518083038186803b15801561026757600080fd5b505afa15801561027b573d6000803e3d6000fd5b505050506040513d602081101561029157600080fd5b810190808051906020019092919050505080156102ab5750805b9150506102b8565b809150505b90565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141561034a576000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16ff5b56fea26469706673582212208cfcfb96d22cbe11afd185b1be35748da25336b0b8c88006331397d8620edd4464736f6c63430006020033";
        const data = bytecode + client.encode("", ["address", "address[]"], _parent, _addresses);
        const payload = client.payload(data);
        return new Promise((resolve, reject) => {
            client.deploy(payload, (err, addr) => {
                if (err)
                    reject(err);
                else {
                    const address = Buffer.from(addr).toString("hex").toUpperCase();
                    resolve(address);
                }
            });
        });
    }
    export class Contract<Tx> {
        private client: Provider<Tx>;
        public address: string;
        constructor(client: Provider<Tx>, address: string) {
            this.client = client;
            this.address = address;
        }
        cancel() {
            const data = Encode(this.client).cancel();
            return Call<Tx, void>(this.client, this.address, data, (exec: Uint8Array) => {
                return Decode(this.client, exec).cancel();
            });
        }
        done() {
            const data = Encode(this.client).done();
            return Call<Tx, [boolean]>(this.client, this.address, data, (exec: Uint8Array) => {
                return Decode(this.client, exec).done();
            });
        }
        sign() {
            const data = Encode(this.client).sign();
            return Call<Tx, void>(this.client, this.address, data, (exec: Uint8Array) => {
                return Decode(this.client, exec).sign();
            });
        }
    }
    export const Encode = <Tx>(client: Provider<Tx>) => { return {
        cancel: () => { return client.encode("EA8A1AF0", []); },
        done: () => { return client.encode("AE8421E1", []); },
        sign: () => { return client.encode("2CA15122", []); }
    }; };
    export const Decode = <Tx>(client: Provider<Tx>, data: Uint8Array) => { return {
        cancel: (): void => { return; },
        done: (): [boolean] => { return client.decode(data, ["bool"]); },
        sign: (): void => { return; }
    }; };
}