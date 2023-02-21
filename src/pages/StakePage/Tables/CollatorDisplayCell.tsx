// @ts-nocheck
import React from 'react';
import PropTypes from 'prop-types';
import Identicon from '@polkadot/react-identicon';
import Collator from 'types/Collator';
import getAbbreviatedName from 'utils/display/getAbbreviatedName';

const CollatorDisplayCell = ({ collator }) => {
  const address = collator.address;
  const addressDisplayString = getAbbreviatedName(address, 6, 6);
  return (
    <div className="flex items-center text-secondary gap-2">
      <Identicon value={address} size={32} theme="polkadot" />
      <div className="flex content-center flex-wrap">
        <div className="w-full m-0 p-0 h-4 mb-1 text-primary">
          {collator.name}
        </div>
        <div className="w-full m-0 p-0 text-xss text-secondary">
          {addressDisplayString}
        </div>
      </div>
    </div>
  );
};

CollatorDisplayCell.propTypes = {
  collator: PropTypes.instanceOf(Collator)
};

export default CollatorDisplayCell;
