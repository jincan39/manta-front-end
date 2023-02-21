// @ts-nocheck
import React from 'react';
import Select, { components } from 'react-select';
import { useTxStatus } from 'contexts/txStatusContext';
import CopyPasteIcon from 'components/CopyPasteIcon';
import getAbbreviatedName from 'utils/display/getAbbreviatedName';
import classNames from 'classnames';

export const substrateAccountToReactSelectOption = (account) => {
  if (!account) {
    return null;
  }
  const label = account?.meta.name;
  return {
    value: { account, address: account.address },
    label
  };
};

export const substrateAccountsToReactSelectOptions = (accounts) => {
  return accounts.map((account) =>
    substrateAccountToReactSelectOption(account)
  );
};

const AccountSelect = ({ options, selectedOption, onChangeOption }) => {
  const { txStatus } = useTxStatus();
  const disabled = txStatus?.isProcessing();

  return (
    <Select
      className={classNames(
        'w-100 flex items-center h-16 manta-bg-gray',
        'rounded-lg p-0.5 text-black dark:text-white',
        { disabled: disabled }
      )}
      isSearchable={false}
      value={selectedOption}
      onChange={onChangeOption}
      options={options}
      placeholder=""
      styles={dropdownStyles(disabled)}
      isDisabled={disabled}
      components={{
        SingleValue: AccountSelectSingleValue,
        Option: AccountSelectOption,
        IndicatorSeparator: EmptyIndicatorSeparator
      }}
      onValueClick={(e) => e.stopPropagation()}
    />
  );
};

const AccountSelectSingleValue = ({ data }) => {
  const succinctAddress = getAbbreviatedName(data.value.address, 10, 10);
  return (
    <div className="pl-4 pr-6 border-0 flex flex-grow items-end gap-2 relative">
      <div className="text-black dark:text-white">{data.label}</div>
      <div className="text-xs text-white text-opacity-60">
        {succinctAddress}
      </div>
      <data id="clipBoardCopy" value={data.value.address} />
      <CopyPasteIcon
        className="ml-auto manta-gray cursor-pointer absolute right-1 top-1/2 transform -translate-y-1/2"
        textToCopy={data.value.address}
      />
    </div>
  );
};

const AccountSelectOption = (props) => {
  const { label, value, innerProps } = props;
  const onClick = () => {
    return;
  };
  const succinctAddress = getAbbreviatedName(value.address, 10, 10);
  return (
    <div {...innerProps}>
      <div className="flex items-center hover:bg-blue-100">
        <div onClick={onClick} className="w-full pl-4 p-2 text-black">
          <components.Option {...props}>{label}</components.Option>
          <div className="text-xs block manta-gray">{succinctAddress}</div>
        </div>
      </div>
    </div>
  );
};

const EmptyIndicatorSeparator = () => {
  return <div />;
};

const dropdownStyles = (disabled) => {
  const cursor = disabled ? 'not-allowed !important' : 'pointer';
  return {
    control: (provided) => ({
      ...provided,
      borderStyle: 'none',
      borderWidth: '0px',
      paddingBottom: '0.5rem',
      paddingTop: '0.5rem',
      boxShadow: '0 0 #0000',
      backgroundColor: 'transparent',
      width: '100%',
      cursor: cursor
    }),
    dropdownIndicator: () => ({ paddingRight: '1rem' }),
    option: () => ({
      fontSize: '12pt'
    }),
    input: (provided) => ({
      ...provided,
      fontSize: '1.125rem',
      paddingLeft: '0.6rem',
      display: 'none',
      minWidth: '0%',
      maxWidth: '100%',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      cursor: cursor
    })
  };
};

export default AccountSelect;
