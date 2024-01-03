import './style.css'
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'

const ROCOCO_WS_PROVIDER = 'wss://rococo-rpc.polkadot.io'
let injectedAccounts: InjectedAccountWithMeta[] = []

document
  .querySelector<HTMLButtonElement>('#connect-accounts')!
  .addEventListener('click', async () => {
    // returns an array of all the injected sources
    // (this needs to be called first, before other requests)
    const allInjected = await web3Enable('example-dapp')

    if (allInjected.length === 0) {
      document.querySelector<HTMLDivElement>('#injected-error')!.innerHTML = 'rejected'
    } else {
      document.querySelector<HTMLDivElement>('#injected')!.innerHTML = JSON.stringify(allInjected)

      // returns an array of { address, meta: { name, source } }
      // meta.source contains the name of the wallet that provides this account
      const allAccounts = await web3Accounts()
      document.querySelector<HTMLDivElement>('#all-accounts')!.innerHTML =
        JSON.stringify(allAccounts)
      injectedAccounts = allAccounts
    }
  })

document.querySelector<HTMLButtonElement>('#send-tx')!.addEventListener('click', async () => {
  // Initialise the provider to connect to the local node
  const provider = new WsProvider(ROCOCO_WS_PROVIDER)
  const account = injectedAccounts[0]

  // Create the API and wait until ready
  const api = await ApiPromise.create({ provider })

  if (injectedAccounts.length === 0) {
    console.error('No injected account')
    return
  }

  // here we use the api to create a balance transfer to some account of a value of 12345
  const transferExtrinsic = api.tx.balances.transferKeepAlive(account.address, 12345)

  // to be able to retrieve the signer interface from this account
  // we can use web3FromSource which will return an InjectedExtension type
  const injector = await web3FromSource(account.meta.source)

  // passing the injected account address as the first argument of signAndSend
  // will allow the api to retrieve the signer and the user will see the extension
  // popup asking to sign the balance transfer transaction
  transferExtrinsic
    .signAndSend(account.address, { signer: injector.signer }, ({ txHash }) => {
      document.querySelector<HTMLDivElement>('#tx-hash')!.innerHTML = txHash.toString()
    })
    .catch((error: any) => {
      document.querySelector<HTMLDivElement>('#tx-error')!.innerHTML = error
      console.log(':( transaction failed', error)
    })

  api.disconnect()
})
