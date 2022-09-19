<template>
    <div class="person-card">
        <img :src="person.picture.medium" alt="portrait" />
        <p>{{ person.name.first + " " + person.name.last }}</p>
    </div>
</template>

<script>
    export default {
        name: 'PersonCard',
        props: [
            'person'
        ]
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