<script setup lang="ts">
import RatedText from './ratedText.vue';
import * as Constants from '/constants';
const userToken = useCookie("userToken");
interface ProblemApiReturn {
    count: number,
    results: Problem[]
}
let { pending, data: problems, refresh } = useLazyFetch<ProblemApiReturn>(Constants.BACKEND + '/api/problem', { method: 'GET' });
const { data: publicTags } = useLazyFetch<Tag[]>(Constants.BACKEND + '/api/tag', { method: 'GET', params: { public: 'true' } });
const { pending: pendingCurUser, data: curUser, refresh: refreshCurUser } = useCurUser();

const filter = useState<ProblemFilter>("filter");
const route = useRoute();

let problemColors = ref({}), showModal = ref(false), modalProblem = ref(null);

const renderRating = (data, index) => {
    return h(RatedText, { rating: data.difficulty, size: 15 });
};
const renderName = (data, index) => {
    return h("div", { style: `background-color: ${problemColors.value[data._id]}; padding: 0.33rem; margin-top:-1px;` },
        h("span", { class: "cursor-pointer", onClick: () => { showModal.value = true; modalProblem.value = data._id; } }, (data.setter? (data.setter+" - "):"")+data.name));
};
const rowProps = (row) => {
    return { "data-problem": row._id, class: "problemRow" };
}
const renderIndex = (data, index) => (filter.value.page ?? 1) * 200 - 200 + index + 1;
const columns = [
    { title: "#", key: "id", sorter: 'default', render: renderIndex },
    { title: "Name", key: "name", sorter: 'default', render: renderName, className: '!p-0 w-1/2 md:w-3/4' },
    { title: "Difficulty", key: "difficulty", sorter: 'default', render: renderRating },
    { title: "Quality", key: "quality", sorter: 'default' },
];
const pagination = reactive({
    pageSize: 200,
    showQuickJumper: true,
    pageCount: computed(() => Math.ceil(problems.value.count / 200)),
});
const table = ref(null);

const selected = ref([]);


const router = useRouter();
const newProblem = async () => {
    const { data: id } = await useFetch(Constants.BACKEND + '/api/problem', { method: 'POST', initialCache: false, headers: { usertoken: userToken.value } });
    router.push(`/problem/${id.value}`);
};
const updSort = (option) => {
    filter.value.sortKey = option.columnKey;
    filter.value.sortOrder = option.order;
};
const updPage = (page) => {
    filter.value.page = page;
};

