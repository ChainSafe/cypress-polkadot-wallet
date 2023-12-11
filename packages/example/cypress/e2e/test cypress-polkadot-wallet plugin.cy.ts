describe('test cypress-polkadot-wallet plugin', () => {
  beforeEach(() => {
    cy.visit('../../../dist/index.html')
  })

  it('should check if plugin is installed', () => {
    expect(cy).property('initExtension').to.be.a('function')
  })
})
