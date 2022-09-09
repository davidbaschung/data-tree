<template>
    <div id="main">
        <input id="nameInput" placeholder="Name, Mail, Phone" />
        <span>
            <input type="checkbox" v-model="men" /> <label for="men">Men</label> <br>
            <input type="checkbox" v-model="women" /> <label for="women">Women</label> <br>
        </span>
        <select id="myList" @change="onChange" v-model="selectedCountry">
            <option value="" disabled hidden>Countries</option>
            <option v-for="country of countries" :key="country" :value="null">{{country}}</option>
        </select>
        <div class="flex-grid">
            <div class="flex-row">
                <div class="flex-column">
                    <label>Min. age : {{ minAge }}</label>
                </div>
                <div class="flex-column">
                    <input id="minAgeInput" class="min-input" type="range" min="0" max="100" v-model="minAge" @input="ageChange('minAgeInput', maxAge, true)">
                </div>
            </div>
            <div class="flex-row">
                <div class="flex-column">
                    <label>Max. age : {{ maxAge }}</label>
                </div>
                <div class="flex-column">
                    <input id="maxAgeInput" class="max-input" type="range" min="0" max="100" v-model="maxAge" @input="ageChange('maxAgeInput', minAge, false)">
                </div>
            </div>
        </div>
    </div>
</template>

<script>
// import { Store } from 'vuex';
    export default {
        name: 'SelectorSection',
        data() {
            return {
                men: Boolean,
                women: Boolean,
                countries: ['a','b','c'],
                // TODO replace countries with getter from the store
                selectedCountry: "",
                minAge: 0,
                maxAge: 100, 
                
                // cities: ${Store.state.cities}
                // persons: 
            }
        },
        methods: {
            onChange () {
                console.log('city', this.$store.state.persons)
            },
            ageChange(callerRangeinputTag, rangeLimit, isMaximumTest) {
                var callerRangeinput = document.getElementById(callerRangeinputTag);
                if (isMaximumTest && eval(callerRangeinput.value) < rangeLimit
                    || ! isMaximumTest && eval(callerRangeinput.value) > rangeLimit)
                    callerRangeinput.setAttribute("style", callerRangeinput.style+"accent-color:DodgerBlue");
                else callerRangeinput.setAttribute("style", "accent-color:red");
            }
        }
    }
</script>

<style lang="scss"> // not scoped style applies globally
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
            display:flex;
        }
        &.flex-column {
            flex: 1;
            margin:0px;
        }
    }
</style>

