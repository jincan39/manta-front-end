import { Navigation, type Swiper as SwiperRefType } from 'swiper';
import { MutableRefObject } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

import {
  useSBTTheme,
  ThemeItem
} from 'pages/SBTPage/SBTContext/sbtThemeContext';

const Item = ({ item }: { item: ThemeItem }) => {
  return (
    <div className="relative h-content">
      <img src={item?.url} className="w-96 h-96" />
      <span className="absolute bottom-4 left-1/2 transform -translate-x-1/2 trans bg-gradient rounded-lg text-sm px-2">
        {item?.name}
      </span>
    </div>
  );
};
const ThemeChecked = ({
  swiperRef,
  defaultThemeItem
}: {
  swiperRef: MutableRefObject<SwiperRefType | null>;
  defaultThemeItem: ThemeItem;
}) => {
  const { checkedThemeItems } = useSBTTheme();
  if (checkedThemeItems.size === 0) {
    return <Item item={defaultThemeItem}></Item>;
  }

  return (
    <Swiper
      className="w-96 m-0 h-content"
      autoplay={false}
      navigation={true}
      modules={[Navigation]}
      onSwiper={(swiper) => {
        swiperRef && (swiperRef.current = swiper);
      }}>
      {[...checkedThemeItems.values()].map((item) => {
        return (
          <SwiperSlide key={item.name}>
            <Item item={item} />
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
};
export default ThemeChecked;
