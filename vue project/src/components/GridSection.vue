<template>
    <div id="grid-section" class="flex">
        <div v-if="false">
            <div>some store number : {{ $store.state.someNumber }}</div>
            <div>some mapState number : {{ someNumber }}</div> <!--(using mapState)-->
            <div>some number imported from props : {{ importedNumber }}</div> <!--(using mapState)-->
            persons test : {{ $store.getters.printPersons }}
            <br>
            persons test : {{ printPersons }}
        </div>
        <div v-show="isLoading" v-for="i in 3" :key="i+'someSalt'" class="flex">
            <div class="person-card" :style="disabledStyles(i)">
                Loading...
            </div>
        </div>
        <div v-for="(p, index) in persons" :key="index">
            <person-card :person="p"></person-card>
        </div>
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex'
    import PersonCard from "./PersonCard.vue"
    export default {
        name: 'grid-section',
        props: [
            'persons'
        ],
        components: {
             'person-card': PersonCard
        },
        computed: {
            ...mapState([
                "someNumber",
            ]),
            ...mapGetters([
                "printPersons"
            ]),
        },
        data() {
            return {
                isLoading: true,
                loadStart: Date,
            }
        },
        watch: {
            // '$store.state.persons': {
            //     handler: (newPersons) => {
            //         console.log("isLoading",this.$data.isLoading);
            //         this.$data.isLoading=false;
            //     },
            //     immediate: true
            // }
            
            // 'persons': {
            //     handler: function (newValue, oldValue) {
            //         console.log("new persons : ", newValue);
            //     },
            //     deep: true,
            // },
            '$store.state.persons' (x) {
                this.isLoading=false;
            },
            // filterBy : {
            //     handler: function (value) {
            //         this.updateFilters();
            //     },
            //     deep: true
            // },
        },
        methods: {
            disabledStyles(index) {
                let start = new Date();
                console.log("Loading started at : " + start);
                let opacity = Math.pow(0.6, index);

                return {
                    'opacity' : opacity,
                    'background-color': 'darkgray',
                    'border' : '5px solid gray',
                    'display' : 'flex',
                    'justify-content' : 'center',
                    'align-items' : 'center',
                    'width' : '7em',
                    'height' : '7em',
                    'font-weight' : 'bold',
                    'color' : 'white',
                }
            },
        },
        updated() {
            // Utils.default.fetchPersons(10, $store.mutations.updatePersons);
        }
    }
</script>

<style lang="scss">
    div {
        .flex {
            display: flex
        }
        #grid-section {
            flex-wrap: wrap;
        }
    }

    img {
        border-radius: 3px;
    }
</style>