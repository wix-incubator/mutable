import dataTypeMatchers from "./dataTypeMatchers";
import dataInstanceMatchers from "./dataInstanceMatchers";
import readOnlyInstanceMatchers from "./readOnlyInstanceMatchers";
import gopostalMatchers from "./gopostalMatchers";

export default function(chai, utils){
    dataTypeMatchers(chai, utils);
    dataInstanceMatchers(chai, utils);
    readOnlyInstanceMatchers(chai, utils);
    gopostalMatchers(chai, utils);
}