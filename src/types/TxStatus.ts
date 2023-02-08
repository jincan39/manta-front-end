// @ts-nocheck

const FINALIZED = 'finalized';
const FAILED = 'failed';
const PROCESSING = 'processing';
const DISCONNECTED = 'disconnected';

export default class TxStatus {
  constructor(status, extrinsic = null, subscanUrl = null, message = null) {
    this.status = status;
    this.extrinsic = extrinsic;
    this.subscanUrl = subscanUrl;
    this.message = message;
    this.batchNum = null;
    this.totalBatches = null;
  }

  static processing(message, extrinsic = null) {
    return new TxStatus(PROCESSING, extrinsic, null, message);
  }

  // Block explorer URL provided only for transactions on non-manta chains
  static finalized(extrinsic, subscanUrl = null) {
    return new TxStatus(FINALIZED, extrinsic, subscanUrl);
  }

  static failed(message) {
    return new TxStatus(FAILED, null, null, message);
  }

  static disconnected(extrinsic) {
    return new TxStatus(DISCONNECTED, extrinsic);
  }

  isProcessing() {
    return this.status === PROCESSING;
  }

  isFinalized() {
    return this.status === FINALIZED;
  }

  isFailed() {
    return this.status === FAILED;
  }

  isDisconnected() {
    return this.status === DISCONNECTED;
  }

  toString() {
    let message = this.status;
    if (this.message) {
      message += `;\n ${this.message}`;
    }
    return message;
  }
}
