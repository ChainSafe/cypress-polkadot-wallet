import { Injected, InjectedAccounts } from '@polkadot/extension-inject/types';
import { Keyring } from '@polkadot/keyring';
import { SignerPayloadJSON, SignerResult } from '@polkadot/types/types';
import { InjectedAccountWitMnemonic } from './types';
export interface AuthRequest {
    id: number;
    origin: string;
    resolve: (accountAddresses: string[]) => void;
    reject: (reason: string) => void;
}
export interface TxRequest {
    id: number;
    payload: SignerPayloadJSON;
    resolve: () => void;
    reject: (reason: string) => void;
}
export type TxRequests = Record<number, TxRequest>;
export type AuthRequests = Record<number, AuthRequest>;
export type EnableRequest = number;
export declare class Wallet {
    authRequests: AuthRequests;
    accounts: InjectedAccountWitMnemonic[];
    txRequests: TxRequests;
    keyring: Keyring | undefined;
    allowedOrigins: Record<string, string[]>;
    reset: () => void;
    init: (accounts: InjectedAccountWitMnemonic[], allowedOrigin?: string) => Promise<void>;
    getInjectedEnable: (extensionName: string) => {
        [x: string]: {
            enable: (origin: string) => Promise<{
                accounts: InjectedAccounts;
                signer: {
                    signPayload: (payload: SignerPayloadJSON) => Promise<SignerResult>;
                };
            }> | Promise<Injected>;
            version: string;
        };
    };
    getAuthRequests: () => AuthRequests;
    approveAuth: (id: number, accountAddresses: string[]) => void;
    rejectAuth: (id: number, reason: string) => void;
    getTxRequests: () => TxRequests;
    approveTx: (id: number) => void;
    rejectTx: (id: number, reason: string) => void;
}
