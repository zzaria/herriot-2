export const BACKEND="http://localhost:3003";//"https://herriot-backend.onrender.com"
export const DIFFICULTY_RANGE=[-1000,5000];
export const QUALITY_RANGE=[0,5];
export const TagPageLimit=50;
export const VOTE_PERM=1;
export const PROBLEM_PERM=2;
export const ADMIN_PERM=3;
export const FEATURED_TAG="637591218ccc2168a0c7a3fc";
export const ANNOUNCEMENT_POST="63759201b650a668cc24c978";
export const EXP_TO_LEVEL= exp => {
    for(let i=1,prev=0;i<300;i++){
        let next=(Math.pow(2,i)-1)*1000;
        if(next>exp){
            return {level:i-1,progress:exp-prev,required:next-prev};
        }
        prev=next;
    }
}
export const RANDOM_THUMBNAIL = (id)=>{
    let hash=0,mod=19;
    for(let i=0;i<id.length;i++){
        hash=(hash*6+id.charCodeAt(i))%mod;
    }
    return "/images/thumbnails/"+Math.floor(hash+1);
};
export const prettyDate= (time)=> {
    time=time.substring(0,19);
    var date = new Date((time || "").replace(/-/g, "/").replace(/[TZ]/g, " ")),
        diff = (((new Date()).getTime() - date.getTime()) / 1000),
        day_diff = Math.floor(diff / 86400);
    var year = date.getFullYear(),
        month = date.getMonth()+1,
        day = date.getDate();

    if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31)
        return (
            year.toString()+'-'
            +((month<10) ? '0'+month.toString() : month.toString())+'-'
            +((day<10) ? '0'+day.toString() : day.toString())
        );

    var r =
    ( 
        (
            day_diff == 0 && 
            (
                (diff < 60 && "just now")
                || (diff < 120 && "1 minute ago")
                || (diff < 3600 && Math.floor(diff / 60) + " minutes ago")
                || (diff < 7200 && "1 hour ago")
                || (diff < 86400 && Math.floor(diff / 3600) + " hours ago")
            )
        )
        || (day_diff == 1 && "Yesterday")
        || (day_diff < 7 && day_diff + " days ago")
        || (day_diff < 31 && Math.ceil(day_diff / 7) + " weeks ago")
    );
    return r;
}
export const formatText=(str)=>{
    if(!str){
        return null;
    }
    str=str.replace(/(?:\r\n|\r|\n)/g, "<br>");

    const replacePattern1 = /((\s|^)(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    str = str.replace(replacePattern1, '<a class="text-sky-300" href="$1" target="_blank">$1</a>');

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    const replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    str = str.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

    return str;
}
