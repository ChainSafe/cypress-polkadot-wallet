import { InjectedAccountWitMnemonic } from '@chainsafe/cypress-polkadot-wallet/dist/types'

const Alice = {
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  publicKey: '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d',
  name: 'Alice',
  type: 'sr25519',
  mnemonic: 'bottom drive obey lake curtain smoke basket hold race lonely fit walk//Alice'
} as InjectedAccountWitMnemonic

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
    cy.get('#connect-accounts').click()
    cy.getAuthRequests().then((authRequests) => {
      const requests = Object.values(authRequests)
      // we should have 1 connection request to the wallet
      cy.wrap(requests.length).should('eq', 1)
      // this request should be from the application Multix, the name
      // of the wallet will default to polkadot-js
      cy.wrap(requests[0].origin).should('eq', EXAMPLE_DAPP_NAME)
      cy.approveAuth(requests[0].id, [Alice.address])
    })

    // check that 'polkadot-js' is injected and that we get access to the
    // injected accounts
    cy.get('#injected').should('contain', 'polkadot-js')
    cy.get('#all-accounts').should('contain', Alice.address)
    cy.get('#injected-error').should('be.empty')
  })

  it('should init the wallet and connect accounts without authorization request and default polkadot-js name', () => {
    cy.visit('http://localhost:3333')
    // because we pass the origin here, all the account will be automatically
    // accepted by the wallet comming from this origin
    cy.initWallet([Alice], EXAMPLE_DAPP_NAME)
    cy.get('#connect-accounts').click()

    // Here, the wallet has not requested the user authorization, as if the user
    // had already approved this Dapp in the past

    // check that 'polkadot-js' is injected and that we get access to the
    // injected accounts
    cy.get('#injected').should('contain', 'polkadot-js')
    cy.get('#all-accounts').should('contain', Alice.address)
    cy.get('#injected-error').should('be.empty')
  })

  it('should init the wallet and connect accounts without authorization request and custom name', () => {
    cy.visit('http://localhost:3333')
    // because we pass the origin here, all the account will be automatically
    // accepted by the wallet comming from this origin
    cy.initWallet([Alice], EXAMPLE_DAPP_NAME, CUSTOM_WALLET_NAME)
    cy.get('#connect-accounts').click()

    // check that the custom name is injected
    // and that we get access to the injected accounts
    cy.get('#injected').should('contain', CUSTOM_WALLET_NAME)
    cy.get('#all-accounts').should('contain', Alice.address)
    cy.get('#injected-error').should('be.empty')
  })

  it('should init the wallet and reject connection', () => {
    cy.visit(TESTING_LANDING_PAGE)
    cy.initWallet([Alice])
    cy.get('#connect-accounts').click()
    cy.getAuthRequests().then((authRequests) => {
      const requests = Object.values(authRequests)
      // we should have 1 connection request to the wallet
      cy.wrap(requests.length).should('eq', 1)
      // this request should be from the application Multix
      cy.wrap(requests[0].origin).should('eq', EXAMPLE_DAPP_NAME)

      // The reason 'Cancelled by user' is only printed in the console
      // and the Dapp can't access it. It can only know that there are
      // no injected wallet.
      cy.rejectAuth(requests[0].id, 'Cancelled by user')

      // check that the Dapp doesn't get access to any extension
      cy.get('#injected-error').should('contain', 'rejected')
      cy.get('#injected').should('be.empty')

      // check that no account got injected
      cy.get('#all-accounts').should('be.empty')
    })
  })
})
