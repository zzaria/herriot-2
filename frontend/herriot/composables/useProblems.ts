import * as Constants from '/constants.js';

export const useProblems=()=>{
    return useLazyFetch(Constants.BACKEND+'/api/problem',{method:'GET'});
}