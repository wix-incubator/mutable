import {expect} from 'chai';
import {Type} from "../../src/types";
import * as mutable from '../../src';
import {Class} from "../../src/objects/types";

const primitiveClasses: Array<Type<any, any>> = [
    mutable.String,
    mutable.Boolean,
    mutable.Number,
    mutable.Function
];

const concreteClasses: Array<Type<any, any>> = primitiveClasses.concat([
    mutable.Reference,
    mutable.List.of(mutable.String),
    mutable.Es5Map.of(mutable.String),
    mutable.PropsBase // an example for a user class
]);

const UserClass = mutable.define('UserClass', {spec:(c)=>({
    foo:mutable.Number
})});
const UserClassChild = mutable.define('UserClassChild', {spec:(c)=>({
    bar:mutable.Number
})}, UserClass);
const AnotherUserClass = mutable.define('AnotherUserClass', {spec:(c)=>({
    foo:mutable.Number
})});
describe('field definition', () => {
    complianceContract(mutable.Any, concreteClasses, []);

    primitiveClasses.forEach(pc => {
        complianceContract(pc, [pc], concreteClasses.filter(c => c !== pc));
    });

    complianceContract(mutable.Base, [
        mutable.List.of(mutable.String),
        mutable.Es5Map.of(mutable.String),
        UserClass
    ], [
        mutable.String,
        mutable.Boolean,
        mutable.Number,
        mutable.Function
    ]);

    complianceContract(mutable.Object, [
        UserClass
    ], [
        mutable.String,
        mutable.Boolean,
        mutable.Number,
        mutable.Function,
        mutable.List.of(mutable.String),
        mutable.Es5Map.of(mutable.String),
    ]);

    complianceContract(UserClass, [
        UserClassChild
    ],
        concreteClasses.concat([AnotherUserClass])
    );
});

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
