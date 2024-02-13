
<script setup>
import * as Constants from '/constants';
const userToken = useCookie("userToken");
const { data: curUser, refresh } = await useCurUser();
const { data: publicTags, refresh: refreshPublicTags } = await usePublicTags();
const processTags = (tags, search) => {
    tags = tags.filter(tag => tag.name.toLowerCase().includes(search.toLowerCase()));
    for (let i = 0; i < tags.length; i++) {
        if (!tags[i].thumbnail) {
            tags[i].thumbnail = Constants.RANDOM_THUMBNAIL(tags[i]._id);
        }
    }
    return tags;
}
const search = ref("");
const router=useRouter();
const newTag = async () => {
    const { data: id } = await useFetch(Constants.BACKEND + '/api/tag', { method: 'POST', initialCache: false, headers: { usertoken: userToken.value } });
    router.push(`/tag/${id.value}`);
}
const shownPublicTags = computed(() => {
    if(!publicTags.value) return [];
    return processTags(publicTags.value.slice(), search.value);
});
const shownSharedTags = computed(() => {
    let tags = curUser.value.tags.filter(tag => tag.access == 1).map(tag => tag.tag);
    return processTags(tags, search.value);
});
const shownPersonalTags = computed(() => {
    let tags = curUser.value.tags.filter(tag => tag.access == 0).map(tag => tag.tag);
    return processTags(tags, search.value);
});

onMounted(() => {
    refresh();
    refreshPublicTags();
});
</script>


<template>
    <div class="bg-frostedglass-600 dark:bg-glass-900 p-2.5">
        <Title>Collections</Title>
        <h1>Collections</h1>
        <n-input v-model:value="search" placeholder="Search" clearable />
        <template v-if="userToken">
            <h2>Personal</h2>
            <div class="grid grid-cols-2 md:grid-cols-7 3xl:grid-cols-9 gap-4">
                <div v-for="tag in shownPersonalTags">
                    <no-ssr>
                        <NuxtLink :to="`/tag/${tag._id}`">
                            <n-card hoverable>
                                <template #cover>
                                    <img :src="tag.thumbnail">
                                </template>
                                <template #header>
                                    <n-ellipsis line-clamp="1">{{ tag.name }}</n-ellipsis>
                                </template>
                            </n-card>
                        </NuxtLink>
                    </no-ssr>
                </div>
                <no-ssr>
                    <n-card title="New Collection" hoverable class="h-full">
                        New Collection New Collection New New New New New Collection
                        <template #action>
                            <n-button tertiary type="primary" @click="newTag" class="w-full">
                                <n-ellipsis>Create Collection</n-ellipsis>
                            </n-button>
                        </template>
                    </n-card>
                </no-ssr>
            </div>
            <div v-if="shownSharedTags.length > 0">
                <h2>Shared</h2>
                <div class="grid grid-cols-2 md:grid-cols-7 3xl:grid-cols-9 gap-4">
                    <div v-for="tag in shownSharedTags">
                    <no-ssr>
                        <NuxtLink :to="`/tag/${tag._id}`">
                            <n-card hoverable>
                                <template #cover>
                                    <img :src="tag.thumbnail">
                                </template>
                                <template #header>
                                    <n-ellipsis line-clamp="1">{{ tag.name }}</n-ellipsis>
                                </template>
                            </n-card>
                        </NuxtLink>
                    </no-ssr>
                    </div>
                </div>
            </div>
        </template>
        <div v-if="shownPublicTags.length > 0">
            <h2>Public</h2>
            <div class="grid grid-cols-2 md:grid-cols-7 3xl:grid-cols-9 gap-4">
                <div v-for="tag in shownPublicTags">
                    <no-ssr>
                        <NuxtLink :to="`/tag/${tag._id}`">
                            <n-card hoverable>
                                <template #cover>
                                    <img :src="tag.thumbnail">
                                </template>
                                <template #header>
                                    <n-ellipsis line-clamp="1">{{ tag.name }}</n-ellipsis>
                                </template>
                            </n-card>
                        </NuxtLink>
                    </no-ssr>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
h1{
    @apply text-4xl font-bold dark:text-white;
}
h2{
    @apply text-2xl font-bold dark:text-white;
}
</style>