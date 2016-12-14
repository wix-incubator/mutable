const classesByName = {};
const allClasses = [];

// unsafe, needs defensive cloning if exposed outside module
export function getClassesByName(name){
    return classesByName[name] || [];
}

export function getAllClasses(name){
    return allClasses;
}


export function registerClass(clazz, name){
    allClasses.push(clazz);
    if (name) {
        var bucket = classesByName[name];
        if (!bucket) {
            bucket = classesByName[name] = [];
        }
        bucket.push(clazz);
    }
}
