function assert(condition, testDescription) {
    if (!condition)
        throw new Error("[assertion failed] - " + testDescription);
    else
        console.log("[assertion passed] - "  + testDescription);
}
if(typeof window === "undefined")
    module.exports = assert;