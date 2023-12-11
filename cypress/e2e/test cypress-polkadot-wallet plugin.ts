describe('test cypress-polkadot-wallet plugin', () => {
  it('should check if plugin is installed', () => {
    expect(cy).property('initExtension').to.be.a('function')
  })
})
