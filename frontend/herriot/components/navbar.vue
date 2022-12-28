<template>

	<!-- component -->
	<!-- This is an example component -->
	<div class="mx-auto">
		<nav class="bg-frostedglass-900 dark:bg-glass-600 fixed top-0 w-full z-10">
			<div class="container mx-auto flex flex-wrap items-center justify-between">
				<NuxtLink to="/" class="flex dark:text-white group hover:drop-shadow-lg">
					<span
						class="text-4xl mr-2 dark:group-hover:[text-shadow:0_0_1px_white,_0_0_2px_white,_0_0_5px_white]">⟁</span>
					<span
						class="self-center text-xl font-semibold whitespace-nowrap dark:group-hover:[text-shadow:0_0_1px_white,_0_0_2px_white,_0_0_3px_white]">
						ん
						<span class="dark:group-hover:text-black">Σ</span>
						尺 я
						<span class="dark:group-hover:text-black">𝒾 Ꭷ</span>
						₮
					</span>
				</NuxtLink>
				<div class="flex md:order-2">
					<div class="relative mr-3 md:mr-0 block">
						<span
							class="text-gray-400 hover:bg-gray-50 border-b border-gray-100 md:hover:bg-transparent md:border-0 block pl-3 pr-4 py-2 md:hover:text-gray-300 md:p-0">
							<NuxtLink v-if="curUser && curUser.username" :to="`/user/${curUser._id}`">
								<n-badge :value="levelUp" :dot="levelUp >= 5" @click="playLevelUp">
									<RatedText :rating="curUser.power" :special="curUser.username == 'oyster'"
										size="15">
										{{ curUser.username }}
									</RatedText>
								</n-badge>
							</NuxtLink>
							<NuxtLink v-else :to="`/login`">Login</NuxtLink>
						</span>
					</div>
				</div>
				<div class="flex md:order-2">
					<button data-collapse-toggle="mobile-menu-3" type="button"
						class="md:hidden text-gray-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-lg inline-flex items-center justify-center "
						aria-controls="mobile-menu-3" aria-expanded="false">
						<span class="sr-only">Open main menu</span>
						<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
							<path fill-rule="evenodd"
								d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
								clip-rule="evenodd"></path>
						</svg>
						<svg class="hidden w-6 h-6" fill="currentColor" viewBox="0 0 20 20"
							xmlns="http://www.w3.org/2000/svg">
							<path fill-rule="evenodd"
								d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
								clip-rule="evenodd"></path>
						</svg>
					</button>
				</div>
				<div class="hidden md:flex justify-between items-center w-full md:w-auto md:order-1" id="mobile-menu-3">
					<ul
						class="flex-col md:flex-row flex md:space-x-8 mt-4 md:mt-0 md:text-sm md:font-medium dark:text-slate-100">
						<li v-for="item in links">
							<span
								class="text-gray-400 hover:bg-gray-50 border-b border-gray-100 md:hover:bg-transparent md:border-0 block pl-3 pr-4 py-2 md:hover:text-gray-500 dark:md:hover:text-gray-300 md:p-0">
								<NuxtLink :to="item.link"
									active-class="bg-blue-700 md:bg-transparent text-black dark:text-white block pl-3 pr-4 py-2 md:p-0 rounded">
									{{ item.name }}</NuxtLink>
							</span>
						</li>
						<li>
							<span
								class="text-gray-400 hover:bg-gray-50 border-b border-gray-100 md:hover:bg-transparent md:border-0 block pl-3 pr-4 py-2 md:hover:text-gray-500 dark:md:hover:text-gray-300 md:p-0 cursor-pointer"
								@click="showAbout = true">
								About
							</span>
						</li>
					</ul>
				</div>
			</div>
		</nav>
		<n-drawer v-model:show="showAbout">
			<n-drawer-content title="Herriot">
				This is an website for programming contest problems. It puts problems from several sources
				along with their
				solution and test data in the same place. You can discuss and vote on the problems or
				organize them into lists.
				<n-collapse>
					<n-collapse-item title="Mechanics" name="2">
						<div>When you solve a problem, you can check it off by giving it the <n-text type="success">
								Solved</n-text> tag. Afterwards, you should vote. The difficulty is measured using
							codeforces rating. You should vote for a quality of 4 or 5 if the problem was fun, creative,
							elegant, brilliant. If the problem was boring, unoriginal, unnecessarily hard to implement,
							give a score of 1 or 2. You can also suggest improvements to the problem statement and test
							data in the comments.
						</div>
					</n-collapse-item>
					<n-collapse-item title="Contribute" name="3">
						<div>
							<p>If you have problem editing permissions, you can add new problems and fill in information
								for existing problems.</p>
							<p> You can also help write some scripts to automatically import problems or make general
								improvements to the website on <NuxtLink to="https://github.com/zzaria/herriot-2"><n-a>Github</n-a></NuxtLink>.</p>
						</div>
					</n-collapse-item>
					<n-collapse-item title="FAQ" name="4">
						<div>Couldn't think of any questions 💀</div>
					</n-collapse-item>
					<n-collapse-item title="App" name="5">
						<div><NuxtLink to="https://github.com/zzaria/herriot-2/releases/"><n-a>Download desktop app</n-a></NuxtLink></div>
					</n-collapse-item>
				</n-collapse>
			</n-drawer-content>
		</n-drawer>
		<n-modal v-model:show="showLevelUp" :mask-closable="false" preset="dialog" title="You solved it!"
			positive-text="Confirm" negative-text="wow">
			<n-space>
				<n-progress type="circle" status="success"
					:percentage="Math.round(Constants.EXP_TO_LEVEL(oldUser.experience).progress / Constants.EXP_TO_LEVEL(oldUser.experience).required * 10000) / 100">

				</n-progress>
				<n-space vertical>
					<n-space>
						<RatedText size="30" :rating="oldUser.power">
							<n-number-animation :from="oldUser.power" :to="curUser.power" />
						</RatedText>
						+ {{ Math.round(curUser.power - oldOldUser.power) }}
					</n-space>
					<n-space>
						<n-statistic label="Level"
							:value="Constants.EXP_TO_LEVEL(oldUser.experience).level"></n-statistic>
						+ {{ curUser.experience - oldOldUser.experience }}
					</n-space>
				</n-space>
			</n-space>
		</n-modal>
	</div>
</template>


<script setup lang="ts">
import { Ref } from 'vue';
import * as Constants from '/constants';

let userToken = useCookie("userToken");
let { data: curUser, refresh } = useCurUser();
const links = [
	{ link: '/', name: 'Home' },
	{ link: '/problem', name: 'Problems' },
	{ link: '/tag', name: 'Collections' },
	{ link: '/user', name: 'Users' },
]
onMounted(() => {
	let script = document.createElement('script')
	script.setAttribute('src', 'https://unpkg.com/@themesberg/flowbite@1.1.1/dist/flowbite.bundle.js')
	document.head.appendChild(script)
});
const showAbout = ref(false);
const showLevelUp = ref(false);
const levelUp = useState("levelUp", () => 0);
const oldUser = ref(JSON.parse(JSON.stringify(curUser.value)));
const oldOldUser = ref();
const playLevelUp = () => {
	if (levelUp.value == 0) {
		return;
	}
	oldOldUser.value = JSON.parse(JSON.stringify(oldUser.value));
	showLevelUp.value = true;
	levelUp.value = 0;
	setTimeout(async () => {
		await refresh();
		setTimeout(() => {
			oldUser.value = JSON.parse(JSON.stringify(curUser.value));
		}, 2000);
	}, 500);
};
</script>

