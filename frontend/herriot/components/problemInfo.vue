<script setup lang="ts">
import { NTag, NA } from 'naive-ui';
import * as Constants from '/constants';

const userToken = useCookie("userToken");
const { data: curUser } = await useCurUser();

const props = defineProps({
    problemIdProp: { required: true },
});
const problemId = props.problemIdProp;

let { data: difficultyVote, refresh:refreshDifficultyVote } = await useFetch(Constants.BACKEND + '/api/vote/', { method: 'GET', headers: { usertoken: userToken.value }, params: { type: 1, parent: problemId } });
let { data: qualityVote, refresh:refreshQualityVote } = await useFetch(Constants.BACKEND + '/api/vote/', { method: 'GET', headers: { usertoken: userToken.value }, params: { type: 2, parent: problemId } });
let { data: problem, refresh } = await useFetch<ProblemData>(Constants.BACKEND + '/api/problem/' + problemId, { method: 'GET', headers: { usertoken: userToken.value } });
let { data: allPublicTags } = await usePublicTags();
let { data: problemComments, refresh: refreshComments } = await useFetch<Post[]>(Constants.BACKEND + '/api/post/', { method: 'GET', params: { problem: problemId } });

let removeTag = tag => {
    return async () => {
        await useFetch(Constants.BACKEND + '/api/tagproblem', {
            method: 'DELETE',
            body: {
                tag: tag,
                problems: [problemId]
            },
            headers: { usertoken: userToken.value },
            initialCache: false
        });
        refresh();
    }
}
const router = useRouter();
const renderPublicTag = (tag, index: number) => {
    const types = ['', 'success', 'warning', 'error', 'info'];
    return h(NA, { onClick: () => router.push(`/tag/${tag._id}`) }, h(NTag, {
        type: types[index % types.length],
        closable: curUser.value && curUser.value.perms >= Constants.PROBLEM_PERM,
        bordered: false,
        onClose: removeTag(tag._id)
    }, () => tag.name));
}
const renderPersonalTag = (tag, index: number) => {
    const types = ['', 'success', 'warning', 'error', 'info']
    return h(NA, { onClick: () => router.push(`/tag/${tag._id}`) }, h(NTag, {
        type: types[index % types.length],
        closable: true,
        bordered: false,
        round: true,
        onClose: removeTag(tag._id)
    }, () => tag.name));
}
const noSpoiler = ref(true);

const shownPublicTags = computed(() => {
    return problem.value.tags.filter(tag => tag.public && (!noSpoiler.value || !tag.spoiler));
});
const publicTagOptions = computed(() => {
    const current = new Set(problem.value.tags.map(tag => tag._id));
    let tags = allPublicTags.value.filter(tag => !current.has(tag._id));
    return tags.map(tag => {
        return { label: tag.name, value: tag._id };
    });
});
const shownPersonalTags = computed(() => {
    const current = new Set(problem.value.tags.map(tag => tag._id));
    return curUser.value.tags.filter(tag => tag.access == 0).map(tag => tag.tag).filter(tag => current.has(tag._id));
});
const personalTagOptions = computed(() => {
    const current = new Set(problem.value.tags.map(tag => tag._id));
    let tags = curUser.value.tags.filter(tag => tag.access == 0).map(tag => tag.tag).filter(tag => !current.has(tag._id));
    return tags.map(tag => {
        return { label: tag.name, value: tag._id };
    });
});

const clearVote = async (type: 1 | 2) => {
    const params = {
        type,
        parent: problemId,
    };
    await useFetch(Constants.BACKEND + '/api/vote', { method: 'DELETE', initialCache: false, headers: { usertoken: userToken.value }, params: params });
    refresh();
    if (type == 1) {
        difficultyVote.value = null;
    }
    else if (type == 2) {
        qualityVote.value = null;
    }
};
const showSpoiler = () => {
    noSpoiler.value = false;
};
const levelUp = useState<number>("levelUp");
const newTag = async (value: string) => {
    await useFetch(Constants.BACKEND + '/api/tagproblem', {
        method: 'POST',
        body: {
            tag: value,
            problems: [problemId]
        },
        headers: { usertoken: userToken.value },
        initialCache: false
    });
    await refresh();
    if (value == curUser.value.solved_tag) {
        levelUp.value++;
    }
};
const loading = ref(false);
const electron = ref(false);
const version = ref("");
onMounted(async () => {
    loading.value = true;
    await refresh();
    await refreshComments();
    loading.value = false;
    await refreshDifficultyVote();
    await refreshQualityVote();
    electron.value = window.electronAPI != null;
    if(electron.value){
        version.value="Node "+window.electronAPI.node()+"|Chrome "+window.electronAPI.node()+"|Electron "+window.electronAPI.node();
    }
});

