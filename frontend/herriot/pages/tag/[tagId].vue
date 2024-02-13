<script setup lang="ts">
import { NAvatar, NPopconfirm, NTag } from 'naive-ui';
import RatedText from '~~/components/ratedText.vue';
import * as Constants from '/constants';

const route = useRoute();
const tagId = route.params.tagId;
const userToken = useCookie("userToken");
const { data: curUser, refresh: refreshCurUser } = useCurUser();
const { data: publicTags } = useLazyFetch<Tag[]>(Constants.BACKEND + '/api/tag', { method: 'GET', params: { public: 'true' } });
let { data: userList } = useLazyFetch<User[]>(Constants.BACKEND + '/api/user', { method: 'GET' })
let { data: tag, refresh } = await useFetch<Tag>(Constants.BACKEND + '/api/tag/' + tagId, { method: 'GET', headers: { usertoken: userToken.value } });
let selected: string[];

let removeTag = user => {
    return async () => {
        await useFetch(Constants.BACKEND + '/api/taguser', {
            method: 'DELETE',
            params: {
                tag: tag.value._id,
                user,
            },
            headers: { usertoken: userToken.value },
            initialCache: false
        });
        refresh();
    }
}
const renderEditor = (user, index) => {
    const types = ['', 'success', 'warning', 'error', 'info'];
    if (userToken.value && user._id == curUser.value._id) {
        return h(NPopconfirm, {
            onPositiveClick: removeTag(user._id)
        }, {
            default: "Remove Yourself? (You will lose access)",
            trigger: h(NTag, {
                type: types[index % types.length],
                closable: true,
                triggerClickOnClose: true,
            }, { default: () => user.username, avatar: h(NAvatar, { src: user.profilePic }) })
        });
    }
    return h(NTag, {
        type: types[index % types.length],
        closable: userToken.value && curUser.value.perms >= Constants.PROBLEM_PERM,
        onClose: removeTag(user._id)
    }, { default: () => user.username, avatar: h(NAvatar, { src: user.profilePic }) });
}
const renderViewer = (user, index) => {
    const types = ['', 'success', 'warning', 'error', 'info'];
    return h(NTag, {
        type: types[index % types.length],
        closable: curUser.value.perms >= Constants.PROBLEM_PERM || user._id == curUser.value._id,
        round: true,
        onClose: removeTag(user._id)
    }, { default: () => user.username, avatar: h(NAvatar, { src: user.profilePic }) });
}
let showModal = ref(false), modalProblem = ref(null);

let problemColors = ref({});

const tagColor = ref("")

const editAccess = ref(userToken.value && curUser.value ? curUser.value.perms >= Constants.PROBLEM_PERM || curUser.value.tags.reduce((access, tag) =>
    tag.tag._id == tagId ? tag.access == 0 : access, false) : false)
const shownProblems = computed(() => {
    return tag.value.problems.sort((a, b) => a.index - b.index).map(p => p.problem);
});
const editors = computed(() => {
    return tag.value.users.filter(user => user.access == 0).map(user => user.user);
});
const viewers = computed(() => {
    return tag.value.users.filter(user => user.access == 1).map(user => user.user);
});
const noneditors = computed(() => {
    const current = new Set(editors.value.map(user => user._id));
    return userList.value.filter(user => !current.has(user._id)).map(user => { return { label: user.username, value: user._id } });
});
const nonviewers = computed(() => {
    const current = new Set(viewers.value.map(user => user._id));
    return userList.value.filter(user => !current.has(user._id)).map(user => { return { label: user.username, value: user._id } });
});
const editTag = async () => {
    await useFetch(Constants.BACKEND + '/api/tag/' + tagId, { method: 'PUT', initialCache: false, headers: { usertoken: userToken.value }, body: { newTag: tag.value } });
    refresh();
};
const addUser = async (user, access) => {
    await useFetch(Constants.BACKEND + '/api/taguser/', { method: 'POST', initialCache: false, headers: { usertoken: userToken.value }, params: { tag: tag.value._id, user, access } });
    refresh();
};
const editColor = async () => {
    await useFetch(Constants.BACKEND + '/api/taguser/', { method: 'PUT', initialCache: false, headers: { usertoken: userToken.value }, params: { tag: tag.value._id, color: tagColor.value } });
    refresh();
};
const levelUp = useState<number>("levelUp");
const addTag = async (tag) => {
    if (tag === "remove") {
        await useFetch(Constants.BACKEND + '/api/tagproblem', {
            method: 'DELETE',
            body: {
                tag: tagId,
                problems: selected
            },
            headers: { usertoken: userToken.value },
            initialCache: false
        });
        refresh();
    }
    else {
        await useFetch(Constants.BACKEND + '/api/tagproblem', {
            method: 'POST',
            body: {
                tag: tag,
                problems: selected
            },
            headers: { usertoken: userToken.value },
            initialCache: false
        });
        if (tag == curUser.value.solved_tag) {
            levelUp.value+=selected.length;
        }
    }
    await refreshCurUser();
    curUser.value.tags.forEach(tag => {
        if (tag.tag._id != tagId && tag.color) {
            tag.tag.problems.forEach(problem => {
                problemColors.value[problem.problem] = tag.color;
            })
        }
    });
};
const updateShown = async (object) => {
    let selected2 = $('.selected');
    if (selected2.length) {
        selected2 = selected2.map((i, el) => el.dataset.problem).toArray();
    } else {
        selected2 = [object.$trigger.attr('data-problem')];
        Sortable.utils.select(object.$trigger[0]);
    }
    selected = selected2;
};
let sortableList;

