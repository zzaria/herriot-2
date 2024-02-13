<script setup lang="ts">
import * as Constants from '/constants';
const userToken = useCookie("userToken");
const { data: curUser } = await useCurUser();

const route = useRoute();
const problemId = route.params.problemId;

const { data: problem, refresh } = await useFetch<ProblemData>(Constants.BACKEND + '/api/problem/' + problemId, { method: 'GET', headers: { usertoken: userToken.value } });
const status = ref("");
const save = async () => {
    const { error } = await useFetch(Constants.BACKEND + '/api/problem/' + problemId, { method: 'PUT', initialCache: false, headers: { usertoken: userToken.value }, body: { newProblem: problem.value } });
    console.log(error.value);
    if (error.value) {
        status.value = "Error";
    }
    else {
        status.value = "Success"
    }
};

onMounted(() => {
    refresh();
});
</script>

<template>
    <div class="">
        <Title>{{ problem.name }}</Title>
        <no-ssr>
            <n-layout>
                <n-layout-header bordered class="p-4">
                    <n-h1>Editing {{ problem.name }}</n-h1>
                    <NuxtLink :to="`/problem/${problemId}/`">
                        <n-button secondary type="error" round>Back</n-button>
                    </NuxtLink>
                </n-layout-header>
                <n-layout-content bordered class="p-4">
                    <n-space vertical>
                        <n-layout has-sider>
                            <n-layout-sider show-trigger="bar" collapse-mode="width" :collapsed-width="60">
                                External Identifier (for automatic problem adding)
                            </n-layout-sider>
                            <n-layout-content>
                                <n-input v-model:value="problem.external_id"></n-input>
                            </n-layout-content>
                        </n-layout>
                        <n-layout has-sider>
                            <n-layout-sider show-trigger="bar" collapse-mode="width" :collapsed-width="60">
                                Problem Name
                            </n-layout-sider>
                            <n-layout-content>
                                <n-input v-model:value="problem.name"></n-input>
                            </n-layout-content>
                        </n-layout>
                        <n-layout has-sider>
                            <n-layout-sider show-trigger="bar" collapse-mode="width" :collapsed-width="60">
                                Setters
                            </n-layout-sider>
                            <n-layout-content>
                                <n-input v-model:value="problem.setter"></n-input>
                            </n-layout-content>
                        </n-layout>
                        <n-layout has-sider>
                            <n-layout-sider show-trigger="bar" collapse-mode="width" :collapsed-width="60">
                                Thumbnail Link
                            </n-layout-sider>
                            <n-layout-content>
                                <n-input v-model:value="problem.thumbnail"></n-input>
                            </n-layout-content>
                        </n-layout>
                        <n-layout has-sider>
                            <n-layout-sider show-trigger="bar" collapse-mode="width" :collapsed-width="60">
                                Problem Statement
                            </n-layout-sider>
                            <n-layout-content>
                                <n-input type="textarea" v-model:value="problem.statement" :autosize="{ minRows: 3 }">
                                </n-input>
                            </n-layout-content>
                        </n-layout>
                        <n-layout has-sider>
                            <n-layout-sider show-trigger="bar" collapse-mode="width" :collapsed-width="60">
                                Tutorial
                            </n-layout-sider>
                            <n-layout-content>
                                <n-input type="textarea" v-model:value="problem.editorial" :autosize="{ minRows: 3 }">
                                </n-input>
                            </n-layout-content>
                        </n-layout>
                        <n-layout has-sider>
                            <n-layout-sider show-trigger="bar" collapse-mode="width" :collapsed-width="60">
                                Grader
                            </n-layout-sider>
                            <n-layout-content>
                                <n-input type="textarea" v-model:value="problem.judge"></n-input>
                            </n-layout-content>
                        </n-layout>
                        <n-layout has-sider>
                            <n-layout-sider show-trigger="bar" collapse-mode="width" :collapsed-width="60">
                                Solution Code
                            </n-layout-sider>
                            <n-layout-content>
                                <n-input type="textarea" v-model:value="problem.solution"></n-input>
                            </n-layout-content>
                        </n-layout>
                        <n-layout has-sider>
                            <n-layout-sider show-trigger="bar" collapse-mode="width" :collapsed-width="60">
                                Test Data
                            </n-layout-sider>
                            <n-layout-content>
                                <n-input type="textarea" v-model:value="problem.data"></n-input>
                            </n-layout-content>
                        </n-layout>
                        <n-layout has-sider>
                            <n-layout-sider show-trigger="arrow-circle" collapse-mode="width" :collapsed-width="60">
                                Difficulty
                            </n-layout-sider>
                            <n-layout-content>
                                <n-input-number v-model:value="problem.difficulty"></n-input-number>
                                <n-space justify="end">
                                    Lock Voting: <n-switch v-model:value="problem.difficulty_lock"></n-switch>
                                </n-space>
                            </n-layout-content>
                        </n-layout>
                        <n-layout has-sider>
                            <n-layout-sider show-trigger="arrow-circle" collapse-mode="width" :collapsed-width="60">
                                Quality
                            </n-layout-sider>
                            <n-layout-content>
                                <n-input-number v-model:value="problem.quality"></n-input-number>
                                <n-space justify="end">
                                    Lock Voting: <n-switch v-model:value="problem.quality_lock"></n-switch>
                                </n-space>
                            </n-layout-content>
                        </n-layout>
                        <n-layout has-sider>
                            <n-layout-sider show-trigger="arrow-circle" collapse-mode="width" :collapsed-width="60">
                                Delete
                            </n-layout-sider>
                            <n-layout-content>
                                <n-space justify="end">
                                    Hide Problem:
                                    <n-checkbox v-model:checked="problem.deleted"></n-checkbox>
                                </n-space>
                            </n-layout-content>
                        </n-layout>
                    </n-space>
                </n-layout-content>
                <n-layout-footer bordered class="p-4">
                    <n-space vertical>
                        <n-text :type="status == 'Success' ? 'success' : 'error'">
                            {{ status }}
                        </n-text>
                        <n-space>
                            <n-button ghost type="info" @click="save">Save</n-button>
                            <n-button ghost type="error" @click="refresh">Cancel</n-button>
                        </n-space>
                    </n-space>
                </n-layout-footer>
            </n-layout>
        </no-ssr>
    </div>
</template>
