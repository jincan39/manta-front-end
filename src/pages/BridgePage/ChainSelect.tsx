// @ts-nocheck
import classNames from 'classnames';
import Icon from 'components/Icon';
import { useTxStatus } from 'contexts/txStatusContext';
import React from 'react';
import Select, { components } from 'react-select';

const ChainSelect = ({ chain, chainOptions, setChain, isOriginChain }) => {
  const { txStatus } = useTxStatus();
  const disabled = txStatus?.isProcessing();

  const dropdownOptions = chainOptions?.map((chain) => {
    return {
      id: `chain_${chain.name}`,
      key: chain.name,
      label: chain.displayName,
      value: chain
    };
  });

  return (
    <div>
      <Select
        className={classNames(
          'w-48 h-21 rounded-lg manta-bg-gray text-black dark:text-white whitespace-nowrap',
          { disabled: disabled }
        )}
        isSearchable={false}
        isOriginChain={isOriginChain}
        value={chain}
        onChange={(option) => setChain(option.value)}
        options={dropdownOptions}
        placeholder=""
        styles={dropdownStyles}
        isDisabled={disabled}
        components={{
          Control: ChainControl,
          SingleValue: ChainSingleValue,
          MenuList: ChainMenuList,
          Option: ChainOption,
          IndicatorSeparator: EmptyIndicatorSeparator
        }}></Select>
    </div>
  );
};

const ChainControl = (props) => {
  const {
    selectProps: { isOriginChain }
  } = props;
  const chainControlLabel = isOriginChain ? 'From' : 'To';

  return (
    <div className="flex flex-col">
      <div className="relative left-5 top-4 mt-0.5 text-white">
        {chainControlLabel}
      </div>
      <components.Control className="left-3" {...props} />
    </div>
  );
};

const EmptyIndicatorSeparator = () => {
  return <div />;
};

const ChainSingleValue = ({ data }) => {
  return (
    <div className="ml-2 flex items-center gap-4 cursor-pointer">
      <Icon className="w-6 h-6 rounded-full" name={data?.icon} />
      <div className="text-black dark:text-white">{data?.displayName}</div>
    </div>
  );
};

const ChainOption = (props) => {
  const { value, innerProps } = props;
  return (
    <div {...innerProps} className="w-full cursor-pointer">
      <div className="h-full flex items-center inline bg-primary hover:bg-dropdown-hover z-50 py-1">
        <div>
          <Icon className="w-6 h-6 ml-5 my-2 rounded-full" name={value?.icon} />
        </div>
        <div className="pl-4 p-2 text-white">
          <components.Option {...props} />
        </div>
      </div>
    </div>
  );
};

const ChainMenuList = (props) => {
  return (
    <components.MenuList {...props}>
      <div className="rounded-lg overflow-hidden divide-y divide-white-light border border-white-light bg-primary">
        {props.children}
      </div>
    </components.MenuList>
  );
};

const dropdownStyles = {
  dropdownIndicator: () => ({ paddingRight: '1rem' }),
  control: (provided) => ({
    ...provided,
    backgroundColor: 'transparent',
    borderStyle: 'none',
    borderWidth: '0px',
    borderRadius: '1rem',
    minHeight: '4.2rem',
    boxShadow: '0 0 #0000',
    cursor: 'pointer',
    marginRight: '10px'
  }),
  option: () => ({
    fontSize: '12pt'
  }),
  valueContainer: () => ({
    minHeight: '2rem',
    textAlign: 'center',
    display: 'flex'
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '0.5rem',
    backgroundColor: 'transparent',
  }),
  menuList: () => ({
    paddingTop: '0px',
    paddingBottom: '0px'
  })
};

export default ChainSelect;
