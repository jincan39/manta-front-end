import React, { useEffect } from 'react';
import { useModal } from 'hooks';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Icon from 'components/Icon';

const blockedCountries = ['US', 'CN', 'IR', 'CU', 'KP', 'SY', 'MM'];
const blockedRegions = ['Crimea', 'Luhans\'k', 'Donets\'k'];
const IPDATA_APIKEY = 'f47f1429b7dfb0d01a6d049b7cd283087b1b75fc3891f249d9c0919b';

function IPBlockingModal() {
  const { ModalWrapper, showModal, hideModal } = useModal({ closeDisabled: true });
  const navigate = useNavigate();


  useEffect(() => {
    async function getUserGeolocation() {
      if (!window.location.pathname.includes('/calamari/transact')) {
        hideModal();
        return;
      }
      const res = await axios.get(`https://api.ipdata.co?api-key=${IPDATA_APIKEY}`);
      if (res.status === 200) {
        const country_code = res?.data?.country_code;
        const region = res?.data?.region;
        if (1 === 1 || blockedCountries.includes(country_code) || blockedRegions.includes(region)) {
          showModal();
        }
      }
    }
    getUserGeolocation().catch(console.error);
  }, []);

  const onClickNav = (path: string) => {
    navigate(path);
  };

  const navs = [
    {
      name: '$KMA Staking',
      path: '/calamari/stake'
    },
    {
      name: 'Bridge',
      path: '/calamari/bridge'
    },
    {
      name: 'Dolphin Testnet',
      path: '/dolphin/bridge'
    }
  ];

  return (
    <ModalWrapper>
      <div className="w-140 bg-fourth -mx-6 -my-4 rounded-lg p-6">
        <div className="text-xl leading-6">MANTAPAY IS NOT AVAILABLE IN YOUR LOCATION</div>
        <div className="text-sm text-secondary leading-5 my-4">
          It appears that this connecting is from a prohibited region (United States, China, Iran, Cuba, North Korea, Syria, Myanmar (Burma), the regions of Crimea, Donetsk or Luhansk). If you're using a VPN, try disabling it.
        </div>
        {
          navs.map(({ name, path }) => (
            <button key={path} onClick={() => onClickNav(path)} className="mt-6 flex items-center justify-between px-4 border border-solid border-white border-opacity-10 bg-white bg-opacity-5 w-full h-12 cursor-hover text-sm cursor-pointer rounded-lg">
              <span>{name}</span>
              <Icon className="w-2 h-2" name="right" />
            </button>)
          )
        }
      </div>
    </ModalWrapper>
  );
}

export default IPBlockingModal;
