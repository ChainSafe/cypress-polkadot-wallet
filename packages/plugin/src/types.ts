import { InjectedAccount } from '@polkadot/extension-inject/types'

export interface InjectedAccountWitMnemonic extends InjectedAccount {
  mnemonic: string
  publicKey?: string
}
