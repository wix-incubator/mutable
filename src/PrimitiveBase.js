import {withDefault, nullable} from './typeBuilder'

class _PrimitiveBase {}

_PrimitiveBase.withDefault = withDefault;
_PrimitiveBase.nullable = nullable;

export default _PrimitiveBase;