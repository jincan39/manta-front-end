type EntryObjProps = { value: object; expires: number };

/*
 * expires - millisecond timestamp, e.g. Date.now(), or (new Date).getTime()
 */
export function setLocalStorage(
  key: string,
  value: string | object,
  expires?: number
) {
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
    let entry: string;
    let entryObj: EntryObjProps;

    try {
      entry = window.localStorage.getItem(key) || '';
    } catch (error) {
      console.error('getFromLocalStorage', error);
      return undefined;
    }

    if (entry) {
      try {
        entryObj = JSON.parse(entry);
        if (entryObj && entryObj.expires && Date.now() > entryObj.expires) {
          removeLocalStorage(key);
          return null;
        } else {
          const storedValue =
            entryObj && entryObj.value !== undefined
              ? entryObj.value
              : entryObj;
          return storedValue;
        }
      } catch (e) {
        console.log(`JSON.parse error:${e}`);
      }
    }
  }
  return undefined;
}
