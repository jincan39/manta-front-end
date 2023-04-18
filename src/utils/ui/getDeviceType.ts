const getDeviceType = () => {
  if (typeof window === 'undefined')
    return {
      isPC: false,
      isMobile: false,
      isTablet: false
    };
  return {
    isPC: window.matchMedia('(min-width: 1280px)').matches,
    isMobile: window.matchMedia('(max-width: 767px)').matches,
    isTablet: window.matchMedia('(min-width: 768px) and (max-width: 1279px)')
      .matches
  };
};

export default getDeviceType;
