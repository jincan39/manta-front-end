const getAbbreviatedName = (
  name: string,
  startLength: number,
  endLength: number
) => {
  return `${name?.slice(0, startLength)}...${name?.slice(-endLength)}`;
};

export default getAbbreviatedName;
