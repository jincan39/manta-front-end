// @ts-nocheck
import React from 'react';
import classNames from 'classnames';
import { useTxStatus } from 'contexts/txStatusContext';
import PropTypes from 'prop-types';
import Icon from 'components/Icon';

const PublicPrivateToggle = ({ isPrivate, onToggle, prefix }) => {
  const { txStatus } = useTxStatus();
  const disabled = txStatus?.isProcessing();

  const onClick = () => {
    !disabled && onToggle();
  };

  let buttonId;
  if (isPrivate) {
    buttonId = `${prefix}PrivateTogglePublic`;
  } else {
    buttonId = `${prefix}PublicTogglePrivate`;
  }

  return (
    <>
      <div
        id={buttonId}
        onClick={onClick}
        className={classNames(
          'flex text-center cursor-pointer place-items-center btn-hover unselectable-text',
          'rounded-full bg-private-public-toggle border border-public-private-toggle text-white',
          { disabled: disabled }
        )}>
        {isPrivate ? (
          <div className="flex flex-row gap-2 w-22 justify-center items-center text-xss">
            <Icon name="lock" className="w-2.5 h-2.5 place-self-center" />
            Private
          </div>
        ) : (
          <div className="flex flex-row gap-2 w-22 justify-center items-center text-xss">
            <Icon name="internet" className="w-2.5 h-2.5 place-self-center" />
            Public
          </div>
        )}
      </div>
    </>
  );
};

PublicPrivateToggle.propTypes = {
  isPrivate: PropTypes.bool,
  onToggle: PropTypes.func,
  label: PropTypes.string,
  prefix: PropTypes.string
};

export default PublicPrivateToggle;
