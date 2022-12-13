import * as Constants from '/constants.js';

export const useCurUser=()=>{
    let userToken=useCookie("userToken");
    return useLazyFetch<User>(Constants.BACKEND+'/api/user/cur',{method:'GET',headers:{usertoken:userToken.value}});
}