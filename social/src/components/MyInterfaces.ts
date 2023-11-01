
interface Iuser {
    username: string,
    password: string,
}

interface Ipost {
    postid: number | null,
    post_author: string | null,
    post_text: string,
    post_date: string,
    isshown: boolean,
    isedited: boolean,
    comments_shown: boolean,
    reply_shown: boolean,
}

interface Iposts {
    postid: number,
    post_author: string,
    post_text: string,
    post_date: string,
    isshown: boolean,
    isedited: boolean,
    logimage: Blob,
}

interface Ireplies {
    id: number,
    post_id: number,
    username: string,
    text: string,
    date: string,
    pdate: string,
}

interface Ilikes {
    user_id: number,
    post_id: number,
}

interface Iresult {
    [postId: string]: number;
}


export type { Iuser, Ipost, Iposts, Ireplies, Ilikes, Iresult };