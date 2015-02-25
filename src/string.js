
var StringType = () => {
    throw new Error('use native string');
};

StringType.getterFactory = (fieldName) => { return () => { return this.__value__[fieldName]; }};
StringType.setterFactory = (fieldName) => { return (value) => { return this.__value__[fieldName] = value; }};

export default StringType;