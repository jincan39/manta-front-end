// @ts-nocheck
import { useLayoutEffect, useState } from 'react';

export const useEllipsis = (ref, callback) => {
  const [isEllipsis, setIsEllipsis] = useState(undefined);

  useLayoutEffect(() => {
    const { current } = ref;
    const trigger = () => {
      const { offsetWidth, scrollWidth } = current || {};
      const isEllipsis = offsetWidth < scrollWidth;

      current && setIsEllipsis(isEllipsis);
      if (callback) callback(isEllipsis);
    };

    if (current) {
      if ('ResizeObserver' in window) {
        const observer = new ResizeObserver(trigger).observe(current);
        return () => observer && observer.disconnect();
      }

      trigger();
    }
    return () => null;
  }, [callback, ref.current]);

  return isEllipsis;
};
