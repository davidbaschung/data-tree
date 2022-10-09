<template>
    <div class="flex grid-section">
        <div v-if="false">
            <div>some store number : {{ $store.state.someNumber }}</div>
            <div>some mapState number : {{ someNumber }}</div> <!--(using mapState)-->
            <div>some number imported from props : {{ importedNumber }}</div> <!--(using mapState)-->
            persons test : {{ $store.getters.persons }}
            <br>
            persons test : {{ printPersons }}
        </div>
        <div v-show="isLoading" v-for="i in 3" :key="i+'someSalt'" class="flex">
            <div class="person-card" :style="disabledStyles(i)">
                Loading...
            </div>
        </div>
        <div v-show=" ! isLoading" v-for="(p, index) in persons" :key="index">
            <person-card :person="p"></person-card>
        </div>
    </div>
</template>

<script>
/**
 * The GridSection provides the User with a list of persons
 * Contract: This component shows the User a list of Persons provided by the parent component
 * It does not need to know about the store and does not need to change the state.
 * It simply takes an array of Persons and displays them
 */
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
                disabled: {
                    'background-color': 'darkgray',
                    'border' : '5px solid gray',
                    'display' : 'flex',
                    'justify-content' : 'center',
                    'align-items' : 'center',
                    /* alternative for vertical alignment, with flex parent : */
                    // 'align': "center",
                    // 'vertical-align': "middle",
                    'width' : '7em',
                    'height' : '7em',
                    'font-weight' : 'bold',
                    'color' : 'white',
                }
            }
        },
        watch: {
            '$store.state.persons' (x) {
                this.isLoading = x[0] == undefined;
                this.$emit("isLoading", this.isLoading);
            },
        },
        methods: {
            disabledStyles(index) {
                let start = new Date();
                console.log("Loading started at : " + start);
                let opacity = Math.pow(0.6, index);

                return {
                    ...{
                        'opacity' : opacity,
                    },
                    ...this.disabled
                }
            },
        },
    }
</script>

<style lang="scss">
    div {
        // font-family: Arial, Helvetica, sans-serif;
        // font-size: 10pt;

        .flex {
            display: flex
        }
        .grid-section {
            flex-wrap: wrap;
        }
        // you wanted to know how to center vertically. Put the text in a block element and use flex on the parent. see scss below
    }

    img {
        border-radius: 3px;
    }
</style>