<template>
    <div class="bg-glass-150 dark:bg-glass-900 p-2.5">
        <Title>Users</Title>
        <no-ssr>
            <n-card>
                <template #header>
                    <n-h1 prefix="bar">
                        <n-text type="success">Users</n-text>
                    </n-h1>
                </template>
                <n-space vertical v-if="!pending">
                    <n-data-table :columns="columns" :data="shownUsers" :pagination="pagination" striped
                        :single-line="false" :on-update:page="updPage" />
                    <n-input v-model:value="search" placeholder="Search" clearable />
                </n-space>
            </n-card>
        </no-ssr>
    </div>
</template>

<script setup lang="ts">
import RatedText from '~~/components/ratedText.vue';
import * as Constants from '/constants';
import { NA } from 'naive-ui';

const { pending, data: users, refresh } = useUsers();
const renderRating = (data, index) => {
    return h(RatedText, { size: 15, rating: data.power,  });
};
const router = useRouter();
const renderUsername = (data, index) => {
    return h(NA, { onClick: () => router.push(`/user/${data._id}`) }, data.username);
};
    
const page=ref(1);
const updPage = (p) => {
    page.value = p;
};
    
const columns = [
    { title: "Index", key: "id", sorter: 'default', render: (_, index) => (page.value-1)*10 + index + 1},
    { title: "Name", key: "username", sorter: 'default', render: renderUsername },
    { title: "Power", key: "power", sorter: 'default', defaultSortOrder: 'descend', render: renderRating },
    { title: "Level", key: "level", sorter: 'default' },
    { title: "Solved", key: "solved", sorter: 'default' },
];
const pagination = {
    pageSize: 10,
    showQuickJumper: true,
}
const search = ref("");
const shownUsers = computed(() => {
    let users2 = users.value.slice();
    users2 = users2.filter(user => {
        return user.username.toLowerCase().includes(search.value.toLowerCase());
    });
    return users2.map((user:any,index)=>{
        user.id = index + 1;
        user.level = Constants.EXP_TO_LEVEL(user.experience).level;
        return user;
    });
})
onMounted(() => { refresh(); });
</script>
