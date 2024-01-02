import { web3Accounts, web3Enable } from '@polkadot/extension-dapp'
import './style.css'

// document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
//   <div>
//     <a href="https://vitejs.dev" target="_blank">
//       <img src="${viteLogo}" class="logo" alt="Vite logo" />
//     </a>
//     <a href="https://www.typescriptlang.org/" target="_blank">
//       <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
//     </a>
//     <h1>Vite + TypeScript</h1>
//     <div class="card">
//       <button id="counter" type="button"></button>
//     </div>
//     <p class="read-the-docs">
//       Click on the Vite and TypeScript logos to learn more
//     </p>
//   </div>
// `

document
  .querySelector<HTMLButtonElement>('#connect-accounts')!
  .addEventListener('click', async () => {
    console.log('click')
    // returns an array of all the injected sources
    // (this needs to be called first, before other requests)
    const allInjected = await web3Enable('example-dapp')
    document.querySelector<HTMLDivElement>('#injected')!.innerHTML = JSON.stringify(allInjected)
    // returns an array of { address, meta: { name, source } }
    // meta.source contains the name of the wallet that provides this account
    const allAccounts = await web3Accounts()
    document.querySelector<HTMLDivElement>('#all-accounts')!.innerHTML = JSON.stringify(allAccounts)
  })
