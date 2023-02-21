import Balance from './Balance';
import AssetType from './AssetType';
import BN from 'bn.js';

export enum HISTORY_EVENT_STATUS {
  FAILED = 'Failed',
  SUCCESS = 'Success',
  PENDING = 'Pending'
}

export enum PRIVATE_TX_TYPE {
  TO_PRIVATE = 'toPrivate',
  TO_PUBLIC = 'toPublic',
  PRIVATE_TRANSFER = 'privateTransfer'
}

export enum TransactionMsgAction {
  Send = 'Send',
  Transact = 'Transact'
}

export type JsonBalance = {
  assetType: AssetType;
  valueAtomicUnits: string;
};

export default class TxHistoryEvent {
  network: string;
  balance: Balance;
  extrinsicHash: string;
  subscanUrl: string;
  transactionType: PRIVATE_TX_TYPE;
  date: Date;
  status: HISTORY_EVENT_STATUS;
  constructor(
    network: string,
    balance: Balance,
    extrinsicHash: string,
    subscanUrlPrefix: string,
    transactionType: PRIVATE_TX_TYPE,
    date?: Date,
    status?: HISTORY_EVENT_STATUS
  ) {
    const subscanUrl = `${subscanUrlPrefix}/extrinsic/${extrinsicHash}`;
    this.network = network;
    this.balance = balance;
    this.extrinsicHash = extrinsicHash;
    this.subscanUrl = subscanUrl;
    this.transactionType = transactionType;
    this.date = date || new Date();
    this.status = status || HISTORY_EVENT_STATUS.PENDING;
  }

  toJson() {
    const jsonBalance = {
      assetType: this.balance.assetType,
      valueAtomicUnits: this.balance.valueAtomicUnits.toString()
    };
    return JSON.stringify({
      ...this,
      balance: jsonBalance
    });
  }

  static fromJson(txHistoryEventJsonStr: string): TxHistoryEvent {
    const txHistoryEventJsonObj = JSON.parse(txHistoryEventJsonStr);
    const balance = new Balance(
      txHistoryEventJsonObj.balance.assetType,
      new BN(txHistoryEventJsonObj.balance.valueAtomicUnits)
    );
    const date = new Date(txHistoryEventJsonObj.date);
    const subscanUrlPrefix =
      txHistoryEventJsonObj.subscanUrl.match(/(https:\/\/.*?)\//)[1];
    return new TxHistoryEvent(
      txHistoryEventJsonObj.network,
      balance,
      txHistoryEventJsonObj.extrinsicHash,
      subscanUrlPrefix,
      txHistoryEventJsonObj.transactionType,
      date,
      txHistoryEventJsonObj.status
    );
  }
}
