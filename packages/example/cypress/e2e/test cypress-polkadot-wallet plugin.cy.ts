describe('test cypress-polkadot-wallet plugin', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3333')
  })

  it('should check if plugin is installed', () => {
    expect(cy).property('initExtension').to.be.a('function')
  })

  it('should init the extension and connect accounts', () => {
    cy.initExtension([
      {
        address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        publicKey: '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d',
        name: 'Alice',
        type: 'sr25519',
        mnemonic: 'bottom drive obey lake curtain smoke basket hold race lonely fit walk//Alice'
      }
    ])
    cy.get('#connect-accounts').click()
    cy.wait(1000)
    cy.getAuthRequests().then((authRequests) => {
      const requests = Object.values(authRequests)
      // we should have 1 connection request to the extension
      cy.wrap(requests.length).should('eq', 1)
      // this request should be from the application Multix
      cy.wrap(requests[0].origin).should('eq', 'example-dapp')
      cy.enableAuth(requests[0].id, ['5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'])
    })
  })
})
