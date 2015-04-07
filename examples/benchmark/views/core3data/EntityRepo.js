define(['lodash'],function(_){
    var entities = {};
    var registerHook = function(){};
    return {
        registerEntity : function(name, type, entity)
        {
            var oldEntity = entities[name] && entities[name].entity;
            registerHook(name,entity,oldEntity);
            if(!oldEntity)
            {
                entities[name] = {type:type,entity:entity,name:name};
            }
        },
        getEntitiesByType : function(type) {
            return _.filter(entities,{type:type});
        },
        setRegisterHook: function(func){
            registerHook = func;
        },
        getEntities: function(){
          return entities;
        },
        getEntity: function(name){
            return _.find(entities,{name:name});
        }

    }
});
