// @ts-nocheck
import React, { useEffect, createContext, useState, useContext } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import AssetType from 'types/AssetType';
import Decimal from 'decimal.js';
import Usd from 'types/Usd';
import { useConfig } from './configContext';

const UsdPricesContext = createContext();

export const UsdPricesContextProvider = (props) => {
  const config = useConfig();
  const [usdPrices, setUsdPrices] = useState({});

  const fetchUsdPrices = async () => {
    try {
      const assets = AssetType.AllCurrencies(config, false);
      const ids = assets.reduce((res, asset, index) => {
        return `${res}${asset.coingeckoId}${
          index < assets.length - 1 ? ',' : ''
        }`;
      }, '');

      console.log('process', process);
      const res = await axios.get(
        `https://pro-api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&cg_pro_api_key=${process.env.PRICES_API_KEY}`
      );

      if (res.data) {
        const prices = {};
        assets.forEach((asset) => {
          prices[asset.baseTicker] = res.data[asset.coingeckoId]
            ? new Usd(new Decimal(res.data[asset.coingeckoId]['usd']))
            : null;
        });
        setUsdPrices({ ...prices });
      }
    } catch (err) {
      console.error('error fetching usd prices', err);
      setUsdPrices({});
    }
  };

  useEffect(() => {
    fetchUsdPrices();
  }, []);

  const value = {
    usdPrices,
    fetchUsdPrices
  };

  return (
    <UsdPricesContext.Provider value={value}>
      {props.children}
    </UsdPricesContext.Provider>
  );
};

UsdPricesContextProvider.propTypes = {
  children: PropTypes.any
};

export const useUsdPrices = () => ({
  ...useContext(UsdPricesContext)
});
