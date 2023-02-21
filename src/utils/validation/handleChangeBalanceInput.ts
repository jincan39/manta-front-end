import BN from 'bn.js';
import Decimal from 'decimal.js';
import AssetType from 'types/AssetType';
import Balance from 'types/Balance';

const getBalanceStringIsTooLong = (balanceString: string, assetType: AssetType) => {
  if (!balanceString || !assetType) {
    return false;
  }
  const decimalIndex = balanceString.indexOf('.');
  if (decimalIndex === -1) {
    return false;
  }
  const decimalPlaces = balanceString.length - decimalIndex - 1;
  return decimalPlaces > assetType.numberOfDecimals;
};

const handleChangeBalanceInput = ({newInputString, prevInputString, setInputString, setBalance, assetType}:
  {
  newInputString: string,
  prevInputString: string,
  setInputString: (_inputString: string) => void,
  setBalance:  (_balance: Balance | null) => void,
  assetType: AssetType
}) => {
  if (newInputString === '') {
    setBalance(null);
    setInputString('');
  } else if (getBalanceStringIsTooLong(newInputString, assetType)) {
    setInputString(prevInputString);
  } else {
    try {
      const newBalance = Balance.fromBaseUnits(assetType, new Decimal(newInputString));
      setInputString(newInputString);
      if (newBalance.valueAtomicUnits.gt(new BN(0))) {
        setBalance(newBalance);
      } else {
        setBalance(null);
      }
    } catch (error) {
      return;
    }
  }
};

export default handleChangeBalanceInput;
