<template>
    <div class="selected-section">
        <h3>Selected Persons :</h3>
        <br>
        <p v-if="this.persons.length == 0" class="sticker">Click on the cards to select persons</p>
        <TransitionGroup name="selected-list" tag="ul">
            <li v-for="(p, index) of this.persons" :key="index">
                {{p.name.first}} {{p.name.last}}
            </li>
        </TransitionGroup>
    </div>
</template>

<script>
    export default {
        props: [
            "persons"
        ],

    }
</script>

<style lang="scss">
    @import "../styles/_colors.scss";
        
    .selected-section {
        height: 100%;
        bottom: 0px;
        padding: 15px;
        background-color: $greenyellow;
        color: whitesmoke
    }
    .selected-list-enter {
        opacity: 0;
    }
    .selected-list-enter-active {
        transition: all 0.5s ease;
    }
    .selected-list-enter-to {
        opacity: 1;
    }
    .selected-list-leave {
        opacity: 1
    }
    .selected-list-leave-active {
        transition: all 0.5s ease;
    }
    .selected-list-leave-to {
        opacity: 0;
    }
    .sticker {
        padding: 5px;
        background-color: rgb(0, 214, 214);
        box-shadow: 0 0 5px -1px white;
        border-radius: 10px;
    }
</style>