const levelUp = useState<number>("levelUp");
const addTag = async (tag) => {
    await useFetch(Constants.BACKEND + '/api/tagproblem', {
        method: 'POST',
        body: {
            tag: tag,
            problems: selected.value
        },
        headers: { usertoken: userToken.value },
        initialCache: false
    });
    if (tag == curUser.value.solved_tag) {
        levelUp.value+=selected.value.length;
    }
    await refreshCurUser();
    curUser.value.tags.forEach(tag => {
        if (tag.color) {
            tag.tag.problems.forEach(problem => {
                problemColors.value[problem.problem] = tag.color;
            })
        }
    });
};
const updateShown = (object) => {
    let selected2 = $('.selected');
    if (selected2.length) {
        selected2 = selected2.map((i, el) => el.dataset.problem).toArray();
    } else {
        selected2 = [object.$trigger.attr('data-problem')];
        Sortable.utils.select(object.$trigger[0]);
    }
    selected.value = selected2;
};
onMounted(() => {
    refresh();
    if (filter.value.sortKey && filter.value.sortOrder) {
        table.value.sort(filter.value.sortKey, filter.value.sortOrder);
    }
    setTimeout(() => {
        let script = document.createElement('script')
        script.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/jquery-contextmenu/2.7.1/jquery.contextMenu.min.js')
        document.head.appendChild(script)
        script = document.createElement('script')
        script.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/jquery-contextmenu/2.7.1/jquery.ui.position.js')
        document.head.appendChild(script)
        let el = document.querySelector('.n-data-table-tbody');
        if (!el) {
            return;
        }
        if (!userToken.value) {
            return;
        }
        curUser.value.tags.forEach(tag => {
            if (tag.color) {
                tag.tag.problems.forEach(problem => {
                    problemColors.value[problem.problem] = tag.color;
                })
            }
        });
        if(window.innerWidth >= 768){
            Sortable.create(el, {
                multiDrag: true,
                selectedClass: "selected",
                multiDragKey: "CTRL",
                sort: false,
            });
        }
        let publicTags2 = publicTags.value.reduce((items, tag) => { items[tag._id] = { name: tag.name }; return items; }, {});
        let privateTags = curUser.value.tags.filter(tag => tag.access == 0).map(tag => tag.tag).reduce((items, tag) => { items[tag._id] = { name: tag.name }; return items; }, {});
        let addTag2 = (tag) => addTag(tag);
        let show = (object) => updateShown(object);
        setTimeout(() => {
            $.contextMenu({
                selector: '.problemRow',
                className: "contextMenu",
                events: {
                    show
                },
                callback: addTag2,
                items: {
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
                        disabled: curUser.value.perms < Constants.PROBLEM_PERM,
                        items: publicTags2
                    }
                }
            });
        }, 100);
    }, 1500);
});
onBeforeUnmount(() => {
    try {
        $.contextMenu('destroy');
    } catch (error) {
        console.log(error);
    }
});
watch(() => filter.value,
    async (newVal, oldVal) => {
        const { data: problems2 } = await useFetch<ProblemApiReturn>(Constants.BACKEND + '/api/problem', {
            method: 'Get', initialCache: false, headers: { usertoken: userToken.value },
            query: { filter: JSON.stringify(newVal) }
        });
        if (problems2.value.count != problems.value.count) {
            filter.value.page = 1;
        }
        problems.value = problems2.value;
        setTimeout(() => {
            let el = document.querySelector('.n-data-table-tbody');
            if (!el) {
                return;
            }
            if(window.innerWidth >= 768){
                Sortable.create(el, {
                    multiDrag: true,
                    selectedClass: "selected",
                    multiDragKey: "CTRL",
                    sort: false,
                });
            }
        }, 300);
    },
    { deep: true }
);
</script>



<template>
    <n-space justify="space-between" v-if="!pending">
        <n-button secondary type="info" @click="newProblem"
            v-if="curUser && curUser.perms >= Constants.PROBLEM_PERM">New
            Problem</n-button>
        <n-text depth="3">{{ problems.count }} Problems</n-text>
    </n-space>
    <no-ssr>
        <n-space justify="center" v-if="pending">
            <n-spin />
            <n-spin size="small" />
            <n-spin />
        </n-space>
        <n-data-table remote id="problemList" class="bg-transparent" ref="table" :columns="columns"
            :data="problems.results" :rowProps="rowProps" :pagination="pagination" :on-update:sorter="updSort"
            :on-update:page="updPage" v-if="!pending" />
    </no-ssr>

    <n-modal v-model:show="showModal">
        <div class="w-4/5 mx-auto mt-10">
            <ProblemInfo :problem-id-prop="modalProblem" />
        </div>
    </n-modal>
</template>

<style scoped>
:deep(.n-data-table .n-data-table-table),
:deep(.n-data-table-thead),
:deep(.n-data-table .n-data-table-th),
:deep(.n-data-table-td) {
    background-color: transparent !important;
    border-collapse: collapse !important;
}

:deep(.n-data-table-td),
:deep(.n-data-table-th) {
    padding: 0.25rem;
}

:deep(.n-data-table-td) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
}

:deep(.n-data-table-th) {
    font-weight: 700 !important;
    border: none !important;
}

:deep(.n-data-table-wrapper) {
    border: none !important;
}

:deep(.n-data-table-tbody) {
    @apply border-t-2 border-black dark:border-white;
}
</style>
