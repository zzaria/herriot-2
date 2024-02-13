<script setup>
import * as Constants from '/constants';
const route = useRoute();
const postId = route.params.postId;
const problemId = route.params.problemId;
const userToken = useCookie("userToken");
let {data:posts} = await useFetch(Constants.BACKEND + '/api/post/', { method: 'GET', params: { problem: problemId } });
</script>

<template>
  <div class="bg-frostedglass-600 dark:bg-glass-900  p-2.5 ">
    <no-ssr>
      <comments :comments="posts" :problem="problemId" :postId="postId"></comments>
    </no-ssr>
  </div>

</template>
