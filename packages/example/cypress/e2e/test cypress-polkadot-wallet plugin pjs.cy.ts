import { waitForAuthRequest } from '../utils/waitForAuthRequests'

const Alice = {
  address: '5Fsaew2ZtsgpaCUWDmBnz8Jn8i49dvJFQUaJ5TZ6NGC1EBeS',
  addressWithPrefix0: '14osoGHdkexJ1jV2BQEo8H8vzL3oLDrPUyJnEkYSvMDXQcu7',
  name: 'Alice',
  type: 'sr25519',
  mnemonic: 'blame only east lunar valve mother link pill expect eight quote table'
} as any

const EXAMPLE_DAPP_NAME = 'example-dapp'
const CUSTOM_WALLET_NAME = 'My-custom-wallet'
const TESTING_LANDING_PAGE = 'http://localhost:3333'

describe('test cypress-polkadot-wallet plugin', () => {
  it('should check if plugin is installed', () => {
    expect(cy).property('initWallet').to.be.a('function')
  })

  it('should init the wallet and connect accounts with authorization request', () => {
    cy.visit(TESTING_LANDING_PAGE)
    cy.initWallet([Alice])
    cy.get('#connect-accounts-pjs').click()
    cy.getAuthRequests().then((authRequests) => {
      const requests = Object.values(authRequests)
      // we should have 1 connection request to the wallet
      cy.wrap(requests.length).should('eq', 1)
      // this request should be from the application EXAMPLE_DAPP_NAME
      cy.wrap(requests[0].origin).should('eq', EXAMPLE_DAPP_NAME)
      cy.approveAuth(requests[0].id, [Alice.address])
    })

    // check that 'polkadot-js' is injected and that we get access to the
    // injected accounts. Note that the name of the injected wallet will default to polkadot-js
    // but it can be changed as seen in another test
    cy.get('#injected').should('contain', 'polkadot-js')
    cy.get('#all-accounts').should('contain', Alice.address)
    cy.get('#injected-error').should('be.empty')
  })

  it('should init the wallet and connect accounts without authorization request and default polkadot-js name', () => {
    cy.visit(TESTING_LANDING_PAGE)
    // because we pass the origin here, all the account will be automatically
    // accepted by the wallet comming from this origin
    cy.initWallet([Alice], EXAMPLE_DAPP_NAME)
    cy.get('#connect-accounts-pjs').click()

    // Here, the wallet has not requested the user authorization, as if the user
    // had already approved this Dapp in the past

    // check that 'polkadot-js' is injected and that we get access to the
    // injected accounts
    cy.get('#injected').should('contain', 'polkadot-js')
    cy.get('#all-accounts').should('contain', Alice.address)
    cy.get('#injected-error').should('be.empty')
  })

  it('should init the wallet and connect accounts without authorization request and a custom wallet name', () => {
    cy.visit(TESTING_LANDING_PAGE)
    cy.initWallet([Alice], EXAMPLE_DAPP_NAME, CUSTOM_WALLET_NAME)
    cy.get('#connect-accounts-pjs').click()

    // check that the custom name is injected
    // and that we get access to the injected accounts
    cy.get('#injected').should('contain', CUSTOM_WALLET_NAME)
    cy.get('#all-accounts').should('contain', Alice.address)
    cy.get('#injected-error').should('be.empty')
  })

  it('should init the wallet and reject connection', () => {
    cy.visit(TESTING_LANDING_PAGE)
    cy.initWallet([Alice])
    cy.get('#connect-accounts-pjs').click()
    cy.getAuthRequests().then((authRequests) => {
      const requests = Object.values(authRequests)
      // we should have 1 connection request to the wallet
      cy.wrap(requests.length).should('eq', 1)
      cy.wrap(requests[0].origin).should('eq', EXAMPLE_DAPP_NAME)

      // The reason 'Cancelled by user' is only printed in the console
      // and the Dapp can't access it. It can only know that there are
      // no injected wallet.
      cy.rejectAuth(requests[0].id, 'Cancelled by user')

      // check that the Dapp doesn't get access to any wallet
      cy.get('#injected-error').should('contain', 'rejected')
      cy.get('#injected').should('be.empty')

      // check that no account got injected
      cy.get('#all-accounts').should('be.empty')
    })
  })

  it('should sign a transaction and succeed', () => {
    cy.visit(TESTING_LANDING_PAGE)
    cy.initWallet([Alice], EXAMPLE_DAPP_NAME)
    cy.get('#connect-accounts-pjs').click()
    cy.get('#all-accounts').should('contain', Alice.address)
    cy.get('#amount-input').type('{selectAll}{del}12345')
    cy.get('#send-tx-pjs').click()

    // this is using wait-until to wait for the tx request
    // to reach the wallet
    waitForAuthRequest()

    cy.getTxRequests().then((req) => {
      const txRequests = Object.values(req)
      cy.wrap(txRequests.length).should('eq', 1)
      cy.wrap(txRequests[0].payload.address).should('eq', Alice.addressWithPrefix0)
      cy.approveTx(txRequests[0].id)
      cy.get('#tx-hash').should('not.be.empty')
      cy.get('#tx-events', { timeout: 10000 }).should('contain', 'system.ExtrinsicSuccess')
      cy.get('#tx-error').should('be.empty')
    })
  })

  it('should sign a transaction and get an error', () => {
    cy.visit(TESTING_LANDING_PAGE)
    cy.initWallet([Alice], EXAMPLE_DAPP_NAME)
    cy.get('#connect-accounts-pjs').click()
    cy.get('#all-accounts').should('contain', Alice.address)
    // Alice doesn not have enough funds the tx will be broadcasted
    // but the blockchain should reject it
    cy.get('#amount-input').type('{selectAll}{del}100000000000000')
    cy.get('#send-tx-pjs').click()

    waitForAuthRequest()

    cy.getTxRequests().then((req) => {
      const txRequests = Object.values(req)
      cy.wrap(txRequests.length).should('eq', 1)
      cy.wrap(txRequests[0].payload.address).should('eq', Alice.addressWithPrefix0)
      cy.approveTx(txRequests[0].id)
      // the tx hash will be present, but the chain will reject the
      // tx eventually
      cy.get('#tx-hash').should('not.be.empty')
      cy.get('#tx-events', { timeout: 10000 }).should('contain', 'system.ExtrinsicFailed')
    })
  })
})
