var NumberType = () => {
    throw new Error('use native string');
};

NumberType.getterFactory = (fieldName) => { return () => { return this.__value__[fieldName]; }};
NumberType.setterFactory = (fieldName) => { return (value) => { return this.__value__[fieldName] = value; }};

export default NumberType;