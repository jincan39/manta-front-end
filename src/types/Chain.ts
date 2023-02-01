// @ts-nocheck
import NETWORK from 'constants/NetworkConstants';
import { KaruraAdapter } from 'manta-polkawallet-bridge/build/adapters/acala';
import { CalamariAdapter } from 'manta-polkawallet-bridge/build/adapters/manta';
import { KusamaAdapter } from 'manta-polkawallet-bridge/build/adapters/polkadot';
import { MoonriverAdapter } from 'manta-polkawallet-bridge/build/adapters/moonbeam';
import { typesBundlePre900 } from 'moonbeam-types-bundle';
import { options } from '@acala-network/api';
import { ApiPromise, WsProvider } from '@polkadot/api';
import types from '../config/types.json';
import AssetType from './AssetType';

export default class Chain {
  constructor(
    name,
    displayName,
    parachainId,
    icon,
    socket,
    subscanUrl,
    xcmAssets,
    nativeAsset,
    xcmAdapterClass,
    apiTypes = null,
    apiOptions = null,
    apiTypesBundle = null,
    ethMetadata = null
  ) {
    this.name = name;
    this.displayName = displayName;
    this.parachainId = parachainId;
    this.icon = icon;
    this.socket = socket;
    this.subscanUrl = subscanUrl;
    this.xcmAssets = xcmAssets;
    this.nativeAsset = nativeAsset;
    this.xcmAdapterClass = xcmAdapterClass;
    this.apiTypes = apiTypes || {};
    this.apiOptions = apiOptions;
    this.apiTypesBundle = apiTypesBundle;
    this.ethMetadata = ethMetadata;
    this.api = null;
  }

  static Dolphin(config) {
    return new Chain(
      'dolphin',
      'Dolphin',
      9997,
      'dolphin',
      config.DOLPHIN_SOCKET,
      config.DOLPHIN_SUBSCAN_URL,
      [AssetType.Kusama(config), AssetType.Karura(config), AssetType.Moonriver(config)],
      AssetType.DolphinSkinnedCalamari(config),
      CalamariAdapter,
      types
    );
  }

  static DolphinSkinnedCalamari(config) {
    return new Chain(
      'calamari',
      'Dolphin',
      2084,
      'dolphin',
      config.DOLPHIN_SOCKET,
      config.DOLPHIN_SUBSCAN_URL,
      [AssetType.Kusama(config), AssetType.Karura(config), AssetType.Moonriver(config)],
      AssetType.DolphinSkinnedCalamari(config),
      CalamariAdapter,
      types
    );
  }

  static Calamari(config) {
    return new Chain(
      'calamari',
      'Calamari',
      2084,
      'calamari',
      config.CALAMARI_SOCKET,
      config.CALAMARI_SUBSCAN_URL,
      [AssetType.Kusama(config), AssetType.Karura(config), AssetType.Moonriver(config)],
      AssetType.Calamari(config),
      CalamariAdapter,
      types
    );
  }

  static Rococo(config) {
    return new Chain(
      'rococo',
      'Rococo',
      null,
      'roc',
      config.ROCOCO_SOCKET,
      config.ROCOCO_SUBSCAN_URL,
      [AssetType.Rococo(config)],
      AssetType.Rococo(config),
      KusamaAdapter
    );
  }

  static Kusama(config) {
    return new Chain(
      'kusama',
      'Kusama',
      null,
      'kusama',
      config.KUSAMA_SOCKET,
      config.KUSAMA_SUBSCAN_URL,
      [AssetType.Kusama(config)],
      AssetType.Kusama(config),
      KusamaAdapter
    );
  }

  static Karura(config) {
    return new Chain(
      'karura',
      'Karura',
      2000,
      'kar',
      config.KARURA_SOCKET,
      config.KARURA_SUBSCAN_URL,
      [AssetType.Karura(config)],
      AssetType.Karura(config),
      KaruraAdapter,
      null,
      options
    );
  }

  static Moonriver(config) {
    const moonriverEthMetadata = {
      chainId: '0x500',
      chainName: 'Moonriver Development Testnet',
      nativeCurrency: {
        name: 'MOVR',
        symbol: 'MOVR',
        decimals: 18
      },
      rpcUrls: [config.MOONRIVER_RPC]
    };

    return new Chain(
      'moonriver',
      'Moonriver',
      1000,
      'movr',
      config.MOONRIVER_SOCKET,
      config.MOONRIVER_SUBSCAN_URL,
      [AssetType.Moonriver(config)],
      AssetType.Moonriver(config),
      MoonriverAdapter,
      typesBundlePre900,
      null,
      null,
      moonriverEthMetadata
    );
  }

  static All(config) {
    if (config.NETWORK_NAME === NETWORK.CALAMARI) {
      return [
        Chain.Calamari(config),
        Chain.Kusama(config),
        Chain.Karura(config),
        Chain.Moonriver(config)
      ];
    } else if (config.NETWORK_NAME === NETWORK.DOLPHIN) {
      return [
        Chain.DolphinSkinnedCalamari(config),
        Chain.Kusama(config),
        Chain.Karura(config),
        Chain.Moonriver(config)
      ];
    }
  }

  getXcmApi() {
    const provider = new WsProvider(this.socket);
    if (this.apiOptions) {
      const api = new ApiPromise(options({ provider, types: this.apiTypes}));
      return api;
    } else {
      const api = new ApiPromise({provider, types: this.apiTypes, typesBundle: this.apiTypesBundle});
      return api;
    }
  }

  getXcmAdapter() {
    return new this.xcmAdapterClass();
  }

  canTransferXcm(otherChain) {
    if (this.name === otherChain.name) {
      return false;
    }
    for (let i = 0; i < this.xcmAssets.length; i++) {
      const asset = this.xcmAssets[i];
      if (
        otherChain.xcmAssets.find(
          (otherAsset) => asset.assetId === otherAsset.assetId
        )
      ) {
        return true;
      }
    }
    return false;
  }
}
