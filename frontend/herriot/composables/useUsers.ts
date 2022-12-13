import * as Constants from '/constants.js';

export const useUsers=()=>{
    return useFetch<User[]>(Constants.BACKEND+'/api/user',{method:'GET'});
}