const tableSpin = ref(false);
const affixTop = ref(-10);//stops affix from breaking
const mobileView = ref(false);
onMounted(async () => {
    mobileView.value = window.innerWidth < 768;
    tableSpin.value = true;
    await refresh();
    tableSpin.value = false;
    if (!userToken.value) {
        return;
    }
    refreshCurUser();
    setTimeout(() => {
        const el = document.querySelector('#sortableList');
        if (!el) {
            return;
        }
        if (userToken.value && curUser.value) {
            curUser.value.tags.forEach(tag => {
                if (tag.tag._id != tagId && tag.color) {
                    tag.tag.problems.forEach(problem => {
                        problemColors.value[problem.problem] = tag.color;
                    })
                }
            });
            tagColor.value = userToken.value ? curUser.value.tags.reduce((color, tag) => tag.tag._id == tagId ? tag.color : color, "") : null;
        }
        affixTop.value = 40;
        let script = document.createElement('script')
        script.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/jquery-contextmenu/2.7.1/jquery.contextMenu.min.js')
        document.head.appendChild(script)
        script = document.createElement('script')
        script.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/jquery-contextmenu/2.7.1/jquery.ui.position.js')
        document.head.appendChild(script)

        sortableList = new Sortable(el, {
            multiDrag: true,
            selectedClass: "selected",
            multiDragKey: "CTRL",
            dataIdAttr: 'data-problem',
            handle: mobileView.value ? '.handle' : null,
            onSort: async evt => {
                let newOrder = sortableList.toArray();
                await useFetch(Constants.BACKEND + '/api/tagproblem', {
                    method: 'PUT',
                    initialCache: false,
                    headers: { usertoken: userToken.value },
                    body: { tag: tagId, newOrder: newOrder }
                });
            }
        });
        let publicTags2 = publicTags.value.reduce((items, tag) => { items[tag._id] = { name: tag.name }; return items; }, {});
        let privateTags = curUser.value.tags.filter(tag => tag.access == 0).map(tag => tag.tag).reduce((items, tag) => { items[tag._id] = { name: tag.name }; return items; }, {});
        let addTag2 = (tag) => addTag(tag);
        let show = (object) => updateShown(object);

        editAccess.value = curUser.value.perms >= Constants.PROBLEM_PERM || curUser.value.tags.reduce((access, tag) =>
            tag.tag._id == tagId ? tag.access == 0 : access, false);

        setTimeout(() => {
            $.contextMenu({
                selector: '.problemRow',
                className: "contextMenu",
                events: {
                    show
                },
                callback: addTag2,
                items: {
                    "remove": {
                        name: "Remove from " + tag.value.name,
                        icon: function () {
                            return 'context-menu-icon context-menu-icon-quit';
                        }
                    },
                    [curUser.value.solved_tag]: {
                        name: "Mark as Solved",
                        icon: "fa-check"
                    },
                    "sep1": "---------",
                    submenu: {
                        name: "Add Tag",
                        icon: "edit",
                        items: privateTags
                    },
                    submenu2: {
                        name: "Add Public Tag",
                        disabled: !userToken.value || curUser.value.perms < Constants.PROBLEM_PERM,
                        items: publicTags2
                    }
                }
            });
        }, 1000);
    }, 1000);
});
onBeforeUnmount(() => {
    try {
        sortableList.destroy();
        sortableList = null;
        $.contextMenu('destroy');
    } catch (error) {
        console.log(error);
    }
});
</script>

