import {expect} from 'chai';
import {Type, Class} from "../src/types";
import * as mutable from '../src';

function complianceContract<F>(fieldDef:Type<F, any>, subTypes:Array<Type<any, any>>, incompatibleTypes:Array<Type<any, any>>){
    type Fields = {
        field:F
    };
    describe(`of type ${fieldDef.id}`, () => {
        let instance: Fields;
        before('define type', () => {
            const ContainerClass = mutable.define<Fields>('ContainerClass', {
                spec: (self:Class<any>) => ({field:fieldDef})
            });
            instance = new ContainerClass();
        });
        it(`accepts value of ${fieldDef.id} itself`, ()=>{
            instance.field = fieldDef.create();
        });
        subTypes.forEach(st => {
            it(`accepts value of ${st.id}`, () => {
                instance.field = st.create() as any;
            });
        });
        incompatibleTypes.forEach(_it => {
            it(`rejects value of ${_it.id}`, () => {
                expect (() => {instance.field = _it.create() as any;}).to.report({ level: /error/ });
            });
        });
    });
}
const primitiveClasses = [
    mutable.String,
    mutable.Boolean,
    mutable.Number,
    mutable.Function
];

const concreteClasses = primitiveClasses.concat([
    mutable.Reference,
    mutable.List.of(mutable.String),
    mutable.Es5Map.of(mutable.String),
    mutable.PropsBase // an example for a user class
]);

describe('field definition', () => {
    complianceContract(mutable.Any, [
        mutable.String,
        mutable.Boolean,
        mutable.Number,
        mutable.Function,
        mutable.Reference,
        mutable.List.of(mutable.String),
        mutable.Es5Map.of(mutable.String),
        mutable.PropsBase
    ], []);

    primitiveClasses.forEach(pc => {
        complianceContract(pc, [], concreteClasses.filter(c => c !== pc));
    });

    complianceContract(mutable.NonPrimitive, [
        mutable.List.of(mutable.String),
        mutable.Es5Map.of(mutable.String),
        mutable.PropsBase
    ], [
        mutable.String,
        mutable.Boolean,
        mutable.Number,
        mutable.Function
    ]);

    complianceContract(mutable.BaseClass, [
        mutable.PropsBase
    ], [
        mutable.String,
        mutable.Boolean,
        mutable.Number,
        mutable.Function,
        mutable.List.of(mutable.String),
        mutable.Es5Map.of(mutable.String),
    ]);
});
