import dataTypeMatchers from "./class-matchers";
import dataInstanceMatchers from "./dataInstanceMatchers";
import readOnlyInstanceMatchers from "./readOnlyInstanceMatchers";

export default function(chai, utils) {
    dataTypeMatchers(chai, utils);
    dataInstanceMatchers(chai, utils);
    readOnlyInstanceMatchers(chai, utils);
}
