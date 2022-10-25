<template>
    <!-- <div> -->
        <div class="person-card">
            <img :src="person.picture.medium" alt="portrait" />
            <p>{{ person.name.first + " " + person.name.last }}</p>
        </div>

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
            'person'
        ],
        data() {
            return {
                isSelected: true
                //TODO false
            }
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
</style>