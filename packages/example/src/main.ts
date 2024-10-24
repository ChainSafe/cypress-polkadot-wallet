import './style.css'
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'
import { MultiAddress, pas } from '@polkadot-api/descriptors'
import { createClient } from 'polkadot-api'
import { getWsProvider } from 'polkadot-api/ws-provider/web'
import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat'
import {
  getInjectedExtensions,
  connectInjectedExtension,
  InjectedPolkadotAccount,
  InjectedExtension
} from 'polkadot-api/pjs-signer'
import { JSONprint } from './utils'

const PASEO_WS_PROVIDER = 'wss://rpc.ibp.network/paseo'
const EXAMPLE_DAPP_NAME = 'example-dapp'
let injectedAccountsPjs: InjectedAccountWithMeta[] = []
let injectedAccountsPapi: InjectedPolkadotAccount[] = []

document
  .querySelector<HTMLButtonElement>('#connect-accounts-papi')!
  .addEventListener('click', async () => {
    // Get the list of installed extensions
    const extensions: string[] = getInjectedExtensions()

    document.querySelector<HTMLDivElement>('#all-extensions')!.innerHTML =
      JSON.stringify(extensions)

    if (extensions.length === 0) {
      document.querySelector<HTMLDivElement>('#injected-error')!.innerHTML = 'rejected'
    } else {
      try {
        // Connect to an extension
        const selectedExtension: InjectedExtension = await connectInjectedExtension(
          extensions[0],
          EXAMPLE_DAPP_NAME
        )

        // Get accounts registered in the extension
        injectedAccountsPapi = selectedExtension.getAccounts()
        document.querySelector<HTMLDivElement>('#all-accounts')!.innerHTML =
          JSON.stringify(injectedAccountsPapi)
      } catch (error: any) {
        document.querySelector<HTMLDivElement>('#injected-error')!.innerHTML = error.toString()
      }
    }
  })

document
  .querySelector<HTMLButtonElement>('#connect-accounts-pjs')!
  .addEventListener('click', async () => {
    // returns an array of all the injected sources
    // (this needs to be called first, before other requests)
    const allInjected = await web3Enable(EXAMPLE_DAPP_NAME)

    if (allInjected.length === 0) {
      document.querySelector<HTMLDivElement>('#injected-error')!.innerHTML = 'rejected'
    } else {
      document.querySelector<HTMLDivElement>('#injected')!.innerHTML = JSON.stringify(allInjected)

      // returns an array of { address, meta: { name, source } }
      // meta.source contains the name of the wallet that provides this account
      const allAccounts = await web3Accounts()
      document.querySelector<HTMLDivElement>('#all-accounts')!.innerHTML =
        JSON.stringify(allAccounts)
      injectedAccountsPjs = allAccounts
    }
  })

document.querySelector<HTMLButtonElement>('#send-tx-pjs')!.addEventListener('click', async () => {
  const provider = new WsProvider(PASEO_WS_PROVIDER)
  const pjsApi = await ApiPromise.create({ provider })

  const account = injectedAccountsPjs[0]

  if (injectedAccountsPjs.length === 0) {
    console.error('No injected account')
    return
  }

  const amount = document.querySelector<HTMLInputElement>('#amount-input')?.value

  const transferExtrinsic = pjsApi.tx.balances.transferKeepAlive(account.address, amount)
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

document.querySelector<HTMLButtonElement>('#send-tx-papi')!.addEventListener('click', async () => {
  const client = createClient(withPolkadotSdkCompat(getWsProvider(PASEO_WS_PROVIDER)))
  const papi = client.getTypedApi(pas)

  const account = injectedAccountsPapi[0]

  if (injectedAccountsPapi.length === 0) {
    console.error('No injected account')
    return
  }

  const amount = document.querySelector<HTMLInputElement>('#amount-input')?.value

  const transferExtrinsic = papi.tx.Balances.transfer_keep_alive({
    dest: MultiAddress.Id(account.address),
    value: amount ? BigInt(amount) : 0n
  })

  transferExtrinsic.signSubmitAndWatch(account.polkadotSigner, { at: 'best' }).subscribe({
    next: (event) => {
      document.querySelector<HTMLDivElement>('#tx-hash')!.innerHTML = event.txHash.toString()
      if (event.type === 'txBestBlocksState' && event.found) {
        event.events.forEach((ev) => {
          const li = document.createElement('li')
          li.innerHTML = JSONprint(ev)
          document.querySelector<HTMLPreElement>('#tx-events')!.appendChild(li)
        })
      }
    },
    error: (error: any) => {
      document.querySelector<HTMLDivElement>('#tx-error')!.innerHTML = error.toString()
      console.log(':( transaction failed', error)
    }
  })
})
