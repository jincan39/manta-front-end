import axios from 'axios';
import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback
} from 'react';

import { useConfig } from 'contexts/configContext';
import { useExternalAccount } from 'contexts/externalAccountContext';
import { useFaceRecognition } from './faceRecognitionContext';
import { useSBT } from '.';

export type ThemeItem = {
  name: string;
  url: string;
};

type SBTThemeContextValue = {
  themeList: ThemeItem[];
  checkedThemeItems: Map<string, ThemeItem>;
  toggleCheckedThemeItem: (map: Map<string, ThemeItem>) => void;
  generateImgs: () => void;
  modelId: string;
};

const SBTThemeContext = createContext<SBTThemeContextValue | null>(null);

export const SBTThemeContextProvider = ({
  children
}: {
  children: ReactNode;
}) => {
  const [themeList, setThemeList] = useState<ThemeItem[]>([]);
  const [checkedThemeItems, toggleCheckedThemeItem] = useState<
    Map<string, ThemeItem>
  >(new Map<string, ThemeItem>());
  const [modelId, setModelId] = useState<string>('');

  const config = useConfig();
  const { themeGender } = useFaceRecognition();
  const { externalAccount } = useExternalAccount();
  const { imgList } = useSBT();

  useEffect(() => {
    const getThemes = async () => {
      const url = `${config.SBT_NODE_SERVICE}/npo/themes`;
      const ret = await axios.post<ThemeItem[]>(url, { gender: themeGender });
      if (ret.status === 200 || ret.status === 201) {
        const newThemeList = ret?.data?.map((themeItem) => themeItem);
        setThemeList(newThemeList);
      }
    };
    getThemes();
  }, [config.SBT_NODE_SERVICE, themeGender]);

  const generateImgs = useCallback(async () => {
    const url = `${config.SBT_NODE_SERVICE}/npo/gen`;
    const data = {
      address: externalAccount?.address,
      name: externalAccount?.address,
      category_id: 1,
      artist_style: [...checkedThemeItems.keys()],
      images: imgList.map((imgFile) => imgFile?.url),
      gender: themeGender
    };
    const ret = await axios.post<{
      model_id: string;
    }>(url, data);
    if (ret.status === 200 || ret.status === 201) {
      setModelId(ret?.data?.model_id);
    }
  }, [
    checkedThemeItems,
    config.SBT_NODE_SERVICE,
    externalAccount,
    imgList,
    themeGender
  ]);

  const value = useMemo(
    () => ({
      themeList,
      checkedThemeItems,
      toggleCheckedThemeItem,
      generateImgs,
      modelId
    }),
    [themeList, checkedThemeItems, generateImgs, modelId]
  );

  return (
    <SBTThemeContext.Provider value={value}>
      {children}
    </SBTThemeContext.Provider>
  );
};

export const useSBTTheme = () => {
  const data = useContext(SBTThemeContext);
  if (!data || !Object.keys(data)?.length) {
    throw new Error(
      'useSBTTheme() can only be used inside of <SBTThemeContext />, please declare it at a higher level.'
    );
  }
  return data;
};
