<template>
    <!-- <div> -->
        <span v-if="this.person">
            <div class="person-card" @click="selectCheckBox($event)">
                <img :src="person.picture.medium" alt="portrait" />
                <input type="checkbox" ref="checkbox" :value="person.isSelected" />
                <p>{{ this.person.name.first + " " + this.person.name.last }}</p>
            </div>
        </span>

        <!-- Vue 3 only -->
        <!-- <Teleport to="div.selected-persons" :disabled=" ! isSelected">
            <div>
                <div style="width: 100px; height: 100px; background-color: red">
                    Teleported
                </div>
            </div>
        </Teleport> -->
    <!-- </div> -->
</template>

<script>
    export default {
        name: 'PersonCard',
        props: [
            'value',
        ],
        data() {
            return {
                person: Object
            }
        },
        emits: [ 'input' ],
        methods: {
            selectCheckBox(event) {
                this.$refs.checkbox.checked = ! this.$refs.checkbox.checked;
                this.person.isSelected = this.$refs.checkbox.checked;
                this.$emit("input", this.person);
            }
        },
        watch: {
            value: {
                handler(person) {
                    this.person = person;
                },
                immediate: true
            }
        },
        updated() {
            this.$refs.checkbox.checked = this.person.isSelected;
        }
    }
</script>

<style>
    div.person-card {
        border-radius:13px;
        background-color: yellowgreen;
        margin: 0.5em;
        padding: 0.5em;
        border: 5px solid green;
        width: 7em;
        height: 7em;
    }

    div.person-card:hover {
        cursor: pointer;
    }

    input[type='checkbox'] {
        top: 0px;
        float:right;
        pointer-events: none;
    }
</style>