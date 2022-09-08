<template>
    <div id="grid-section">
        <div v-show="false" v-for="x in $store.state.test" :key="x.a" class="person-card">
            <!-- TODO question JSON key -->
            <div>some store number : {{ $store.state.someNumber }}</div>
            <div>some mapState number : {{ someNumber }}</div> <!--(using mapState)-->
            <div>some number imported from props : {{ importedNumber }}</div> <!--(using mapState)-->
        </div>
        <div v-if="false" style="background-color: red;">
            persons test : {{ $store.getters.printPersons }}
            <br>
            persons test : {{ printPersons }}
        </div>
        <div v-for="(person, index) in persons.filter((person) => {return filter(person)})" :key="index" class="person-card">
            <!-- <div v-if=" () => {
                $store.mutations.setCurrentlyFilteredPersonIndex(index);
                return false;
            }"> -->
            <!-- TODO question getter with parameter / getter for array elements in JSON? -->
                <img :src="person.picture.medium" />
                <p>{{ $store.getters.name }}</p>
            <!-- </div> -->
        </div>
    </div>
</template>

<script>
    import * as Utils from '../utils.js'
    import { mapState, mapGetters } from 'vuex'
    export default {
        name: 'GridSection',
        props: ['importedNumber'],
        computed: {
            ...mapState([
                "someNumber",
                "persons"
            ]),
            ...mapGetters([
                "printPersons"
            ])
        },
        methods: {
            // TODO question centralize data for filtering in store
            filter(person) {
                return person.dob.age > 45;
            }
        },
        data() {
            return {
                t: this.$store.state.test,
            }
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