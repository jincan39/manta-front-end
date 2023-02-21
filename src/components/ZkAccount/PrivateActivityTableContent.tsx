import classNames from 'classnames';
import { useConfig } from 'contexts/configContext';
import { getPrivateTransactionHistory } from 'utils/persistence/privateTransactionHistory';
import TxHistoryEvent, {
  PRIVATE_TX_TYPE,
  HISTORY_EVENT_STATUS,
  TransactionMsgAction
} from 'types/TxHistoryEvent';
import Icon from 'components/Icon';
import { IconName } from 'components/Icon';

const PrivateActivityTableContent = () => {
  const config = useConfig();
  const allPrivateTransactionHistory = getPrivateTransactionHistory().reverse();
  const currentNetworkTransactionHistory = allPrivateTransactionHistory.filter(
    (txHistoryEvent: TxHistoryEvent) => {
      return txHistoryEvent.network === config.network;
    }
  );

  if (currentNetworkTransactionHistory.length > 0) {
    return (
      <div className="divide-y divide-dashed divide-manta-gray-secondary">
        {currentNetworkTransactionHistory.map(
          (txHistoryEvent: TxHistoryEvent) => (
            <PrivateActivityItem
              txHistoryEvent={txHistoryEvent}
              key={txHistoryEvent.extrinsicHash}
            />
          )
        )}
      </div>
    );
  }
  return (
    <div className="whitespace-nowrap text-center mt-6">
      You have no activity yet.
    </div>
  );
};

type PrivateActivityItemProps = {
  txHistoryEvent: TxHistoryEvent;
};

const PrivateActivityItem = ({ txHistoryEvent }: PrivateActivityItemProps) => {
  const { transactionType, balance, date, status, subscanUrl } = txHistoryEvent;

  const amount = balance.toString();
  const assetBaseType = balance.assetType.baseTicker;
  const dateString = `${date.toString().split(' ')[2]} ${
    date.toString().split(' ')[1]
  }`;
  const onCLickHandler = (subscanUrl: string) => () => {
    if (subscanUrl) {
      window.open(subscanUrl, '_blank', 'noopener');
    }
  };
  const transactionMsg =
    transactionType === PRIVATE_TX_TYPE.PRIVATE_TRANSFER
      ? TransactionMsgAction.Transact
      : TransactionMsgAction.Send;

  return (
    <div
      onClick={onCLickHandler(subscanUrl)}
      className="flex flex-col hover:bg-thirdry cursor-pointer">
      <div className="flex items-center justify-between pl-2.5 pr-3.5 py-1.5 text-sm">
        <div className="flex flex-col">
          <div className="text-white">{transactionMsg}</div>
          <ActivityMessage
            transactionType={transactionType}
            amount={amount}
            assetBaseType={assetBaseType}
          />
          <StatusMessage status={status} />
        </div>
        <div className="text-white">{dateString}</div>
      </div>
    </div>
  );
};

type ActivityMessageProps = {
  transactionType: PRIVATE_TX_TYPE;
  amount: string;
  assetBaseType: string;
};

const ActivityMessage = ({
  transactionType,
  amount,
  assetBaseType
}: ActivityMessageProps) => {
  if (transactionType === PRIVATE_TX_TYPE.TO_PRIVATE) {
    return (
      <div className="text-secondary text-xss flex flex-row items-center gap-2">
        {`${amount} ${assetBaseType}`}
        <Icon name={'threeRightArrow'} />
        {`${amount} zk${assetBaseType}`}
      </div>
    );
  } else if (transactionType === PRIVATE_TX_TYPE.TO_PUBLIC) {
    return (
      <div className="text-secondary text-xss flex flex-row items-center gap-2">
        {`${amount} zk${assetBaseType}`}
        <Icon name={'threeRightArrow'} />
        {`${amount} ${assetBaseType}`}
      </div>
    );
  } else if (transactionType === PRIVATE_TX_TYPE.PRIVATE_TRANSFER) {
    return (
      <div className="text-secondary text-xss">
        {`${amount} zk${assetBaseType}`}
      </div>
    );
  }
  return null;
};

const STATUS_MESSAGE_MAP = {
  [HISTORY_EVENT_STATUS.SUCCESS]: {
    iconName: 'txSuccess' as IconName,
    message: HISTORY_EVENT_STATUS.SUCCESS,
    textColor: 'text-green-300'
  },
  [HISTORY_EVENT_STATUS.FAILED]: {
    iconName: 'txFailed' as IconName,
    message: HISTORY_EVENT_STATUS.FAILED,
    textColor: 'text-red-500'
  },
  [HISTORY_EVENT_STATUS.PENDING]: {
    iconName: 'txPending' as IconName,
    message: HISTORY_EVENT_STATUS.PENDING,
    textColor: 'text-yellow-500'
  }
};
type StatusMessageTemplateProps = {
  iconName: IconName;
  message: string;
  textColor: string;
};
const StatusMessageTemplate = ({
  iconName,
  message,
  textColor
}: StatusMessageTemplateProps) => {
  return (
    <div
      className={classNames(
        'text-xss flex flex-row items-center gap-1',
        textColor
      )}>
      <Icon name={iconName} />
      {message}
    </div>
  );
};

type StatusMessageProps = {
  status: HISTORY_EVENT_STATUS;
};

const StatusMessage = ({ status }: StatusMessageProps) => {
  if (!STATUS_MESSAGE_MAP[status]) {
    return null;
  }
  return <StatusMessageTemplate {...STATUS_MESSAGE_MAP[status]} />;
};

export default PrivateActivityTableContent;
