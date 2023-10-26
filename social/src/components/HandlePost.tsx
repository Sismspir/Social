import { Ireplies, Ilikes, Iresult, Ipost } from './MyInterfaces.js'
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Iposts {
    postid: number,
    post_author: string,
    post_text: string,
    post_date: string,
    isshown: boolean,
    isedited: boolean,
    comments_shown: boolean,
    reply_shown: boolean,
    logimage: Blob,
}

function handlePost(props: { postId: number, action: string}) {
    const navigate = useNavigate();
    const currentDate = new Date();
    const [replies, setReplies] = useState<Ireplies[]>([]);
    const [postInfo, setPostInfo] = useState<Iposts[]>([]);
    const [postLikes, setPostLikes] = useState<Ilikes[]>([]);
    const formattedDate = currentDate.toISOString().split('T')[0];

    const [finalLikes, setFinalLikes] = useState<Iresult>({});
    const localVariable = localStorage.getItem("currentUser"); 
    const userid = localVariable != null ? JSON.parse(localVariable).logId : 0;
    const currentUser = localVariable != null ? JSON.parse(localVariable).logUser : "";

    const refreshPage = () => {
        navigate(0);
    }

    // like a post
    const likePost = async (postid: number) => {
        // send the query to the db
        try {
            const response = await axios.post(`http://localhost:3000/server/like/${postid}/${userid}`);
            console.log("post with id:", postid," was liked successfully!", response);
            refreshPage()
        } catch (error) {
            console.log(error);
        }
    };

    // dislike a post
    const dislikePost = async (postid: number) => {
        try {
            const response = await axios.delete(`http://localhost:3000/server/dislike/${postid}/${userid}`);
            console.log("my respons to dislike", response);
            refreshPage();
        } catch(err) {
            console.log(err);
        }
    };

    // edit the given post
    const handleOpenEdit = (id: number) => {
        setPostInfo((postInfo) => postInfo.map((post) =>
        post.postid === id ? { ...post, isedited: !post.isedited } : post
        ));
    };

        // show comments
        const handleComments = (postId: number) =>{
        setPostInfo((postInfo) => postInfo.map((post) =>
        // close the replies if open
        post.postid === postId ? { ...post, comments_shown: !post.comments_shown, reply_shown: (post.reply_shown === true ? false  : false)   } : post)
        ); 
    }

    // show reply input
    const handleReply = (postId: number) =>{
        setPostInfo((postInfo) => postInfo.map((post) =>
        // close the comments if open
        post.postid === postId ? { ...post, reply_shown: !post.reply_shown, comments_shown: (post.comments_shown === true ? false  : false)  } : post)
        ); 
    };

    // delete the given post
    const handleDelete = async (id: number) => {
        try {
            const response = await axios.delete(`http://localhost:3000/server/delete/${id}`);
            console.log(id," was deleted successfully!", response);
            refreshPage();
        } catch (error) {
            console.log(error);
        }
    };

    // show/hide the dropdown menu of its item
    const showMenu = (id: number) => {
        setPostInfo((postInfo) => postInfo.map((post) =>
            post.postid === id ? { ...post, isshown: !post.isshown } : post
        )
        ); 
    };
    
    // handle request 
    if (props.action = "like") {
        console.log("Action taken")
        likePost(props.postId);
    }

}
export default handlePost;