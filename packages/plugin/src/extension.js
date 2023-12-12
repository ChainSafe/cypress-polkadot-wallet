"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Extension = void 0;
var keyring_1 = require("@polkadot/keyring");
var types_1 = require("@polkadot/types");
var util_crypto_1 = require("@polkadot/util-crypto");
var Extension = /** @class */ (function () {
    function Extension() {
        var _this = this;
        this.authRequests = {};
        this.accounts = [];
        this.txRequests = {};
        this.allowedOrigins = {};
        this.reset = function () {
            _this.authRequests = {};
            _this.accounts = [];
            _this.txRequests = {};
            _this.keyring = undefined;
            _this.allowedOrigins = {};
        };
        this.init = function (accounts, allowedOrigin) { return __awaiter(_this, void 0, void 0, function () {
            var accountAddresses;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.reset();
                        this.accounts = accounts;
                        return [4 /*yield*/, (0, util_crypto_1.cryptoWaitReady)()];
                    case 1:
                        _a.sent();
                        this.keyring = new keyring_1.Keyring({ type: 'sr25519' });
                        accounts.forEach(function (_a) {
                            var _b;
                            var mnemonic = _a.mnemonic;
                            // we only add to the keyring the accounts with a known mnemonic
                            !!mnemonic && ((_b = _this.keyring) === null || _b === void 0 ? void 0 : _b.addFromUri(mnemonic));
                        });
                        accountAddresses = accounts.map(function (_a) {
                            var address = _a.address;
                            return address;
                        });
                        // if passed along all the accounts will be allowed for this origin
                        if (allowedOrigin) {
                            this.allowedOrigins[allowedOrigin] = accountAddresses;
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        this.getInjectedEnable = function () {
            return {
                'polkadot-js': {
                    enable: function (origin) {
                        var resolvedObject = function (selectedAccounts) { return ({
                            accounts: {
                                get: function () { return selectedAccounts; },
                                subscribe: function (cb) {
                                    return cb(selectedAccounts);
                                }
                            },
                            signer: {
                                signPayload: function (payload) {
                                    return new Promise(function (resolve, reject) {
                                        var id = Date.now();
                                        var res = function () {
                                            var _a, _b;
                                            var registry = new types_1.TypeRegistry();
                                            registry.setSignedExtensions(payload.signedExtensions);
                                            var pair = (_a = _this.keyring) === null || _a === void 0 ? void 0 : _a.getPair(payload.address);
                                            if (!pair) {
                                                console.error("Pair not found for encoded address ".concat(payload.address, ", with keyring:"), (_b = _this.keyring) === null || _b === void 0 ? void 0 : _b.toJson);
                                                return;
                                            }
                                            var signature = registry
                                                .createType('ExtrinsicPayload', payload, {
                                                version: payload.version
                                            })
                                                .sign(pair);
                                            resolve({ id: id, signature: signature.signature });
                                        };
                                        var rej = function (reason) { return reject(new Error(reason)); };
                                        _this.txRequests[id] = { id: id, payload: payload, resolve: res, reject: rej };
                                    });
                                }
                            }
                        }); };
                        // this origin has already allowed some accounts
                        if (_this.allowedOrigins[origin]) {
                            // return the list of accounts
                            var res = resolvedObject(_this.accounts.filter(function (_a) {
                                var address = _a.address;
                                return _this.allowedOrigins[origin].includes(address);
                            }));
                            return Promise.resolve(res);
                        }
                        return new Promise(function (resolve, reject) {
                            var timestamp = Date.now();
                            var res = function (accountAddresses) {
                                var selectedAccounts = _this.accounts.filter(function (_a) {
                                    var address = _a.address;
                                    return accountAddresses.includes(address);
                                });
                                // store the allowed accounts for this orgin
                                _this.allowedOrigins[origin] = accountAddresses;
                                var res = resolvedObject(selectedAccounts);
                                resolve(res);
                            };
                            var rej = function (reason) { return reject(new Error(reason)); };
                            _this.authRequests[timestamp] = { id: timestamp, origin: origin, resolve: res, reject: rej };
                        });
                    },
                    version: '1'
                }
            };
        };
        this.getAuthRequests = function () {
            return _this.authRequests;
        };
        this.enableAuth = function (id, accountAddresses) {
            _this.authRequests[id].resolve(accountAddresses);
        };
        this.rejectAuth = function (id, reason) {
            _this.authRequests[id].reject(reason);
        };
        this.getTxRequests = function () {
            return _this.txRequests;
        };
        this.approveTx = function (id) {
            _this.txRequests[id].resolve();
        };
        this.rejectTx = function (id, reason) {
            _this.txRequests[id].reject(reason);
        };
    }
    return Extension;
}());
exports.Extension = Extension;