watch(() => difficultyVote.value,
    async (newVal, oldVal) => {
        const params = {
            type: 1,
            parent: problemId,
            value: newVal
        };
        if (newVal === null) {
            clearVote(1);
            return;
        }
        await useFetch(Constants.BACKEND + '/api/vote', { method: 'POST', initialCache: false, headers: { usertoken: userToken.value }, params: params });
        refresh();
    });
watch(() => qualityVote.value,
    async (newVal, oldVal) => {
        console.log(newVal);
        const params = {
            type: 2,
            parent: problemId,
            value: newVal
        };
        if (newVal === null) {
            clearVote(2);
            return;
        }
        await useFetch(Constants.BACKEND + '/api/vote', { method: 'POST', initialCache: false, headers: { usertoken: userToken.value }, params: params });
        refresh();
    });

const embedProblem = (problemLink) => {
    window.electronAPI.embedProblem(problemLink);
}
const unEmbed = () => {
    window.electronAPI.closeEmbed();
}

</script>


<template>
    <div class="grid md:grid-cols-7 gap-4 bg-frostedglass-600 dark:bg-glass-900 p-4">
        <Title>{{ problem.name }}</Title>
        <div class="col-span-5">
            <no-ssr>
                <n-layout has-sider sider-placement="right">
                    <n-layout>
                        <n-layout-header bordered class="p-4" id="problem">
                            <n-space justify="space-between">
                                <n-h1>
                                    <n-skeleton v-if="loading" />
                                    <span v-if="!loading">{{ problem.name }}</span>
                                </n-h1>
                                <NuxtLink :to="`/problem/${problemId}/`">
                                    <n-button type="tertiary" circle>
                                        <template #icon><n-icon>
                                            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a3.5 3.5 0 0 0 5 0l4-4a3.5 3.5 0 0 0-5-5l-.5.5"></path><path d="M14 10a3.5 3.5 0 0 0-5 0l-4 4a3.5 3.5 0 0 0 5 5l.5-.5"></path></g></svg>
                                        </n-icon></template>
                                    </n-button>
                                </NuxtLink>
                            </n-space>
                            <NuxtLink :to="`/problem/${problemId}/edit`">
                                <n-button secondary round type="primary"
                                    v-if="curUser && curUser.perms >= Constants.PROBLEM_PERM">Edit
                                </n-button>
                            </NuxtLink>
                        </n-layout-header>
                        <n-layout-content bordered class="p-4" id="statement">
                            <n-h2 prefix="bar">Problem Statement</n-h2>
                            <n-space vertical>
                                <n-skeleton text repeat="3" v-if="loading" />
                                <p v-html="Constants.formatText(problem.statement) || 'No Statement Available Yet'" v-else></p>
                                <n-card title="Public Tags">
                                    <n-button v-if="noSpoiler" @click="showSpoiler">Show Spoiler</n-button>
                                    <n-skeleton size="medium" v-if="loading" />
                                    <n-dynamic-tags :value="shownPublicTags" :render-tag="renderPublicTag"
                                        :disabled="!userToken || curUser.perms < Constants.PROBLEM_PERM" v-else>
                                        <template #input="{ submit, deactivate }">
                                            <n-select placeholder="Add Tag" filterable :options="publicTagOptions"
                                                @update:value="newTag" @blur="deactivate" />
                                        </template>
                                    </n-dynamic-tags>
                                </n-card>
                                <n-card v-if="userToken" title="Personal Tags">
                                    <n-skeleton size="medium" v-if="loading" />
                                    <n-dynamic-tags :value="shownPersonalTags" :render-tag="renderPersonalTag" v-else>
                                        <template #input="{ submit, deactivate }">
                                            <n-select placeholder="Add Tag" filterable :options="personalTagOptions"
                                                @update:value="newTag" @blur="deactivate" />
                                        </template>
                                    </n-dynamic-tags>
                                </n-card>
                            </n-space>
                        </n-layout-content>
                        <n-layout-footer bordered class="p-4" id="solution">
                            <n-h2 prefix="bar">Tutorial</n-h2>
                            <n-collapse>
                                <n-collapse-item title="Show" name="1">
                                    <div v-html="Constants.formatText(problem.editorial) || 'No Tutorial Available Yet'"></div>
                                </n-collapse-item>
                            </n-collapse>

                        </n-layout-footer>
                    </n-layout>
                    <n-layout-sider bordered content-style="padding: 24px;" class="hidden md:flex">
                        <n-space vertical>
                            <n-spin v-if="loading" size="large" />
                            <n-image :src="problem.thumbnail" v-else />
                            <n-anchor show-rail show-background>
                                <n-anchor-link title="Problem" href="#problem">
                                    <n-anchor-link title="Statement" href="#statement" />
                                    <n-anchor-link title="Solution" href="#solution" />
                                </n-anchor-link>
                                <n-anchor-link title="Comments" href="#comments" />
                            </n-anchor>
                            <n-skeleton v-if="loading" />
                            <ratedText :rating="problem.difficulty" size="25" v-else></ratedText>
                            <n-skeleton v-if="loading" />
                            <span v-else>
                                <n-rate allow-half readonly :value="problem.quality" size="large" />
                                {{ problem.quality ?? "None" }}
                            </span>
                            <div v-if="electron">
                                <n-space>
                                    <n-button @click="()=>embedProblem(problem.statement)">Open</n-button>
                                    <n-button @click="unEmbed">Close</n-button>
                                    <n-text>{{version}}</n-text>
                                </n-space>
                            </div>
                        </n-space>
                    </n-layout-sider>
                </n-layout>
            </no-ssr>
            <div id="comments">
                <n-h2>Comments</n-h2>
                <comments :problem="problemId" :comments="problemComments" />
            </div>
        </div>
        <div class="col-span-2">
            <n-card class="mb-4">
                <n-grid x-gap="12" y-gap="12" cols="2">
                    <n-gi span="2">
                        <n-card title="Submit/Judge">
                            <n-skeleton text v-if="loading" />
                            <span v-html="Constants.formatText(problem.judge) || 'None'" v-else />
                        </n-card>
                    </n-gi>
                    <n-gi>
                        <n-card title="Data">
                            <n-skeleton text repeat="2" v-if="loading" />
                            <span v-html="Constants.formatText(problem.data) || 'None'" v-else />
                        </n-card>
                    </n-gi>
                    <n-gi>
                        <n-card title="Code">
                            <n-skeleton text repeat="2" v-if="loading" />
                            <span v-html="Constants.formatText(problem.solution) || 'None'" v-else />
                        </n-card>
                    </n-gi>
                </n-grid>
            </n-card>
            <no-ssr>
                <n-card>
                    <n-space vertical>
                        <n-card>
                            <template #header>
                                Difficulty Vote
                            </template>
                            <div v-if="userToken">
                                <n-popover trigger="hover" placement="top-end">
                                    <template #trigger>
                                        <div>
                                            <n-slider v-model:value="difficultyVote" step="100"
                                                :min="Constants.DIFFICULTY_RANGE[0]"
                                                :max="Constants.DIFFICULTY_RANGE[1]" />
                                            <n-input-number v-model:value="difficultyVote" step="100" size="small"
                                                placeholder="Unrated" />
                                        </div>
                                    </template>
                                    <span>Your vote {{ problem.difficulty_lock ? "won't" : "will" }} be
                                        considered.</span>
                                </n-popover>
                            </div>
                            <div v-else>Login to vote</div>
                        </n-card>
                        <n-card>
                            <template #header>
                                Quality Vote
                            </template>
                            <div v-if="userToken">
                                <n-popover trigger="hover" placement="bottom">
                                    <template #trigger>
                                        <p>
                                            <n-rate v-model:value="qualityVote" clearable size="small" />
                                            {{ qualityVote }}
                                        </p>
                                    </template>
                                    <span>Your vote {{ problem.quality_lock ? "won't" : "will" }} be considered.</span>
                                </n-popover>
                            </div>
                            <div v-else>Login to vote</div>
                        </n-card>
                    </n-space>
                </n-card>
                <div class="sticky top-10">
                    <n-anchor show-rail show-background>
                        <n-anchor-link title="Problem" href="#problem">
                            <n-anchor-link title="Statement" href="#statement" />
                            <n-anchor-link title="Solution" href="#solution" />
                        </n-anchor-link>
                        <n-anchor-link title="Comments" href="#comments" />
                    </n-anchor>
                </div>
            </no-ssr>
        </div>
        <span class="text-sky-300"></span>
    </div>
</template>
