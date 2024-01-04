"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var wallet_1 = require("./wallet");
var DEFAULT_WALLET_NAME = 'polkadot-js';
var wallet = new wallet_1.Wallet();
var injectWallet = function (win, wallet, walletName) {
    Object.defineProperty(win, 'injectedWeb3', {
        get: function () { return wallet.getInjectedEnable(walletName); },
        set: function () { }
    });
};
Cypress.Commands.add('initWallet', function (accounts, authorizedDappName, walletName) {
    if (walletName === void 0) { walletName = DEFAULT_WALLET_NAME; }
    cy.log('Initializing wallet with name: ', walletName);
    cy.wrap(wallet.init(accounts, authorizedDappName));
    return cy.window().then(function (win) {
        injectWallet(win, wallet, walletName);
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
