import { MutableRefObject, useEffect, useRef, useState } from 'react';

export const useEllipsis = (
  ref: MutableRefObject<HTMLDivElement | null>,
  callback: <T>(arg: T | null) => T
) => {
  const [isEllipsis, setIsEllipsis] = useState<boolean>(false);
  const observerRef: MutableRefObject<ResizeObserver> = useRef(
    new ResizeObserver(() => null)
  );

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
        const observer: ResizeObserver = new ResizeObserver(trigger);
        observer.observe(current);
        observerRef.current = observer;
      }

      trigger();
    }

    return observerRef.current.disconnect();
  }, [callback, ref.current]);

  return isEllipsis;
};
