import { AuthRequests, Wallet, TxRequests } from './wallet'
import { InjectedAccountWitMnemonic } from './types'

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Initialized the Polkadot wallet. If an origin is passed there is no need to authorize the first connection for Dapps of this origin
       * @param {InjectedAccount[]} accounts - Accounts to load into the wallet.
       * @param {string | undefined} origin - Dapp name to automatically share accounts with, without needing to authorize
       * @example cy.initWallet([{ address: '7NPoMQbiA6trJKkjB35uk96MeJD4PGWkLQLH7k7hXEkZpiba', name: 'Alice', type: 'sr25519'}], 'Multix')
       */
      initWallet: (accounts: InjectedAccountWitMnemonic[], origin?: string) => Chainable<AUTWindow>

      /**
       * Read the authentication request queue
       * @example cy.getAuthRequests().then((authQueue) => { cy.wrap(Object.values(authQueue).length).should("eq", 1) })
       */
      getAuthRequests: () => Chainable<AuthRequests>

      /**
       * Authorize a specific request
       * @param {number} id - the id of the request to authorize. This id is part of the getAuthRequests object response.
       * @param {string[]} accountAddresses - the account addresses to share with the applications. These addresses must be part of the ones shared in the `initWallet`
       * @example cy.approveAuth(1694443839903, ["7NPoMQbiA6trJKkjB35uk96MeJD4PGWkLQLH7k7hXEkZpiba"])
       */
      approveAuth: (id: number, accountAddresses: string[]) => void

      /**
       * Reject a specific authentication request
       * @param {number} id - the id of the request to reject. This id is part of the getAuthRequests object response.
       * @param {reason} reason - the reason for the rejection
       * @example cy.rejectAuth(1694443839903, "Cancelled")
       */
      rejectAuth: (id: number, reason: string) => void

      /**
       * Read the tx request queue
       * @example cy.getTxRequests().then((txQueue) => { cy.wrap(Object.values(txQueue).length).should("eq", 1) })
       */
      getTxRequests: () => Chainable<TxRequests>

      /**
       * Authorize a specific transaction
       * @param {number} id - the id of the request to approve. This id is part of the getTxRequests object response.
       * @example cy.approveTx(1694443839903)
       */
      approveTx: (id: number) => void

      /**
       * Reject a specific transaction
       * @param {number} id - the id of the tx request to reject. This id is part of the getTxRequests object response.
       * @param {reason} reason - the reason for the rejection
       * @example cy.rejectTx(1694443839903, "Cancelled")
       */
      rejectTx: (id: number, reason: string) => void
    }
  }
}

const wallet = new Wallet()

const injectWallet = (win: Cypress.AUTWindow, wallet: Wallet) => {
  Object.defineProperty(win, 'injectedWeb3', {
    get: () => wallet.getInjectedEnable(),
    set: () => {}
  })
}

Cypress.Commands.add('initWallet', (accounts: InjectedAccountWitMnemonic[], origin?: string) => {
  cy.log('Initializing Wallet')
  cy.wrap(wallet.init(accounts, origin))

  return cy.window().then((win) => {
    injectWallet(win, wallet)
  })
})

Cypress.Commands.add('getAuthRequests', () => {
  return cy.wrap(wallet.getAuthRequests())
})

Cypress.Commands.add('approveAuth', (id: number, accountAddresses: string[]) => {
  return wallet.approveAuth(id, accountAddresses)
})

Cypress.Commands.add('rejectAuth', (id: number, reason: string) => {
  return wallet.rejectAuth(id, reason)
})

Cypress.Commands.add('getTxRequests', () => {
  return cy.wrap(wallet.getTxRequests())
})

Cypress.Commands.add('approveTx', (id: number) => {
  return wallet.approveTx(id)
})

Cypress.Commands.add('rejectTx', (id: number, reason: string) => {
  return wallet.rejectTx(id, reason)
})
