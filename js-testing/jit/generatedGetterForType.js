function createType(typeId, fields){
    var Type = function(){
        this._data = {};
        Object.keys(fields).forEach(function(id){
            this[id] = fields[id].val;
        }, this._data);
        //this[Math.floor(Math.random()*9999).toString(36)] = 5;

        if(typeId==='type1'){
            this['a'] = 1;
            this['b'] = 1;
        } else {
            this['b'] = 1;
            this['a'] = 1;
        }

    };
    Type.protoype = {
        constructor:Type
    };

    createFields(Type.protoype, fields);

    return Type;
}

function createFields(obj, fields){
    Object.keys(fields).forEach(function(id){
        Object.defineProperty(obj, id, {
            get: function generatedGetter(){ return this._data[id]; },
            set: function generatedSetter(newVal){ this._data[id] = newVal; }
        });
    });
}

var type1 = createType('type1', {f1:{type:String, val:'value'},f2:{type:Number, val:5},f3:{type:Array, val:[]},f4:{type:String, val:'value1'}, x:{type:String, val:'valuea'}});
var type2 = createType('type2', {f4:{type:String, val:'value'},f3:{type:Number, val:5},f2:{type:Array, val:[]},f1:{type:String, val:'value2'}, x:{type:String, val:'valueb'}});
var type3 = createType('type3', {q1:{type:String, val:'value'},q2:{type:Number, val:5},f3:{type:Array, val:[]},q4:{type:String, val:'value3'}, x:{type:String, val:'valuec'}});
var type4 = createType('type4', {w1:{type:String, val:'value'},w2:{type:Number, val:5},w3:{type:Array, val:[]},w4:{type:String, val:'value4'}, x:{type:String, val:'valued'}});
var type5 = createType('type5', {A1:{type:String, val:'value'},B2:{type:Number, val:5},C3:{type:Array, val:[]},D4:{type:String, val:'value5'}, x:{type:String, val:'valuee'}});

function createTest(){

    return function test(instace){
        if(instace.a){
              return instace.a + instace.b;
        }
        return instace.x;
    }

}

var t1 = function test(instace){
    if(instace.a){
        return instace.a + instace.b;
    }
    return instace.x;
};
var t2 = function test(instace){
    if(instace.a){
        return instace.a + instace.b;
    }
    return instace.x;
};

function test(instace){
    if(instace.a){
      //  return console.log('found a');
    }
    return instace.x;
}

var type1Ins = new type1();
var type2Ins = new type2();
var type3Ins = new type3();
var type4Ins = new type4();
var type5Ins = new type5();



t1(type1Ins);
t1(type1Ins);
t2(type2Ins);
t2(type2Ins);

%OptimizeFunctionOnNextCall(t1);
%OptimizeFunctionOnNextCall(t2);

t1(type2Ins);
t2(type1Ins);

printStatus(t1);
printStatus(t2);


function printStatus(fn) {
    switch(%GetOptimizationStatus(fn)) {
        case 1: console.log("Function is optimized"); break;
        case 2: console.log("Function is not optimized"); break;
        case 3: console.log("Function is always optimized"); break;
        case 4: console.log("Function is never optimized"); break;
        case 6: console.log("Function is maybe deoptimized"); break;
    }
}