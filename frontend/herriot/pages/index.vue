<script setup lang="ts">
import * as Constants from '/constants';
const userToken = useCookie("userToken");
let { data: curUser } = useCurUser();
let { data: announcements } = useLazyFetch<Array<Post>>(Constants.BACKEND + '/api/post/', { method: 'GET', params: { problem: Constants.ANNOUNCEMENT_POST } });
let { data: featuredProblems } = useLazyFetch<Tag>(Constants.BACKEND + '/api/tag/' + Constants.FEATURED_TAG, { method: 'GET' });

let { data: newProblems } = useLazyFetch<{ results: Problem[] }>(Constants.BACKEND + '/api/problem', {
    method: 'Get', initialCache: false,
    query: { filter: JSON.stringify({ sortKey: "createdAt", sortOrder: "descend" }) }
});

let { data: recommendedProblems } = useLazyFetch<Problem>(Constants.BACKEND + '/api/problem', {
    method: 'Get', initialCache: false,
    query: { filter: JSON.stringify({ sortKey: "random" }) }
});
const insertThumbnail = (problems) => problems.map(problem => {
    if(problem.thumbnail==""){
        problem.thumbnail=null;
    }
    problem.thumbnail ??= Constants.RANDOM_THUMBNAIL(problem._id);
    return problem;
});
const shownNewProblems = computed(() => {
    if (!newProblems.value) {
        return [];
    }
    return insertThumbnail(newProblems.value.results.slice(0, 5));
})
const shownfeaturedProblems = computed(() => {
    if (!featuredProblems.value) {
        return [];
    }
    return insertThumbnail(featuredProblems.value.problems.sort((a, b) => a.index - b.index).map(p => p.problem));
})
const shownrecommendedProblems = computed(() => {
    if (!recommendedProblems.value) {
        return [];
    }
    return insertThumbnail(recommendedProblems.value);
});
const shownAnnouncements=computed(()=>{
    if(!announcements.value){
        return [];
    }
    let ret=[...announcements.value];
    ret.reverse();
    return ret;
});
</script>
<template>
    <div class="flex flex-col-reverse md:flex-row">
        <Title>Home</Title>
        <div class="md:w-2/5 bg-frostedglass-150 dark:bg-glass-600 p-2.5">
            <n-h1>Welcome{{ curUser && curUser.username ? ", " + curUser.username : "" }}</n-h1>
            <Comments :comments="shownAnnouncements" :problem="Constants.ANNOUNCEMENT_POST"
                noChildren />
        </div>
        <div class="md:w-3/5 bg-frostedglass-600 dark:bg-glass-900 p-2.5">
            <n-space vertical>
                <h2>Featured</h2>
                <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                    <div v-for="problem in shownfeaturedProblems">
                        <NuxtLink :to="`/problem/${problem._id}`">
                            <n-card hoverable :title="problem.name">
                                <template #cover>
                                    <img :src="problem.thumbnail">
                                </template>
                            </n-card>
                        </NuxtLink>
                    </div>
                </div>
                <h2>New</h2>
                <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                    <div v-for="problem in shownNewProblems">
                        <NuxtLink :to="`/problem/${problem._id}`">
                            <n-card hoverable :title="problem.name">
                                <template #cover>
                                    <img :src="problem.thumbnail">
                                </template>
                            </n-card>
                        </NuxtLink>
                    </div>
                </div>
                <h2>Recommended</h2>
                <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                    <div v-for="problem in shownrecommendedProblems">
                        <NuxtLink :to="`/problem/${problem._id}`">
                            <n-card hoverable :title="problem.name">
                                <template #cover>
                                    <img :src="problem.thumbnail">
                                </template>
                            </n-card>
                        </NuxtLink>
                    </div>
                </div>
            </n-space>
        </div>
    </div>
</template>

<style scoped>
h2 {
    @apply text-2xl font-bold dark:text-white;
}
</style>
