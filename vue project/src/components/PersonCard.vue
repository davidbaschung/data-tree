<template>
    <div>
        <img :src="person.picture.medium" />
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

</style>