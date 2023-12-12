import { Keyring } from '@polkadot/keyring';
import { TypeRegistry } from '@polkadot/types';
import { cryptoWaitReady } from '@polkadot/util-crypto';
export class Extension {
    authRequests = {};
    accounts = [];
    txRequests = {};
    keyring;
    allowedOrigins = {};
    reset = () => {
        this.authRequests = {};
        this.accounts = [];
        this.txRequests = {};
        this.keyring = undefined;
        this.allowedOrigins = {};
    };
    init = async (accounts, allowedOrigin) => {
        this.reset();
        this.accounts = accounts;
        await cryptoWaitReady();
        this.keyring = new Keyring({ type: 'sr25519' });
        accounts.forEach(({ mnemonic }) => {
            // we only add to the keyring the accounts with a known mnemonic
            !!mnemonic && this.keyring?.addFromUri(mnemonic);
        });
        const accountAddresses = accounts.map(({ address }) => address);
        // if passed along all the accounts will be allowed for this origin
        if (allowedOrigin) {
            this.allowedOrigins[allowedOrigin] = accountAddresses;
        }
    };
    getInjectedEnable = () => {
        return {
            'polkadot-js': {
                enable: (origin) => {
                    const resolvedObject = (selectedAccounts) => ({
                        accounts: {
                            get: () => selectedAccounts,
                            subscribe: (cb) => cb(selectedAccounts)
                        },
                        signer: {
                            signPayload: (payload) => {
                                return new Promise((resolve, reject) => {
                                    const id = Date.now();
                                    const res = () => {
                                        const registry = new TypeRegistry();
                                        registry.setSignedExtensions(payload.signedExtensions);
                                        const pair = this.keyring?.getPair(payload.address);
                                        if (!pair) {
                                            console.error(`Pair not found for encoded address ${payload.address}, with keyring:`, this.keyring?.toJson);
                                            return;
                                        }
                                        const signature = registry
                                            .createType('ExtrinsicPayload', payload, {
                                            version: payload.version
                                        })
                                            .sign(pair);
                                        resolve({ id, signature: signature.signature });
                                    };
                                    const rej = (reason) => reject(new Error(reason));
                                    this.txRequests[id] = { id, payload, resolve: res, reject: rej };
                                });
                            }
                        }
                    });
                    // this origin has already allowed some accounts
                    if (this.allowedOrigins[origin]) {
                        // return the list of accounts
                        const res = resolvedObject(this.accounts.filter(({ address }) => this.allowedOrigins[origin].includes(address)));
                        return Promise.resolve(res);
                    }
                    return new Promise((resolve, reject) => {
                        const timestamp = Date.now();
                        const res = (accountAddresses) => {
                            const selectedAccounts = this.accounts.filter(({ address }) => accountAddresses.includes(address));
                            // store the allowed accounts for this orgin
                            this.allowedOrigins[origin] = accountAddresses;
                            const res = resolvedObject(selectedAccounts);
                            resolve(res);
                        };
                        const rej = (reason) => reject(new Error(reason));
                        this.authRequests[timestamp] = { id: timestamp, origin, resolve: res, reject: rej };
                    });
                },
                version: '1'
            }
        };
    };
    getAuthRequests = () => {
        return this.authRequests;
    };
    enableAuth = (id, accountAddresses) => {
        this.authRequests[id].resolve(accountAddresses);
    };
    rejectAuth = (id, reason) => {
        this.authRequests[id].reject(reason);
    };
    getTxRequests = () => {
        return this.txRequests;
    };
    approveTx = (id) => {
        this.txRequests[id].resolve();
    };
    rejectTx = (id, reason) => {
        this.txRequests[id].reject(reason);
    };
}
