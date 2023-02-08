import {
  createContext,
  ReactNode,
  useCallback,
  useMemo,
  useContext
} from 'react';
import axios from 'axios';

import { useConfig } from 'contexts/configContext';
import { useGenerated } from './generatedContext';
import { GeneratedImg } from './generatingContext';

type MintContextValue = {
  getWatermarkedImgs: () => Promise<Set<GeneratedImg>>;
};

const MintContext = createContext<MintContextValue | null>(null);

const mockData = [
  {
    style: 'style3',
    blur_url:
      'https://npo-backend-images2.s3.amazonaws.com/5HTMourAbVuuYvYUWKcT2Kygc686WMTybUjXM2gMCv1EkwQb/blur/a514aa82-799a-4e09-b21a-f591f4a265bd.png',
    cid: 'QmZmSxZFh3NoNgXoMgETMokx4pvuhV6sfm5HCPfDYFettr'
  },
  {
    style: 'style4',
    blur_url:
      'http://npo-backend-images3.oss-cn-shanghai.aliyuncs.com/5HTMourAbVuuYvYUWKcT2Kygc686WMTybUjXM2gMCv1EkwQb/blur/8fe5f858-26ef-4c57-8901-271e061d3e72.png',
    cid: 'QmXEXJvcNHuHh9S5ivBb2pwdqidXk6Cw5AQQuDkXTHEXdn'
  },
  {
    style: 'style5',
    blur_url:
      'https://npo-backend-images2.s3.amazonaws.com/5HTMourAbVuuYvYUWKcT2Kygc686WMTybUjXM2gMCv1EkwQb/blur/844973d8-8ecb-490a-99b4-a04d6f8c4beb.png',
    cid: 'QmZqGe529q2Z9F9qwceDbpNpLtDbyVxbwoziHt1VN8L4nz'
  }
];

export const MintContextProvider = ({ children }: { children: ReactNode }) => {
  const config = useConfig();
  const { mintSet, setMintSet } = useGenerated();

  const getWatermarkedImgs = useCallback(async () => {
    const url = `${config.SBT_NODE_SERVICE}/npo/watermark`;
    const data = {
      url: [...mintSet].map(({ url }) => url),
      token: 'manta',
      size: 1
    };
    // const ret = await axios.post<GeneratedImg[]>(url, data);
    // if (ret.status === 200 || ret.status === 201) {
    //   const newMintSet = new Set<GeneratedImg>();
    //   [...mintSet].forEach((generatedImg, index) => {
    //     newMintSet.add({
    //       ...generatedImg,
    //       ...ret.data[index]
    //     });
    //   });
    // }
    const newMintSet = new Set<GeneratedImg>();
    [...mintSet].forEach((generatedImg, index) => {
      newMintSet.add({
        ...generatedImg,
        ...mockData[index]
      });
    });
    setMintSet(newMintSet);
    return newMintSet;
  }, [config.SBT_NODE_SERVICE, mintSet, setMintSet]);

  const value = useMemo(
    () => ({
      getWatermarkedImgs
    }),
    [getWatermarkedImgs]
  );
  return <MintContext.Provider value={value}>{children}</MintContext.Provider>;
};

export const useMint = () => {
  const data = useContext(MintContext);
  if (!data || !Object.keys(data)?.length) {
    throw new Error(
      'useMint can only be used inside of <MintContext />, please declare it at a higher level.'
    );
  }
  return data;
};
