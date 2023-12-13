import { InjectedAccountWitMnemonic } from '@chainsafe/cypress-polkadot-wallet/dist/types'

const Alice = {
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  publicKey: '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d',
  name: 'Alice',
  type: 'sr25519',
  mnemonic: 'bottom drive obey lake curtain smoke basket hold race lonely fit walk//Alice'
} as InjectedAccountWitMnemonic

const EXAMPLE_DAPP_NAME = 'example-dapp'
const TESTING_LANDING_PAGE = 'http://localhost:3333'

describe('test cypress-polkadot-wallet plugin', () => {
  it('should check if plugin is installed', () => {
    expect(cy).property('initExtension').to.be.a('function')
  })

  it('should init the extension and connect accounts with authorization request', () => {
    cy.visit(TESTING_LANDING_PAGE)
    cy.initExtension([Alice])
    cy.get('#connect-accounts').click()
    cy.getAuthRequests().then((authRequests) => {
      const requests = Object.values(authRequests)
      // we should have 1 connection request to the extension
      cy.wrap(requests.length).should('eq', 1)
      // this request should be from the application Multix
      cy.wrap(requests[0].origin).should('eq', EXAMPLE_DAPP_NAME)
      cy.enableAuth(requests[0].id, [Alice.address])
    })

    cy.get('#injected').should('contain', 'polkadot-js')
    cy.get('#all-accounts').should('contain', Alice.address)
  })

  it('should init the extension and connect accounts without authorization request', () => {
    cy.visit('http://localhost:3333')
    // because we pass the origin here, all the account will be automatically
    // accepted by the extension comming from this origin
    cy.initExtension([Alice], EXAMPLE_DAPP_NAME)
    cy.get('#connect-accounts').click()
    cy.get('#injected').should('contain', 'polkadot-js')
    cy.get('#all-accounts').should('contain', Alice.address)
  })
})
