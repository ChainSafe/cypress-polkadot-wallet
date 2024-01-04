/// <reference types="cypress" />
import { AuthRequests, TxRequests } from './wallet';
import { InjectedAccountWitMnemonic } from './types';
declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Initialize the Polkadot wallet. If an authorizedDappName is passed there is no need to authorize the first connection for Dapps using this name.
             * @param {InjectedAccount[]} accounts - Accounts to load into the wallet.
             * @param {string | undefined} authorizedDappName - Dapp name to automatically share accounts with, without needing to authorize
             * @param {string | undefined} walletName - Sets the name of the injected wallet (default 'polkadot-js')
             * @example cy.initWallet([{ address: '7NPoMQbiA6trJKkjB35uk96MeJD4PGWkLQLH7k7hXEkZpiba', name: 'Alice', type: 'sr25519'}], 'My-Dapp', 'My-wallet-extension')
             */
            initWallet: (accounts: InjectedAccountWitMnemonic[], authorizedDappName?: string, walletName?: string) => Chainable<AUTWindow>;
            /**
             * Read the authentication request queue
             * @example cy.getAuthRequests().then((authQueue) => { cy.wrap(Object.values(authQueue).length).should("eq", 1) })
             */
            getAuthRequests: () => Chainable<AuthRequests>;
            /**
             * Approve a specific authentication request for the Dapp to get access the wallet accounts
             * @param {number} id - the id of the request to authorize. This id is part of the getAuthRequests object response.
             * @param {string[]} accountAddresses - the account addresses to share with the applications. These addresses must be part of the ones shared in the `initWallet`
             * @example cy.approveAuth(1694443839903, ["7NPoMQbiA6trJKkjB35uk96MeJD4PGWkLQLH7k7hXEkZpiba"])
             */
            approveAuth: (id: number, accountAddresses: string[]) => void;
            /**
             * Reject a specific authentication request. The Dapp will receive 0 connected wallet as a result.
             * @param {number} id - the id of the request to reject. This id is part of the getAuthRequests object response.
             * @param {reason} reason - the reason for the rejection
             * @example cy.rejectAuth(1694443839903, "Cancelled")
             */
            rejectAuth: (id: number, reason: string) => void;
            /**
             * Read the wallet transaction request queue
             * @example cy.getTxRequests().then((txQueue) => { cy.wrap(Object.values(txQueue).length).should("eq", 1) })
             */
            getTxRequests: () => Chainable<TxRequests>;
            /**
             * Approve a specific transaction
             * @param {number} id - the id of the request to approve. This id is part of the getTxRequests object response.
             * @example cy.approveTx(1694443839903)
             */
            approveTx: (id: number) => void;
            /**
             * Reject a specific transaction
             * @param {number} id - the id of the tx request to reject. This id is part of the getTxRequests object response.
             * @param {reason} reason - the reason for the rejection
             * @example cy.rejectTx(1694443839903, "Cancelled")
             */
            rejectTx: (id: number, reason: string) => void;
        }
    }
}
