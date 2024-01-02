"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var wallet_1 = require("./wallet");
var wallet = new wallet_1.Wallet();
var injectWallet = function (win, wallet) {
    Object.defineProperty(win, 'injectedWeb3', {
        get: function () { return wallet.getInjectedEnable(); },
        set: function () { }
    });
};
Cypress.Commands.add('initWallet', function (accounts, origin) {
    cy.log('Initializing Wallet');
    cy.wrap(wallet.init(accounts, origin));
    return cy.window().then(function (win) {
        injectWallet(win, wallet);
    });
});
Cypress.Commands.add('getAuthRequests', function () {
    return cy.wrap(wallet.getAuthRequests());
});
Cypress.Commands.add('approveAuth', function (id, accountAddresses) {
    return wallet.approveAuth(id, accountAddresses);
});
Cypress.Commands.add('rejectAuth', function (id, reason) {
    return wallet.rejectAuth(id, reason);
});
Cypress.Commands.add('getTxRequests', function () {
    return cy.wrap(wallet.getTxRequests());
});
Cypress.Commands.add('approveTx', function (id) {
    return wallet.approveTx(id);
});
Cypress.Commands.add('rejectTx', function (id, reason) {
    return wallet.rejectTx(id, reason);
});
