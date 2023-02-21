/*
 * expires - millisecond timestamp, e.g. Date.now(), or (new Date).getTime()
 */
export function setLocalStorage(key: string, value: object, expires: number) {
  if (typeof window !== 'undefined' && window.localStorage) {
    const entry = {
      value,
      expires
    };
    try {
      window.localStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      console.error('setLocalStorage', error);
    }
  }
}

export function removeLocalStorage(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error('removeLocalStorage', error);
  }
}

export function getFromLocalStorage(key: string) {
  if (typeof window !== 'undefined' && window.localStorage) {
    let entry: any;
    try {
      entry = window.localStorage.getItem(key);
    } catch (error) {
      console.error('getFromLocalStorage', error);
      return undefined;
    }

    try {
      entry = JSON.parse(entry);
    } catch (e) {
      // Just use raw value
    }

    if (entry && entry.expires && Date.now() > entry.expires) {
      removeLocalStorage(key);
      return null;
    } else {
      const storedValue =
        entry && entry.value !== undefined ? entry.value : entry;
      return storedValue;
    }
  }
  return undefined;
}
