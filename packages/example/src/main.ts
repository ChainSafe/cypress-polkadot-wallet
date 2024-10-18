import './style.css'
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'

const PASEO_WS_PROVIDER = 'wss://rpc.ibp.network/paseo'
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
  const provider = new WsProvider(PASEO_WS_PROVIDER)
  const api = await ApiPromise.create({ provider })

  // Initialise the provider to connect to the local node
  const account = injectedAccounts[0]

  if (injectedAccounts.length === 0) {
    console.error('No injected account')
    return
  }

  const amount = document.querySelector<HTMLInputElement>('#amount-input')?.value

  const transferExtrinsic = api.tx.balances.transferKeepAlive(account.address, amount)
  const injector = await web3FromSource(account.meta.source)

  transferExtrinsic
    .signAndSend(account.address, { signer: injector.signer }, ({ events, txHash, status }) => {
      document.querySelector<HTMLDivElement>('#tx-hash')!.innerHTML = txHash.toString()

      if (status.isInBlock) {
        events.forEach(({ event: { method, section } }) => {
          const li = document.createElement('li')
          li.innerHTML = `${section}.${method}`
          document.querySelector<HTMLPreElement>('#tx-events')!.appendChild(li)
        })
      }
    })
    .catch((error: any) => {
      document.querySelector<HTMLDivElement>('#tx-error')!.innerHTML = error
      console.log(':( transaction failed', error)
    })
})
