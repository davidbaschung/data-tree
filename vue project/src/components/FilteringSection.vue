<template>
    <div class="filtering-section" ref="filteringSection">
        <input
            type="text"
            class="nameInput"
            placeholder="Name, Mail, Phone..."
            v-model="filterBy.input"
            @input="onFilterChange('input', $event.target.value)"
            />
            <!-- As the v-model does not serve as a v-bind, we can only use the input event to listen to modify filterBy -->
        <span>
            <input
                type="checkbox"
                v-model="filterBy.men"
            />
                <label for="men">Men</label> <br>
            <input
                type="checkbox"
                v-model="filterBy.women"
            />
            <label for="women">Women</label> <br>
        </span>
        <select
            @change="onChange"
            v-model="filterBy.country"
        >
            <option value="All">All Countries</option>
            <option v-for="(country, index) of Array.from(countries)" :key="index" :value="country">{{country}}</option>
        </select>
        <div class="flex-grid">
            <div class="flex-column">
                <div class="flex-row">
                    <label>Min. age : {{ filterBy.minAge.toString().slice(0,4) }}</label>
                </div>
            </div>
            <div class="flex-column">
                <div class="flex-row">
                    <label>Max. age : {{ filterBy.maxAge.toString().slice(0,4) }}</label>
                </div>
            </div>
        </div>
        <br>
        <double-range-slider
            v-model="rangeValues"
            :minValue="0" :maxValue="100"
            minLabel="0" maxLabel="100"
            :dataArray="personsAgeList" :interval="10"
        ></double-range-slider>
        <skills-spider v-model="filterBy.skills" :maxLevel="5"></skills-spider>
        <div class="flex-grid">
            <div class="flex-column">
                <div class="flex-row">
                    <input type="radio" v-model="filterBy.availability" value="0">Available now
                </div>
            </div>
            <div class="flex-column">
                <div class="flex-row">
                    <input type="radio" v-model="filterBy.availability" value="1">Now or later
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import DoubleRangeSlider from './DoubleRangeSlider.vue';
    import SkillsSpider from './Spider';
    import {mapState} from 'vuex'

    export default {
    name: "filtering-section",
    props: ["skillSet"],
    components: {
        DoubleRangeSlider,
        SkillsSpider
    },
    data() {
        return {
            filterBy: {
                input: "",
                men: true,
                women: true,
                country: "All",
                minAge: 0,
                maxAge: 100,
                skills: undefined,
                availability: 1,
            },
        };
    },
    computed: {
        ...mapState(["persons", "countries"]),
        personsAgeList() {
            var ageList = [];
            for (let p of this.persons)
                ageList.push(p.dob.age);
            return ageList;
        },
        rangeValues: {
            get() {
                return {'lowValue':this.filterBy.minAge, 'highValue':this.filterBy.maxAge};
            },
            set(loHiValues) {
                this.filterBy.minAge = loHiValues.lowValue;
                this.filterBy.maxAge = loHiValues.highValue;
            }
        }
    },
    watch: {
        filterBy: {
            handler: function (value) {
                this.updateFilters();
            },
            deep: true
        },
        "skillSet": {
            handler(set) {
                if (set != undefined)
                    this.filterBy.skills = set;
            },
            deep: true,
            immediate: true
        },
        rangeValues(loHiValues) {
            this.filterBy.minAge = loHiValues.lowValue;
            this.filterBy.maxAge = loHiValues.highValue;
        }
    },
    methods: {
        onFilterChange(key, val) {
            console.log("filter has changed: ", key, val);
            // clone the object to a plain object, in order to keep reactivity encapsulated
            // this.$emit("input", { ...this.filterBy });
            // why ? => when we emit reactive object it's by reference, here it will mess with the vue component. Not necessary but more secure for APIs / framework
        },
        onChange(values) {
            console.log("change : ", values);
        },
        ageChange(callerRangeinputTag, rangeLimit, isMaximumTest) {
            var callerRangeinput = document.getElementsByClassName(callerRangeinputTag)[0];
            if (isMaximumTest && eval(callerRangeinput.value) < rangeLimit
                || !isMaximumTest && eval(callerRangeinput.value) > rangeLimit)
                callerRangeinput.setAttribute("style", callerRangeinput.style + "accent-color:DodgerBlue");
            else
                callerRangeinput.setAttribute("style", "accent-color:red");
        },
        updateFilters() {
            this.$emit("personsFiltering", this.filterBy);
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
    mounted() {
        let filters = this.$refs.filteringSection.children;
        Array.from(filters).forEach( (filter) => {
            if (filter.getBoundingClientRect().top > filters[0].getBoundingClientRect().top)
                filter.setAttribute("flex-line-breaker","");
                // NOTE : static classes cannot be changed after Vue initialized the component if boolean classLists are used too. => Hence the setAttribute. 
        })
    }
}
</script>

<style scoped lang="scss">
    @import "../styles/_colors.scss";

    * {
        // bad practice
    }

    .filtering-section {
        width:100%;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-content: left;
        background-color:darken(greenyellow, 20%);
        user-select: none;

        & * {
            vertical-align: middle;
            color:lightyellow;
            margin-right: 1em;
        }

        // &>* {
        [flex-line-breaker] {
            margin-top: 15px;
        }

        // better nest all elements within, so that the styles do not get applied globally
        // here - as you scpecified scope above it is safe, but when we use external styles files, better nest them to get them properly scoped
        // or add generic styles to stuff like input so that it is used accross

        /* NOTE : have root class for each component, it makes it safe if we move this code to another scss file for this component.
        Thus we avoid conflicts (e.g. several times "input", that appears too in other component).
        SCSS can become really messy, better be careful and precise and define classes everyhwere. */
        input {
            background-color: whitesmoke;
            margin: 2px;
            border-radius: 5px;
            color: green;
            pointer-events: all;

            &.range {
                height:15px;

                .max-input {
                    padding: 100px;
                    display: none;
                    direction: rtl;
                }
            }
        }
        select {
            background-color: #{$lightgreenyellow};
            border-radius: 8px;
            width: 100px;
            outline: none;

            &:focus, &:active, &::selection {
                border: 2px solid white;
            }

            option {
                background-color: #{$lightgreenyellow};
            }
        }
        label {
            top: 50%;
            padding: 0px;
            margin: 0px;
        }
        .flex-grid {
            align-items: left;
            flex-flow: column wrap;
            justify-content: flex-start;
        }
        .flex-row {
            flex: 0 0 7em;
            margin: 0px;
        }
        .flex-column {
            display: flex;
        }
    }
</style>

