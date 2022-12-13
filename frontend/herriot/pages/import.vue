<script setup lang="ts">
import * as Constants from '/constants';
const userToken = useCookie("userToken");
const loading=ref(false);
const update=async ()=>{
    loading.value=true;
    await useFetch(Constants.BACKEND + '/api/import/', { method: 'POST', headers: { usertoken: userToken.value } });
    loading.value=false;
};
</script>
<template>
    <div class="bg-black w-1/2 p-10">
        <n-button @click="update">Update Problems</n-button>
        <n-text>{{loading? "Loading":"Done"}}</n-text>
    </div>
</template>

<style scoped>
h2 {
    @apply text-2xl font-bold dark:text-white;
}
</style>
