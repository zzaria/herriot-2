declare global{
    interface User{
        _id:string
        username:string,
        profilePic:string,
        power:number,
        experience:number,
        solved:number,
        perms?:number,
        description?:string,
        tags?:{
            tag:Tag,
            access:number,
            color?:string,
        }[],
        solved_tag?:string,
    };
    interface Tag{
        _id:string,
        public:boolean,
        spoiler:boolean,
        name:string,
        thumbnail?:string,
        banner?:string,
        problems?:{
            problem:Problem,
            index:number,
        }[],
        users?:{
            access:number,
            user:User,
        }[],
    }
    interface Problem{
        _id:string,
        external_id?:string,
        name:string,
        setter?:string,
        thumbnail?:string,
        difficulty?:number,
        quality?:number,
        difficulty_lock:boolean,
        quality_lock:boolean,
        deleted:boolean,
    }
    interface ProblemData extends Problem{
        judge?:string,
        statement?:string,
        editorial?:string,
        solution?:string,
        data?:string,
        tags:Tag[],
    }
    interface ProblemFilter{
        search?:string,
        difficulty?:[number,number],
        quality?:[number,number],
        tags?:string[],
        antiTags?:string[],
        hasEditorial?: boolean,
        hasCode?: boolean,
        hasData?: boolean,
        page?:number,
        sortKey?:string,
        sortOrder:string,
    }
    interface Post{
        title:string,
        content:string,
        author:string,
        parent?:string,
        problem?:string,
        score:number,
    }
}
export {};