"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var extension_1 = require("./extension");
var extension = new extension_1.Extension();
var injectExtension = function (win, extension) {
    Object.defineProperty(win, 'injectedWeb3', {
        get: function () { return extension.getInjectedEnable(); },
        set: function () { }
    });
};
Cypress.Commands.add('initExtension', function (accounts, origin) {
    cy.log('Initializing extension');
    cy.wrap(extension.init(accounts, origin));
    return cy.window().then(function (win) {
        injectExtension(win, extension);
    });
});
Cypress.Commands.add('getAuthRequests', function () {
    return cy.wrap(extension.getAuthRequests());
});
Cypress.Commands.add('enableAuth', function (id, accountAddresses) {
    return extension.enableAuth(id, accountAddresses);
});
Cypress.Commands.add('rejectAuth', function (id, reason) {
    return extension.rejectAuth(id, reason);
});
Cypress.Commands.add('getTxRequests', function () {
    return cy.wrap(extension.getTxRequests());
});
Cypress.Commands.add('approveTx', function (id) {
    return extension.approveTx(id);
});
Cypress.Commands.add('rejectTx', function (id, reason) {
    return extension.rejectTx(id, reason);
});
