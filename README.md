<div align="center">

# @chainsafe/cypress-polkadot-wallet monorepo

This is the monorepo for `@chainsafe/cypress-polkadot-wallet` Cypress plugin. It includes the sources, and some examples.

</div>

## ⚙️ Install

- npm:

```shell
npm install @chainsafe/cypress-polkadot-wallet
```

- yarn:

```shell
yarn add @chainsafe/cypress-polkadot-wallet
```

- pnpm:

```shell
pnpm add @chainsafe/cypress-polkadot-wallet
```

Then import the plugin into your `cypress/support/e2e.js` file:

```js
import '@chainsafe/cypress-polkadot-wallet'
// or
require('@chainsafe/cypress-polkadot-wallet')
```

## 🧪 Usage

You can now easily use the following commands:

## Functions

<dl>
<dt><a href="#initWallet">initWallet(accounts, authorizedDappName, walletName)</a></dt>
<dd><p>Initialize the Polkadot wallet. If an authorizedDappName is passed there is no need to authorize the first connection for Dapps using this name.</p>
</dd>
<dt><a href="#getAuthRequests">getAuthRequests()</a></dt>
<dd><p>Read the authentication request queue</p>
</dd>
<dt><a href="#approveAuth">approveAuth(id, accountAddresses)</a></dt>
<dd><p>Approve a specific authentication request for the Dapp to get access the wallet accounts</p>
</dd>
<dt><a href="#rejectAuth">rejectAuth(id, reason)</a></dt>
<dd><p>Reject a specific authentication request. The Dapp will receive 0 connected wallet as a result.</p>
</dd>
<dt><a href="#getTxRequests">getTxRequests()</a></dt>
<dd><p>Read the wallet transaction request queue</p>
</dd>
<dt><a href="#approveTx">approveTx(id)</a></dt>
<dd><p>Approve a specific transaction</p>
</dd>
<dt><a href="#rejectTx">rejectTx(id, reason)</a></dt>
<dd><p>Reject a specific transaction</p>
</dd>
</dl>

<a name="initWallet"></a>

## initWallet(accounts, authorizedDappName, walletName)

Initialize the Polkadot wallet. If an authorizedDappName is passed there is no need to authorize the first connection for Dapps using this name.

**Kind**: global function

| Param              | Type                                          | Description                                                                  |
| ------------------ | --------------------------------------------- | ---------------------------------------------------------------------------- |
| accounts           | <code>Array.&lt;InjectedAccount&gt;</code>    | Accounts to load into the wallet.                                            |
| authorizedDappName | <code>string</code> \| <code>undefined</code> | Dapp name to automatically share accounts with, without needing to authorize |
| walletName         | <code>string</code> \| <code>undefined</code> | Sets the name of the injected wallet (default 'polkadot-js')                 |

**Example**

```js
cy.initWallet(
  [{ address: '7NPoMQbiA6trJKkjB35uk96MeJD4PGWkLQLH7k7hXEkZpiba', name: 'Alice', type: 'sr25519' }],
  'My-Dapp',
  'My-wallet-extension'
)
```

<a name="getAuthRequests"></a>

## getAuthRequests()

Read the authentication request queue

**Kind**: global function  
**Example**

```js
cy.getAuthRequests().then((authQueue) => {
  cy.wrap(Object.values(authQueue).length).should('eq', 1)
})
```

<a name="approveAuth"></a>

## approveAuth(id, accountAddresses)

Approve a specific authentication request for the Dapp to get access the wallet accounts

**Kind**: global function

| Param            | Type                              | Description                                                                                                               |
| ---------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| id               | <code>number</code>               | the id of the request to authorize. This id is part of the getAuthRequests object response.                               |
| accountAddresses | <code>Array.&lt;string&gt;</code> | the account addresses to share with the applications. These addresses must be part of the ones shared in the `initWallet` |

**Example**

```js
cy.approveAuth(1694443839903, ['7NPoMQbiA6trJKkjB35uk96MeJD4PGWkLQLH7k7hXEkZpiba'])
```

<a name="rejectAuth"></a>

## rejectAuth(id, reason)

Reject a specific authentication request. The Dapp will receive 0 connected wallet as a result.

**Kind**: global function

| Param  | Type                | Description                                                                              |
| ------ | ------------------- | ---------------------------------------------------------------------------------------- |
| id     | <code>number</code> | the id of the request to reject. This id is part of the getAuthRequests object response. |
| reason | <code>reason</code> | the reason for the rejection                                                             |

**Example**

```js
cy.rejectAuth(1694443839903, 'Cancelled')
```

<a name="getTxRequests"></a>

## getTxRequests()

Read the wallet transaction request queue

**Kind**: global function  
**Example**

```js
cy.getTxRequests().then((txQueue) => {
  cy.wrap(Object.values(txQueue).length).should('eq', 1)
})
```

<a name="approveTx"></a>

## approveTx(id)

Approve a specific transaction

**Kind**: global function

| Param | Type                | Description                                                                             |
| ----- | ------------------- | --------------------------------------------------------------------------------------- |
| id    | <code>number</code> | the id of the request to approve. This id is part of the getTxRequests object response. |

**Example**

```js
cy.approveTx(1694443839903)
```

<a name="rejectTx"></a>

## rejectTx(id, reason)

Reject a specific transaction

**Kind**: global function

| Param  | Type                | Description                                                                               |
| ------ | ------------------- | ----------------------------------------------------------------------------------------- |
| id     | <code>number</code> | the id of the tx request to reject. This id is part of the getTxRequests object response. |
| reason | <code>reason</code> | the reason for the rejection                                                              |

**Example**

```js
cy.rejectTx(1694443839903, 'Cancelled')
```

## 📐 Example

We have a very simple Dapp example, and a set of Cypress tests using @chainsafe/cypress-polkadot-wallet

- Take a look at the [Example Dapp](/packages/example/src)
- Take a look at the [Cypress tests](/packages/example/cypress/e2e/test%20cypress-polkadot-wallet%20plugin.cy.ts)

## 📄 License

This project is licensed under the terms of the [Apache-2.0](/LICENSE.md).
