<template>
    <div id="main">
        <input id="nameInput" placeholder="Name, Mail, Phone..." v-model="filterBy.input"/>
        <span>
            <input type="checkbox" v-model="filterBy.men" /> <label for="men">Men</label> <br>
            <input type="checkbox" v-model="filterBy.women" /> <label for="women">Women</label> <br>
        </span>
        <select id="myList" @change="onChange" v-model="filterBy.country">
            <option value="All">All Countries</option>
            <option v-for="country of Array.from($store.state.countries)" :key="country" :value="country">{{country}}</option>
        </select>
        <div class="flex-grid">
            <div class="flex-column">
                <div class="flex-row">
                    <label>Min. age : {{ filterBy.minAge }}</label>
                </div>
                <div class="flex-row">
                    <input id="minAgeInput" class="min-input" type="range" min="0" max="100" v-model="filterBy.minAge" @input="ageChange('minAgeInput', filterBy.maxAge, true)">
                </div>
            </div>
            <div class="flex-column">
                <div class="flex-row">
                    <label>Max. age : {{ filterBy.maxAge }}</label>
                </div>
                <div class="flex-row">
                    <input id="maxAgeInput" class="max-input" type="range" min="0" max="100" v-model="filterBy.maxAge" @input="ageChange('maxAgeInput', filterBy.minAge, false)">
                </div>
            </div>
        </div>
        <double-range-slider :minValue="0" :maxValue="100" minLabel="0" maxLabel="100" :dataArray="personsAgeList" :interval="10"></double-range-slider>
    </div>
</template>

<script>
// import { Store } from 'vuex';
import { mapState, mapGetters } from 'vuex';
import DoubleRangeSlider from './DoubleRangeSlider.vue';

    export default {
    name: "selector-section",
    data() {
        return {
            filterBy: {
                input: "",
                men: true,
                women: true,
                country: "All",
                minAge: 0,
                maxAge: 100,
            },
        };
    },
    computed: {
        personsAgeList() {
            let persons = this.$store.state.persons;
            var ageList = [];
            for (let p of persons)
                ageList.push(p.dob.age);
            return ageList;
        }
    },
    watch: {
        filterBy: {
            handler: function (value) {
                this.updateFilters();
            },
            deep: true
        },
    },
    methods: {
        onChange() {
            console.log("city", this.$store.state.persons);
        },
        ageChange(callerRangeinputTag, rangeLimit, isMaximumTest) {
            var callerRangeinput = document.getElementById(callerRangeinputTag);
            if (isMaximumTest && eval(callerRangeinput.value) < rangeLimit
                || !isMaximumTest && eval(callerRangeinput.value) > rangeLimit)
                callerRangeinput.setAttribute("style", callerRangeinput.style + "accent-color:DodgerBlue");
            else
                callerRangeinput.setAttribute("style", "accent-color:red");
        },
        updateFilters() {
            this.$emit("personsFiltering", this.filterBy);
            // TODO remove
            // let that = this;
            // const test2 = (key) => { return };
            // const testFn =() => {
            //     console.log("test this", this);
            // }
            // testFn();
            // function test() {
            //     console.log("that",that );
            // }
            // test();
        },
    },
    created() {
        this.updateFilters();
    },
    components: { DoubleRangeSlider }
}
</script>

<style lang="scss"> // not scoped style do apply globally
    :root{
        background-color: rgb(235, 215, 176);
    }
</style>

<style scoped lang="scss">
    $lightgreenyellow : darken(mix(greenyellow,yellow), 12%);

    * {
        background-color:darken(greenyellow, 20%);
        color:lightyellow;
        margin-right: 1em;
    }
    #main {
        width:100%;
        display: flex;

        & * {
            vertical-align: middle;
        }
    }
    input {
        background-color: whitesmoke;
        margin: 2px;
        border-radius:5px;
        color: green;

        &.range {
            height:15px;

            .max-input {
                padding:100px;
                display: none;
                direction: rtl;
            }
        }
    }
    select {
        background-color: #{$lightgreenyellow};
        border-radius: 8px;

        option {
            background-color: #{$lightgreenyellow};
        }
    }
    label {
        top: 50%;
    }
    div {
        &.flex-grid {
            align-items:left;
            flex-flow: column wrap;
            justify-content: flex-start;
        }
        &.flex-row {
            flex: 0 0 7em;
            margin:0px;
        }
        &.flex-column {
            display:flex;
        }
    }
</style>

