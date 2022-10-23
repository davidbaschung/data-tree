<template>
    <div class="selector-section">
        <!-- TODO : use a custom v-model compoennt -->
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
            id="myList"
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
        <double-range-slider
            :minValue="0" :maxValue="100" minLabel="0" maxLabel="100"
            :dataArray="personsAgeList" :interval="10"
            @lowValue="lowValueHandler" @highValue="highValueHandler"
        ></double-range-slider>
        <skills-spider v-model="filterBy.skills"></skills-spider>
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
    name: "selector-section",
    props: ["skillSet"],
    data() {
        return {
            filterBy: {
                input: "",
                men: true,
                women: true,
                country: "All",
                minAge: 0,
                maxAge: 100,
                skills: [
                    {key: "skill0", label:"skill 0", level:0},
                    {key: "skill1", label:"skill 1", level:0},
                    {key: "skill2", label:"skill 2", level:0},
                    {key: "skill3", label:"skill 3", level:0},
                    {key: "skill4", label:"skill 4", level:0},
                    {key: "skill5", label:"skill 5", level:0}
                ],
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
        }
    },
    methods: {
        onFilterChange(key, val) {
            console.log("filter has changed: ", key, val);
            // TODO question : why ?
            // clone the object to a plain object, in order to keep reactivity encapsulated
            // this.$emit("input", { ...this.filterBy });
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
        lowValueHandler(value) {
            this.filterBy.minAge = value;
        },
        highValueHandler(value) {
            this.filterBy.maxAge = value;
        }
    },
    created() {
        this.updateFilters();
    },
    components: {
        DoubleRangeSlider,
        SkillsSpider
    }
}
</script>

<style lang="scss">
    /* not scoped styles do apply globally */
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
    .selector-section {
        width:100%;
        display: flex;

        & * {
            vertical-align: middle;
        }
    }

    // TODO question : means scoping otherwise inside the scss?
  // better nest all elements within, so that the styles do not get applied globally
  // here - as you scpecified scope above it is safe, but when we use external styles files, better nest them to get them properly scoped
  // or add generic styles to stuff like input so that it is used accross
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
        padding: 0px;
        margin: 0px;
    }
    .flex-grid {
        align-items:left;
        flex-flow: column wrap;
        justify-content: flex-start;
    }
    .flex-row {
        flex: 0 0 7em;
        margin:0px;
    }
    .flex-column {
        display:flex;
    }
</style>

