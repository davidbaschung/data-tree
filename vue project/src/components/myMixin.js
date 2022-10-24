export default {
    data : function () {
        const someData = "someData";
    },
    methods : {
        helloWorld() {
            console.log("hello world");
        },
        someTesting() { 
            // describe() & test() in Vue 3
        }
    },
    created : function () {
        console.log("local mixin component created");
    }
}