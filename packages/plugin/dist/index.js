import { Extension } from './extension';
const extension = new Extension();
const injectExtension = (win, extension) => {
    Object.defineProperty(win, 'injectedWeb3', {
        get: () => extension.getInjectedEnable(),
        set: () => { }
    });
};
Cypress.Commands.add('initExtension', (accounts, origin) => {
    cy.log('Initializing extension');
    cy.wrap(extension.init(accounts, origin));
    return cy.window().then((win) => {
        injectExtension(win, extension);
    });
});
Cypress.Commands.add('getAuthRequests', () => {
    return cy.wrap(extension.getAuthRequests());
});
Cypress.Commands.add('enableAuth', (id, accountAddresses) => {
    return extension.enableAuth(id, accountAddresses);
});
Cypress.Commands.add('rejectAuth', (id, reason) => {
    return extension.rejectAuth(id, reason);
});
Cypress.Commands.add('getTxRequests', () => {
    return cy.wrap(extension.getTxRequests());
});
Cypress.Commands.add('approveTx', (id) => {
    return extension.approveTx(id);
});
Cypress.Commands.add('rejectTx', (id, reason) => {
    return extension.rejectTx(id, reason);
});
