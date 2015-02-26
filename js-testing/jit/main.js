function test() {

    function createFunction(index){
        var name = 'fff_' + index;
        var returnValues = ['[]', '{}', '"asdhfasdf"', '123123', '0.44352', 'function(){}', '/asdasd/'];
        return new Function('return function '+name+'(a){ return ' + returnValues[Math.floor( Math.random() * returnValues.length )] + '}')();
    }

    function createFunctions(howMany){
        howMany = howMany || 0;
        var fns = [];
        while(howMany--){
            fns[fns.length] = createFunction(howMany);
        }
        return fns;
    }


    function callFunction(fn){
        var args = [1, 0.2, 'asfasf', {}, [], function(){}, /asdasd/];
        return fn(args[Math.floor( Math.random() * args.length )]);
    }


    function callFunctionWithDiffArgs(fn){
        var times = 1000;
        while(times--){
            var args = [1, 0.2, 'asfasf', {}, [], function(){}, /asdasd/];
            while(args.length){
                fn(args.shift());
            }
        }
    }


    createFunctions(100).map(callFunctionWithDiffArgs)

}


var argsVar   = [1, 0.2, 'asfasf', {}, [], function(){}, /asdasd/, 1, 0.2, 'asfasf', {}, [], function(){}, /asdasd/];
var argsConst = [1,2,3,4,5,6,7, 1,2,3,4,5,6,7];

function callFunctionWithDiffArgs(fn, args){
    var times = 100000;
    while(times--){
        var _args = args.slice();
        while(_args.length){
            fn(_args.shift());
        }
    }
}



function test2(args){

    function A(arg){
        return arg.toString();
    }

    callFunctionWithDiffArgs(A, args);


}


console.time('A');
var args = argsVar;
test2(args)
test2(args)
test2(args)
test2(args)
test2(args)
test2(args)
console.timeEnd('A');

