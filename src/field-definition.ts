import {Class, Type} from "./types";
/**
 * Created by amira on 3/1/17.
 */

export function definePolymorphicField<T, S>(source:Type<T, S>):Type<T, S>{
    let result =  defineClass('GenericType', {spec: () => ({})})
        .withDefault(source.defaults(), source.validate, source.options);
    result.validateType = (value:any):value is Type<{}|null, {}|null> => validateValue(source, value);
    return result;
}
