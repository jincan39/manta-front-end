import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import Icon from 'components/Icon';

type ICopyPastIconProps = {
  className?: string;
  textToCopy: string;
};

const CopyPasteIcon: React.FC<ICopyPastIconProps> = ({
  className,
  textToCopy
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (e: any) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    e.stopPropagation();
  };

  useEffect(() => {
    const timer = setTimeout(() => copied && setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  return copied ? (
    <FontAwesomeIcon className={classNames(className)} icon={faCheck} />
  ) : (
    <Icon
      className={classNames(`${className} cursor-pointer hover:text-link`)}
      name="copySquare"
      onClick={(e) => copyToClipboard(e)}
    />
  );
};

export default CopyPasteIcon;
