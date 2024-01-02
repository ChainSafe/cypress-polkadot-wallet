/// <reference types="cypress" />
import { AuthRequests, TxRequests } from './extension';
import { InjectedAccountWitMnemonic } from './types';
declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Initialized the Polkadot extension. If an origin is passed there is no need to authorize the first connection for Dapps of this origin
             * @param {InjectedAccount[]} accounts - Accounts to load into the extension.
             * @param {string | undefined} origin - Dapp name to automatically share accounts with, without needing to authorize
             * @example cy.initExtension([{ address: '7NPoMQbiA6trJKkjB35uk96MeJD4PGWkLQLH7k7hXEkZpiba', name: 'Alice', type: 'sr25519'}], 'Multix')
             */
            initExtension: (accounts: InjectedAccountWitMnemonic[], origin?: string) => Chainable<AUTWindow>;
            /**
             * Read the authentication request queue
             * @example cy.getAuthRequests().then((authQueue) => { cy.wrap(Object.values(authQueue).length).should("eq", 1) })
             */
            getAuthRequests: () => Chainable<AuthRequests>;
            /**
             * Authorize a specific request
             * @param {number} id - the id of the request to authorize. This id is part of the getAuthRequests object response.
             * @param {string[]} accountAddresses - the account addresses to share with the applications. These addresses must be part of the ones shared in the `initExtension`
             * @example cy.enableAuth(1694443839903, ["7NPoMQbiA6trJKkjB35uk96MeJD4PGWkLQLH7k7hXEkZpiba"])
             */
            enableAuth: (id: number, accountAddresses: string[]) => void;
            /**
             * Reject a specific authentication request
             * @param {number} id - the id of the request to reject. This id is part of the getAuthRequests object response.
             * @param {reason} reason - the reason for the rejection
             * @example cy.rejectAuth(1694443839903, "Cancelled")
             */
            rejectAuth: (id: number, reason: string) => void;
            /**
             * Read the tx request queue
             * @example cy.getTxRequests().then((txQueue) => { cy.wrap(Object.values(txQueue).length).should("eq", 1) })
             */
            getTxRequests: () => Chainable<TxRequests>;
            /**
             * Authorize a specific transaction
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
