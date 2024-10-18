import { Injected, InjectedAccounts } from '@polkadot/extension-inject/types'
import { Keyring } from '@polkadot/keyring'
import { TypeRegistry } from '@polkadot/types'
import { SignerPayloadJSON, SignerPayloadRaw, SignerResult } from '@polkadot/types/types'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import { InjectedAccountWitMnemonic } from './types'
import { u8aToHex, u8aWrapBytes } from '@polkadot/util'

export interface AuthRequest {
  id: number
  origin: string
  resolve: (accountAddresses: string[]) => void
  reject: (reason: string) => void
}

export interface TxRequest {
  id: number
  payload: SignerPayloadJSON | SignerPayloadRaw
  resolve: () => void
  reject: (reason: string) => void
}

export type TxRequests = Record<number, TxRequest>
export type AuthRequests = Record<number, AuthRequest>

export type EnableRequest = number
export class Wallet {
  authRequests: AuthRequests = {}
  accounts: InjectedAccountWitMnemonic[] = []
  txRequests: TxRequests = {}
  keyring: Keyring | undefined
  allowedOrigins: Record<string, string[]> = {}

  reset = () => {
    this.authRequests = {}
    this.accounts = []
    this.txRequests = {}
    this.keyring = undefined
    this.allowedOrigins = {}
  }

  init = async (accounts: InjectedAccountWitMnemonic[], allowedOrigin?: string) => {
    this.reset()
    this.accounts = accounts
    await cryptoWaitReady()
    this.keyring = new Keyring({ type: 'sr25519' })
    accounts.forEach(({ mnemonic }) => {
      // we only add to the keyring the accounts with a known mnemonic
      !!mnemonic && this.keyring?.addFromUri(mnemonic)
    })

    const accountAddresses = accounts.map(({ address }) => address)
    // if passed along all the accounts will be allowed for this origin
    // there will be no need to authorize the connection
    if (allowedOrigin) {
      this.allowedOrigins[allowedOrigin] = accountAddresses
    }
  }

  getInjectedEnable = (extensionName: string) => {
    return {
      [extensionName]: {
        enable: (origin: string) => {
          const resolvedObject = (selectedAccounts: InjectedAccountWitMnemonic[]) => ({
            accounts: {
              get: () => selectedAccounts,
              subscribe: (cb: (accounts: InjectedAccountWitMnemonic[]) => void) =>
                cb(selectedAccounts)
            } as unknown as InjectedAccounts,
            signer: {
              signPayload: (payload: SignerPayloadJSON): Promise<SignerResult> => {
                return new Promise<SignerResult>((resolve, reject) => {
                  const id = Date.now()
                  const res = () => {
                    const registry = new TypeRegistry()
                    registry.setSignedExtensions(payload.signedExtensions)
                    const pair = this.keyring?.getPair(payload.address)
                    if (!pair) {
                      console.error(
                        `Pair not found for encoded address ${payload.address}, with keyring:`,
                        this.keyring?.toJson
                      )
                      return
                    }
                    const signature = registry
                      .createType('ExtrinsicPayload', payload, {
                        version: payload.version
                      })
                      .sign(pair)
                    resolve({ id, signature: signature.signature })
                  }

                  const rej = (reason: string) => reject(new Error(reason))

                  this.txRequests[id] = { id, payload, resolve: res, reject: rej }
                })
              },
              signRaw: (payload: SignerPayloadRaw): Promise<SignerResult> => {
                return new Promise<SignerResult>((resolve, reject) => {
                  const id = Date.now()

                  const rest = () => {
                    const pair = this.keyring?.getPair(payload.address)
                    if (!pair) {
                      console.error(
                        `Pair not found for encoded address ${payload.address}, with keyring:`,
                        this.keyring?.toJson
                      )
                      return
                    }

                    const signature = u8aToHex(pair.sign(u8aWrapBytes(payload.data)))

                    resolve({ id, signature: signature })
                  }
                  const rej = (reason: string) => reject(new Error(reason))

                  this.txRequests[id] = { id, payload, resolve: rest, reject: rej }
                })
              }
            }
          })

          // this origin has already allowed some accounts
          if (this.allowedOrigins[origin]) {
            // return the list of accounts
            const res = resolvedObject(
              this.accounts.filter(({ address }) => this.allowedOrigins[origin].includes(address))
            )
            return Promise.resolve(res)
          }

          return new Promise<Injected>((resolve, reject) => {
            const timestamp = Date.now()
            const res = (accountAddresses: string[]) => {
              const selectedAccounts = this.accounts.filter(({ address }) =>
                accountAddresses.includes(address)
              )

              // store the allowed accounts for this orgin
              this.allowedOrigins[origin] = accountAddresses

              const res = resolvedObject(selectedAccounts)
              resolve(res)
            }

            const rej = (reason: string) => reject(new Error(reason))

            this.authRequests[timestamp] = { id: timestamp, origin, resolve: res, reject: rej }
          })
        },
        version: '1'
      }
    }
  }

  getAuthRequests = () => {
    return this.authRequests
  }

  approveAuth = (id: number, accountAddresses: string[]) => {
    this.authRequests[id].resolve(accountAddresses)
  }

  rejectAuth = (id: number, reason: string) => {
    this.authRequests[id].reject(reason)
  }

  getTxRequests = () => {
    return this.txRequests
  }

  approveTx = (id: number) => {
    this.txRequests[id].resolve()
  }

  rejectTx = (id: number, reason: string) => {
    this.txRequests[id].reject(reason)
  }
}