<template>
    <div class="flex flex-row-reverse">
        <div class="bg-glass-150 dark:bg-glass-600 p-2.5 w-full md:w-2/3">
            <Title>{{ tag.name }}</Title>
            <div v-if="tag" :style="`background-color:${tagColor}`" class="-mx-2.5 -mt-2.5 pt-2.5">
                <div :style="`background-image:url(${tag.banner ?? ''}); `" class="px-12 py-5 flex flex-row bg-cover">
                    <n-image v-if="tag.thumbnail" :src="tag.thumbnail"
                        class="h-36 w-36 shadow-[0_0_15px_0px_var(--tw-shadow-color),_0_0_6px_1px_var(--tw-shadow-color)] dark:shadow-white" />
                    <div class="ml-5" :class="{ 'text-white': tag.banner }">
                        <n-space vertical>
                            <h1 class="text-7xl font-light dark:text-white">{{ tag.name }}</h1>
                            <span class="font-semibold dark:text-white">
                                {{ shownProblems.length }} Problems
                                <n-divider vertical />
                                <span v-for="(user, index) in editors" class="font-bold">
                                    <NuxtLink :to="'/user/' + user._id">{{ (index == 0 ? "" : ", ") + user.username }}
                                    </NuxtLink>
                                </span>
                            </span>
                        </n-space>
                    </div>
                </div>
            </div>
            <n-spin :show="tableSpin">
                <table class="w-full text-base text-left font-light dark:text-white"
                    v-if="shownProblems && shownProblems.length > 0">
                    <thead class="sticky top-10 z-10">
                        <tr>
                            <th v-if="mobileView"></th>
                            <th class="p-0"><n-affix :top="affixTop" class="pl-3">#</n-affix></th>
                            <th class="p-0"><n-affix :top="affixTop" class="pl-3">Name</n-affix></th>
                            <th class="p-0"><n-affix :top="affixTop" class="pl-3">Difficulty</n-affix></th>
                            <th class="p-0"><n-affix :top="affixTop">Quality</n-affix></th>
                        </tr>
                    </thead>
                    <tbody id="sortableList" class="border-t-2 border-black dark:border-white">
                        <template v-for="(problem, index) in shownProblems">
                            <tr :data-problem="problem._id" class="problemRow dark:hover:bg-white/10">
                                <td v-if="mobileView" class="handle w-5"><svg xmlns="http://www.w3.org/2000/svg"
                                        xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24">
                                        <path d="M20 9H4v2h16V9zM4 15h16v-2H4v2z" fill="currentColor"></path>
                                    </svg></td>
                                <td class="pl-3 font-bold">{{ index + 1 }}</td>
                                <td class="p-3" :style="`background-color: ${problemColors[problem._id]};`">
                                    <span class="cursor-pointer"
                                        @click="() => { showModal = true; modalProblem = problem._id; }">
                                        {{ (problem.setter? (problem.setter+" - "):"")+problem.name }}
                                    </span>
                                </td>
                                <td class="pl-3">
                                    <RatedText size="20" :rating="problem.difficulty"></RatedText>
                                </td>
                                <td class="py-3">{{ problem.quality }}</td>
                            </tr>
                        </template>
                    </tbody>
                </table>
                <div v-else>
                    <p class="text-lg font-bold dark:text-white mb-5">
                        <span v-if="editAccess">
                            Find some
                            <NuxtLink to="/problem"><n-a>Problems</n-a></NuxtLink>
                            to add to the collection
                        </span>
                        <span v-else>No Problems</span>
                    </p>
                </div>
            </n-spin>
            <div v-if="tag && editAccess">
                <no-ssr>
                    <n-space vertical>
                        <n-input-group>
                            <n-input-group-label>Name</n-input-group-label>
                            <n-input v-model:value="tag.name"></n-input>
                        </n-input-group>
                        <n-space>
                            <n-input-group>
                                <n-input-group-label>Thumbnail</n-input-group-label>
                                <n-input v-model:value="tag.thumbnail" clearable></n-input>
                            </n-input-group>
                            <n-input-group>
                                <n-input-group-label>Banner</n-input-group-label>
                                <n-input v-model:value="tag.banner" clearable></n-input>
                            </n-input-group>
                        </n-space>
                        <n-input-group>
                            <n-input-group-label>Color</n-input-group-label>
                            <n-color-picker v-model:value="tagColor" />
                            <n-button-group>
                                <n-button type="warning" secondary @click="tagColor = null">Clear</n-button>
                                <n-button secondary round @click="editColor">Apply</n-button>
                            </n-button-group>
                        </n-input-group>
                        <n-checkbox v-model:checked="tag.spoiler">Spoiler</n-checkbox>
                        <n-checkbox v-model:checked="tag.public"
                            :disabled="!userToken || !curUser || curUser.perms < Constants.PROBLEM_PERM">Public
                        </n-checkbox>
                        <n-button type="primary" @click="editTag">Update</n-button>
                    </n-space>
                    <n-card title="Access">
                        Edit
                        <n-dynamic-tags :value="editors" :render-tag="renderEditor">
                            <template #input="{ submit, deactivate }">
                                <n-select placeholder="Add Editor" filterable :options="noneditors"
                                    @update:value="(value) => addUser(value, 0)" @blur="deactivate" />
                            </template>
                        </n-dynamic-tags>
                        View
                        <n-dynamic-tags :value="viewers" :render-tag="renderViewer">
                            <template #input="{ submit, deactivate }">
                                <n-select placeholder="Add Viewer" filterable :options="nonviewers"
                                    @update:value="(value) => addUser(value, 1)" @blur="deactivate" />
                            </template>
                        </n-dynamic-tags>
                    </n-card>
                </no-ssr>
            </div>
            <n-modal v-model:show="showModal">
                <div class="w-4/5 mx-auto mt-10">
                    <ProblemInfo :problem-id-prop="modalProblem" />
                </div>
            </n-modal>
        </div>
    </div>
</template>

<style scoped>
.n-affix--affixed {
    @apply bg-frostedglass-900 dark:bg-glass-600 static;
}
</style>
