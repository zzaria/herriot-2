<script setup lang="ts">
const route = useRoute();
const problemId = route.params.problemId;

</script>

<template>
    <ProblemInfo :problemIdProp="problemId"/>
</template>
