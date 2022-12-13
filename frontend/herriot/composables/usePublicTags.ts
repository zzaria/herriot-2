import * as Constants from '/constants.js';

export const usePublicTags=()=>{
    return useFetch<Tag[]>(Constants.BACKEND+'/api/tag',{method:'GET',params:{public:'true'}});
}