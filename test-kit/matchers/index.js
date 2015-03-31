import dataTypeMatchers from "./dataTypeMatchers";
import dataInstanceMatchers from "./dataInstanceMatchers";

export default function(chai, utils){
    dataTypeMatchers(chai, utils);
    dataInstanceMatchers(chai, utils);
}