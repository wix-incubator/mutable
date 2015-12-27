import _ from 'lodash';

const clonedMembers = [
	//every type have a type and id
	'id',
	'type',
	//PrimitiveBase
	'create',
	'defaults',
    'validate',
	'allowPlainVal',
	'validateType',
	//PrimitiveBase Mods
	'nullable',
    'withDefault',
	//BaseType
	'wrapValue',
	'cloneValue',
	'_spec'
];

export function cloneType(TypeToClone){
	function Type(value, options) {
		var mergeOptions = options ? _.assign({}, Type.options, options) : Type.options;
		return TypeToClone.create(value !== undefined ? value : Type.defaults(), mergeOptions);
	}
	Type.options = TypeToClone.options ? _.cloneDeep(TypeToClone.options) : {};
	clonedMembers.forEach(member => {Type[member] = TypeToClone[member]});
	return Type;
}

export function getSubtypeSignature(options){
	if(typeof options.subTypes === 'function'){
		return '<'+options.subTypes.type.id+'>';
	}else {
		return '<'+Object.keys(options.subTypes).join(',')+'>';
	}
}

export function getValueTypeName(value){
	if(value.constructor && value.constructor.id){
		return value.constructor.id
	}
	if(_.isPlainObject(value) && value._type){
			return value._type
	}
	return typeof value;
}

export function getFieldDef(Type, fieldName){
	return Type._spec[fieldName];
}
