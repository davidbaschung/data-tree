<template>
    <div id="grid-section">
        <div v-if="false">
            <div>some store number : {{ $store.state.someNumber }}</div>
            <div>some mapState number : {{ someNumber }}</div> <!--(using mapState)-->
            <div>some number imported from props : {{ importedNumber }}</div> <!--(using mapState)-->
            persons test : {{ $store.getters.printPersons }}
            <br>
            persons test : {{ printPersons }}
        </div>
        <div v-show="isLoading">
            <div class="person-card" :style="this.$data.disabled">
                Loading persons cards...
            </div>
        </div>
        <div v-for="(p, index) in filteredPersons" :key="index" class="person-card">
            <person-card :person="p"></person-card>
        </div>
    </div>
</template>

<script>
    import * as Utils from '../utils.js'
    import { mapState, mapGetters } from 'vuex'
    import PersonCard from "./PersonCard.vue"
    export default {
        name: 'GridSection',
        props: ['importedNumber'],
        components: {
             'person-card': PersonCard
        },
        computed: {
            ...mapState([
                "someNumber",
                "persons"
            ]),
            ...mapGetters([
                "printPersons"
            ]),
            filteredPersons() {
                // console.log("persons",persons);
                console.log("store persons", this.$store.state.persons);
                return this.$store.state.persons;//.filter((p) => {return p.dob.age < 45;})
            }
        },
        data() {
            return {
                isLoading: true,
                disabled : {
                    'background-color': 'darkgray',
                    'border' : '5px solid gray'
                }
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
            '$store.state.persons' (x) {
                this.$data.isLoading=false;
            }
        },
        methods: {
            // filterPerson(person) {
            //     return person.dob.age <  45;
            // },
            // filteredPersons(persons) {
            //     console.log("persons",persons);
            //     console.log("store persons", this.$store.state.persons);
            //     return this.$store.state.persons;//.filter((person) => {return (p) => {return p.dob.age < 45;}})
            // }
        },
        updated() {
            // Utils.default.fetchPersons(10, $store.mutations.updatePersons);
        }
    }
</script>

<style lang="scss">
    div {
        #grid-section {
            display: flex;
            flex-wrap: wrap;
        }
        &.person-card {
            border-radius:13px;
            background-color: yellowgreen;
            margin: 0.5em;
            padding: 0.5em;
            border: 5px solid green;
            min-width: 10em;
            height: 10em;
        }
    }
</style>