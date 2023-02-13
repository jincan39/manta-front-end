import { MutableRefObject, useEffect, useState } from 'react';

export const useEllipsis = (
  ref: MutableRefObject<HTMLDivElement | null>,
  callback: <T>(arg: T | null) => T
) => {
  const [isEllipsis, setIsEllipsis] = useState<boolean>(false);

  useEffect(() => {
    const { current } = ref;
    const trigger = () => {
      const { offsetWidth, scrollWidth } = current || {};
      const isEllipsis =
        offsetWidth && scrollWidth ? offsetWidth < scrollWidth : false;

      current && setIsEllipsis(isEllipsis);
      if (callback) callback(isEllipsis);
    };

    if (current) {
      if ('ResizeObserver' in window) {
        new ResizeObserver(trigger).observe(current);
      }

      trigger();
    }
  }, [callback, ref.current]);

  return isEllipsis;
};
