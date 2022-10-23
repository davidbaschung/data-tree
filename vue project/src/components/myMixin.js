export const myMixin = {
    data : function () {
        const someData = "someData";
    },
    methods : {
        hellowWorld() {
            console.log("hello world,");
        }
    },
    created() {
        console.log("mixin component created");
    }
}