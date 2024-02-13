<script setup lang="ts">
import * as Constants from '/constants';
const filterDefault = {
	"search": "",
	"difficulty": Constants.DIFFICULTY_RANGE,
	"quality": Constants.QUALITY_RANGE,
	"hasEditorial":false,
	"hasCode":false,
	"hasData":false,
	"tags": null,
	"antiTags": null,
	"page": 1
};
let filterInit:ProblemFilter = Object.assign({}, JSON.parse(JSON.stringify(filterDefault)));

let route = useRoute();
for (const key in route.query) {
	if (Object.hasOwnProperty.call(route.query, key)) {
		let element:any = route.query[key];
		if (key == "difficulty" || key == "quality") {
			element = element.map(x => parseInt(x)) as number[];
		}
		if (key == "hasEditorial" || key == "hasCode" || key == "hasData") {
			element = element === "true";
		}
		filterInit[key] = element;
	}
}

let filterInit2:ProblemFilter = Object.assign({}, JSON.parse(JSON.stringify(filterDefault)));
let filter2 = useState("filter2", () => filterInit2);

let filter = useState("filter", () => filterInit);
const { data: publicTags } = usePublicTags();
const { data: curUser } = useCurUser();
const router=useRouter();
const updateUrl = () => {
	router.push({ query: filter.value });
};
const clearFilter = () => {
	Object.assign(filter2.value, filterDefault);
	router.push({ query: filter2.value });
}
onMounted(() => {
	Object.assign(filter2.value, filterInit);
});
const tagOptions = computed(() => {
	if(!publicTags.value){
		return [];
	}
	let tags = publicTags.value.map(tag => {
		return { label: tag.name, value: tag._id };
	});
	if (curUser.value && curUser.value.tags) {
		let tags2 = curUser.value.tags.map(tag => tag.tag);
		tags2 = tags2.map(tag => {
			return { label: tag.name, value: tag._id };
		});
		return [...new Set(tags.concat(tags2))];
	}
	return tags;
});
let searching;
watch(
	() => filter2.value,
	() => {
		clearTimeout(searching);
		searching = setTimeout(() => {
			Object.assign(filter.value, filter2.value);
		}, 300);
	},
	{ deep: true }
);
</script>
<template>
	<no-ssr>
		<div class="search column">
			<n-input type="text" placeholder="Search" v-model:value="filter2.search" clearable />
			<n-space vertical>
				<n-space>
					<n-checkbox v-model:checked="filter2.hasEditorial">Tutorial</n-checkbox>
					<n-checkbox v-model:checked="filter2.hasCode">Code</n-checkbox>
					<n-checkbox v-model:checked="filter2.hasData">Data</n-checkbox>
				</n-space>
				<h2>Difficulty</h2>
				<n-slider v-model:value="filter2.difficulty" range :min="Constants.DIFFICULTY_RANGE[0]"
					:max="Constants.DIFFICULTY_RANGE[1]" :step="1" />
				<n-grid x-gap="12" :cols="2">
					<n-gi>
						<n-input-number v-model:value="filter2.difficulty[0]" size="small" step="100" />
					</n-gi>
					<n-gi>
						<n-input-number v-model:value="filter2.difficulty[1]" size="small" step="100" />
					</n-gi>
				</n-grid>
				<h2>Quality</h2>
				<n-slider v-model:value="filter2.quality" range :min="Constants.QUALITY_RANGE[0]"
					:max="Constants.QUALITY_RANGE[1]" :step="1" />
				<n-grid x-gap="12" :cols="2">
					<n-gi>
						<n-input-number v-model:value="filter2.quality[0]" size="small" />
					</n-gi>
					<n-gi>
						<n-input-number v-model:value="filter2.quality[1]" size="small" />
					</n-gi>
				</n-grid>
				<h2>Any of these tags:</h2>
				<n-select v-model:value="filter2.tags" multiple filterable :options="tagOptions" />
				<h2>None of these tags:</h2>
				<n-select v-model:value="filter2.antiTags" multiple filterable :options="tagOptions" />
				<n-space>
					<n-button @click="updateUrl">Search</n-button>
					<n-button type="error" tertiary @click="clearFilter">Reset</n-button>
				</n-space>
			</n-space>
		</div>
	</no-ssr>
</template>
<style scoped>
h2{
	@apply font-bold dark:text-white;
}
</style>
