const isObjectEmpty = (objectName: object) => {
  return (
    objectName &&
    Object.keys(objectName).length === 0 &&
    objectName.constructor === Object
  );
};

export default isObjectEmpty;
