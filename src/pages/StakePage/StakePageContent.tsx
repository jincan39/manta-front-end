import React, { useEffect } from 'react';
import { useConfig } from 'contexts/configContext';
import DowntimeModal from 'components/Modal/downtimeModal';
import MobileNotSupportedModal from 'components/Modal/mobileNotSupported';
import getDeviceType from 'utils/ui/getDeviceType';
import { useKeyring } from 'contexts/keyringContext';
import CalamariFooter from 'components/Footer';
import AccountDisplay from './AccountDisplay';
import StakingTable from './Tables/StakingTable';
import UnstaktingTable from './Tables/UnstakingTable';
import CollatorsTable from './Tables/CollatorsTable';

const StakePageContent = () => {
  const { keyring } = useKeyring();
  const config = useConfig();
  const { isMobile } = getDeviceType();

  document.title = config.PAGE_TITLE;

  useEffect(() => {
    if (keyring) {
      keyring.setSS58Format(config.SS58_FORMAT);
    }
  }, [keyring]);

  let warningModal = <div />;
  if (config.DOWNTIME) {
    warningModal = <DowntimeModal />;
  } else if (isMobile) {
    warningModal = <MobileNotSupportedModal />;
  }

  return (
    <div className="flex flex-col gap-6 items-center">
      <div className="mx-auto staking-table px-10 pt-2 pb-10 w-full">
        {warningModal}
        <AccountDisplay />
        <StakingTable />
        <UnstaktingTable />
        <CollatorsTable />
        <CalamariFooter />
      </div>
    </div>
  );
};

export default StakePageContent;
