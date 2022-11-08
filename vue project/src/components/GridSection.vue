<template>
    <div class="grid-section">
        <div class="background" v-once></div>
        <div class="flex grid-section">
            <div v-if="false" v-memo="[someNumber]">
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
            <!-- TransitionGroup is used for lists only -->
            <!-- <TransitionGroup name="grid" tag="div"> -->
            <div v-show=" ! isLoading" v-for="(p, index) in persons" :key="index">
                <person-card :value="p" @input="updatePerson"></person-card>
            </div>
            <!-- </TransitionGroup> -->
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
                if (x[0] == undefined) return;
                this.$store.dispatch("ADD_SELECTIVITY_TO_PERSONS");
                this.isLoading = false;
                this.$emit("isLoading", this.isLoading);
            },
        },
        methods: {
            disabledStyles(index) {
                let start = new Date();
                // console.log("Loading started at : " + start);
                let opacity = Math.pow(0.6, index);

                return {
                    ...{
                        'opacity' : opacity,
                    },
                    ...this.disabled
                }
            },
            updatePerson(person) {
                this.$store.commit("UPDATE_PERSON", person);
            }
        },
    }
</script>

<style lang="scss">

    :root {
        background-color: rgb(235, 215, 176);
    }
    
    div {
        // font-family: Arial, Helvetica, sans-serif;
        // font-size: 10pt;

        .flex {
            display: flex
        }
        .grid-section {
            position:relative;
            z-index: 1;
            flex-wrap: wrap;
        }
        // you wanted to know how to center vertically. Put the text in a block element and use flex on the parent. see scss below
        
        .background {
            position: absolute;
            z-index: 0;
            width: 100%;
            height: 100%;
            background-image: url("https://img.freepik.com/premium-vector/light-orange-watercolor-abstract-decorative-background_98551-694.jpg?w=2000");
        }
    
    }

    img {
        border-radius: 3px;
    }

    .grid-enter-active,
    .grid-leave-active {
        transform: scale(100%);
    }
    .grid-enter-from,
    .grid-leave-to {
        transform: scale(0%);
    }
</style>