import { useParams } from "react-router-dom";
import { SlUserFollow as Follow } from 'react-icons/Sl';
import { SlUserFollowing as Unfollow } from 'react-icons/Sl';
import { LiaCommentsSolid as Comment } from 'react-icons/Lia';
import { AiFillDislike as Dislike} from 'react-icons/Ai';
import { RiReplyAllLine as Reply } from 'react-icons/Ri';
import { AiFillLike as Like} from 'react-icons/Ai'
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {Buffer} from 'buffer';
import ReactPaginate from 'react-paginate';
import { FormEvent, ChangeEvent } from 'react';
import Navbar from './Navbar';
import axios from 'axios';
import { Ireplies, Ilikes, Iresult } from './MyInterfaces.js'

interface Iposts {
    postid: number,
    post_author: string,
    post_text: string,
    post_date: string,
    isshown: boolean,
    isedited: boolean,
    comments_shown: boolean,
    reply_shown: boolean,
};

interface Ifollow {
    followId: number,
    followerId: number,
    followingId: number,
};

function User() {

    const { givenUser } = useParams<{ givenUser: string}>(); 
    const [givenUserId, setGivenUserId] = useState<number>(0);
    const [userImage, setUserImage] = useState<Blob>();
    const [postInfo, setPostInfo] = useState<Iposts[]>([]);
    const [replies, setReplies] = useState<Ireplies[]>([]);
    const [postLikes, setPostLikes] = useState<Ilikes[]>([]);
    const [finalLikes, setFinalLikes] = useState<Iresult>({});
    const [follows, setFollows] = useState<Ifollow[]>([{ followId: 0, followerId: 0 , followingId: 0 }]);
    const [isFollowed, setIsFollowed] = useState<boolean>();

    // pagination start
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 4; // Number of items per page
    const pageCount = Math.ceil(postInfo.length / itemsPerPage);
    const handlePageClick = (selectedItem: { selected: number }) => {
        setCurrentPage(selectedItem.selected);
    };
    const offset = currentPage * itemsPerPage;
    const currentPageData = postInfo.slice(offset, offset + itemsPerPage);
    // pagination end

    const localVariable = localStorage.getItem("currentUser"); 
    const currentUser =  localVariable != null ? JSON.parse(localVariable).logUser : "";
    const userid = localVariable != null ? JSON.parse(localVariable).logId : 0;
    const currentDate =  new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    const navigate = useNavigate();

    const refreshPage = () => {
    navigate(0);
}

    useEffect((()=> {
        const getNames = async () =>{
            try {
                // already existed endpoint used in another Component.
                const response = await axios.post(`http://localhost:3000/server/login/${givenUser}`);
    
                console.log("this is the query result: ", response.data[0].logname === givenUser);
    
                if (givenUser !== undefined && response.data[0].logname === givenUser) {
                    console.log("user is included");
                    console.log("that is taken from the response ",response.data);
                    const byteArray = new Uint8Array(response.data[0]["logimage"].data);
                    const blob = new Blob([byteArray], { type: 'image/jpeg' });
                    setUserImage(blob);
                } else {
                    console.log(givenUser);
                };
            
                console.log("this is the user: ", givenUser);
            } catch(e) {
                console.log(e);
                navigate('/');
            }
        };
    
        getNames();

    }), []);

    //follow user
    const followUser = async () => {
        try {
            const response = await axios.post(`http://localhost:3000/server/follow/${userid}/${givenUserId}`);
            console.log(response, `User with id: ${givenUserId} is followed successfully by user ${userid}!!`);
            setIsFollowed(true);
        } catch(err) {
            console.log(err);
        }
    };

    //unfollow user
    const unfollowUser = async () => {
        try {
            const response = await axios.post(`http://localhost:3000/server/unfollow/${userid}/${givenUserId}`);
            console.log(response, `User with id: ${givenUserId} is now not followed by user ${userid}!!`);
            setIsFollowed(false);
        } catch(err) {
            console.log(err);
        }
    };
 
    // show comments
    const handleComments = (postId: number) =>{
        setPostInfo((postInfo) => postInfo.map((post) =>
        // close the replies if open
        post.postid === postId ? { ...post, comments_shown: !post.comments_shown, reply_shown: (post.reply_shown === true ? false  : false)   } : post)
        ); 
    };

    // show reply input
    const handleReply = (postId: number) =>{
        setPostInfo((postInfo) => postInfo.map((post) =>
        // close the comments if open
        post.postid === postId ? { ...post, reply_shown: !post.reply_shown, comments_shown: (post.comments_shown === true ? false  : false)  } : post)
        ); 
    };
    

    // submit the comment object to the proxy server
    const handleSubmit = async (e: FormEvent<HTMLFormElement>, postId: number) =>{
        e.preventDefault();
        const myform = e.currentTarget;
        const reply = myform.reply.value;
        const replyInfo = {
            post_id: postId,
            username: currentUser,
            text: reply,
            date: formattedDate
        };

        try {
            const response = await axios.post(`http://localhost:3000/server/replies/${JSON.stringify(replyInfo)}`);
            console.log(replyInfo," was submited successfully!", response);
            refreshPage();
        } catch (error) {
            console.log(error);
        }
    };

    // edit the given post
    const handleEdit = async (e: FormEvent<HTMLFormElement>, id: number) => {
        e.preventDefault();
        const myform = e.currentTarget;
        const text = myform.edited.value;
        console.log("this is edited", text);
        try {
            const response = await axios.post(`http://localhost:3000/server/edit/${id}`, { text });
            console.log(id," was edited successfully!", response);
            refreshPage();
        } catch (error) {
            console.log(error);
        }
    };

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
    // calculate likes
    const calculateLikes = (postLikes: Ilikes[]) => {
        const likesResult: Iresult = {};
        for(let i=0; i<postLikes.length; i++){
            if(!likesResult[postLikes[i].post_id]) likesResult[postLikes[i].post_id] = 1;
            else likesResult[postLikes[i].post_id] += 1;
        }
        console.log(likesResult);
        setFinalLikes(likesResult);
    };

    // returns true if the post is liked or false if it is not
    const isLiked = (userid: number, postid: number) => {
        for(let i=0; i<postLikes.length; i++){
            if( postLikes[i].post_id == postid && postLikes[i].user_id == userid ) {
            return true;
        }}
        return false;
    }
      
    //get the posts and the user's image from the server
    useEffect(() => {

        const getImage = async () => {
            try {
                const response = await axios.post(`http://localhost:3000/server/login/${givenUser}`);
                // convert data array to blob in order to display it
                const byteArray = new Uint8Array(response.data[0]["logimage"].data);
                const blob = new Blob([byteArray], { type: 'image/jpeg' });
                setUserImage(blob);
                console.log("image result", blob);
                } catch (error) {
                console.log(error);
            }
        };

        const getPosts = async() => {
            let queryResult = [];
            try {
              const response = await axios.get(`http://localhost:3000/server/posts/${givenUser}`);
              queryResult = response.data;
              // second way to change the isShown property 
              // let finalresult = queryResult.map( (item:Iposts) => item = {...item, isshown:false})
              setPostInfo(queryResult);
            } catch(err) {
                console.log(err);
            }
        };

        const getReplies = async() => {
            let queryResult = [];
            try {
              const response = await axios.post(`http://localhost:3000/server/replies`);
              queryResult = response.data;
              setReplies(queryResult);
            } catch(err) {
                console.log(err);
            }
        };

        const getLikes = async() => {
            try {
            const response = await axios.post(`http://localhost:3000/server/like/0/0`);
            const likes = response.data;
            setPostLikes(likes);
            calculateLikes(likes);
            // get each post's likes:
            } catch (err) {
                console.log(err)
            }
        };

        const getFollows = async() => {
            try {
            const response = await axios.post(`http://localhost:3000/server/getfollows`);
            const followsResponse = response.data;
            setFollows(followsResponse);
            console.log("follows:", follows);
            } catch(err) {
            console.log("Error: ", err);
            }
    };

        const getId = async() => {
            try {
            const response = await axios.post(`http://localhost:3000/server/getid/${givenUser}`);
            const usrid = response.data;
            setGivenUserId(usrid[0].logid);
            console.log("follows:", follows);
            } catch(err) {
            console.log("Error: ", err);
            }
    };

        getPosts();
        getReplies();
        getImage();
        getLikes();
        getFollows();
        getId();
    
    }, [givenUserId, isFollowed]);

    // Added a new useEffect only for the checkIfFollowed function.
    // It updates the isFollowed state variable only when givenUserId changes.
    useEffect(() => {

        const checkIfFollowed = () => {
            return(follows.map((follow) => {
                if( follow.followerId === userid && follow.followingId === givenUserId ) {
                    setIsFollowed(true);
                    console.log("Edo ginetai to kako!!!!!!!!!!!", isFollowed);
                };
            }));
        };

        checkIfFollowed();
    }, [givenUserId]);

    console.log("IS HE FOLLOWED???", isFollowed);
    return(
        <div>
            <Navbar/>
            <div className='text-2xl text-center font-serif font-extrabold text-[#914ebe] shadow-lg'>{givenUser?.replace(/^.{1}/g, givenUser[0].toUpperCase())} Profile</div>
            <div className="flex my-4">
                <div className="flex-1 my-auto px-auto  text-white">
                    {   givenUser == currentUser ? <p></p> : !isFollowed ?
                        <button onClick={() => {followUser()}} className="bg-[#8584e0] h-[50%] w-[40%]  max-w-[12rem] min-w-[8rem] mx-auto rounded-xl p-2 flex items-center border border-[#233549] opacity-90 hover:bg-[#6f97c2] shadow-btnShadow"><div className="ml-4"><Follow/></div><p className="ml-4 font-bold tracking-wider italic">Follow</p></button> : 
                        <button onClick={() => {unfollowUser()}} className="bg-[#8584e0] h-[50%] w-[40%]  max-w-[12rem] min-w-[10rem] mx-auto rounded-xl p-2 flex items-center border border-[#233549] opacity-90 hover:bg-[#6f97c2] shadow-btnShadow"><div className="ml-4"><Unfollow/></div><p className="ml-4 font-bold tracking-wider italic">Unfollow</p></button>
                    }
                </div>  
                <div className='flex-2'>
                    {userImage ? <img className="w-32 h-32 rounded-full shadow-picShadow" src={URL.createObjectURL(userImage)} alt="Selected" /> : <div>No image</div>}
                </div>
                <div className="flex-1"></div>
            </div>
            <div className=''> 
                <div className='text-2xl text-center font-extrabold text-orange-500 shadow-lg'>My Posts</div>
                {/* Display the Posts */}
                { currentPageData.map( (currentPageData, index) => 
                (<div key={index} className='text-[#363a42] rounded-md border-slate-400 m-2 p-2 bg-[#f5f6f8]'> 

                <div className='flex justify-between'>
                    <div className='flex items-center'>
                        {userImage && <img className="w-8 h-8 rounded-full" src={URL.createObjectURL(userImage)} alt="Selected" />}
                        <span className='font-semibold m-2'>{currentPageData.post_author}</span> 
                        <span>{currentPageData.post_date && currentPageData.post_date.split('T')[0].split('-').join("-")}</span>
                    </div>
                </div>

                <div className='font-sans md:font-serif text-[16px] mt-2'>
                    { currentPageData.isedited ? 
                    <form onSubmit={(event) => handleEdit(event, currentPageData.postid)}>
                        <input key="form" className="rounded-md mx-2 py-4 w-[40%] outline-none" placeholder={" "+currentPageData.post_text} type="text"  name="edited"/>
                        <input key="btn" className="rounded-md hover:bg-[#cfdbc0] bgrounded-md w-[10%] p-2 border-slate-400 bg-[#b9dd90]" value="Edit" type="submit"></input>
                    </form>
                    :
                    <div>{currentPageData.post_text}</div>} 
                    {/*Add dislike icon if a user likes already the post.*/}
                    <div className='flex items-center font-14px mt-2'>           
                    { !isLiked(userid, currentPageData.postid) ? <div onClick={() => likePost(currentPageData.postid)} className='hover:text-red-500'><Like/></div>
                    : <div onClick={() => dislikePost(currentPageData.postid)} className='hover:text-red-500'><Dislike/></div> }
                    <span className='ml-2'>{finalLikes[currentPageData.postid] ? finalLikes[currentPageData.postid] : 0}</span>
                    {/* Leave a comment */}
                    <div className="text-[13px] border-b border-[#a5cbd4] ml-3 flex flex-row space-x-2 "><div  onClick={() => handleReply(currentPageData.postid)} className='hover:text-[#51abc2]'><Reply/></div><p className=''>reply</p></div>
                    {/*Show the replies when the user clicks */}
                    <span className="flex flex-row ml-3 border-b border-[#f0bfbf]"><div onClick={() => handleComments(currentPageData.postid)} className='hover:text-[#fda1a1]'><Comment/></div><p className='ml-2 text-[13px]'>
                        {replies.filter(reply => reply.post_id === currentPageData.postid).length} comment(s)</p>
                    </span>
                    </div>
                    <div>
                        {/* Map the replies if post.commentsShown = true. Show a reply if the post_id == currentpagedata.postid. */}
                        { (currentPageData.comments_shown && replies.filter(reply => reply.post_id === currentPageData.postid).length != 0 ) ? replies.map((comment, index) => 
                            ( currentPageData.postid === comment.post_id && (<div className='font-sans md:font-serif text-[14px] rounded-md border-2 border-slate-300 m-2 p-2 bg-[#f5f6f8]' 
                            key={comment.id}> <span className='font-bold'>{comment.username}</span> on {comment.date ? comment.pdate.split('T')[0].split('-').join("-") : ""} <span className='font-semibold'>replied:</span> <br/> {comment.text} </div>) 
                            ))
                            : (<div></div>) 
                        }
                    </div>
                    {/* Leave a comment */}
                    <div>
                        { currentPageData.reply_shown 
                            ?   <form className="flex justify-center" onSubmit={(e) => handleSubmit(e, currentPageData.postid)}>
                                    <div className="flex flex-col items-center w-fit">
                                    <input
                                        key="reply"
                                        className="rounded-md mt-2 border-b-4 pb-20 outline-none w-96"
                                        type="text"
                                        placeholder=" Reply here" 
                                        name="reply"
                                    ></input>
                                    <input type="submit" value="Reply" className="text-[#504949] self-center h-[4vh] w-[12vw] bg-[#b5d3e0] hover:bg-[#b1ebaf] font-semibold mt-1 rounded-full">
                                    </input>
                                    </div> 
                                </form>
                            : <div></div>
                        } 
                    </div>
                </div>
            </div>)
            )}
            </div>
            <ReactPaginate
                previousLabel={'Previous:'}
                nextLabel={'Next:'}
                breakLabel={'...'}
                breakClassName={'break-me'}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={handlePageClick}
                containerClassName={'border-b-2 p-2 m-2 font-semibold text-center text-gray-600 grid grid-cols-2 w-32 h-16'}
                activeClassName={'ml-[2vw] w-[60%] rounded-full bg-red-100 opacity-50'}
            />
        </div>
        
    )
};
export default User;