import { Ireplies, Ilikes, Iresult, Ipost } from './MyInterfaces.js'
import { LiaCommentsSolid as Comment } from 'react-icons/Lia';
import { BsThreeDotsVertical as Dots } from 'react-icons/Bs';
import { RiReplyAllLine as Reply } from 'react-icons/Ri';
import { AiFillDislike as Dislike} from 'react-icons/Ai';
import { AiFillLike as Like} from 'react-icons/Ai';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import { FormEvent } from 'react';
import handlePost from './HandlePost';
import Navbar from './Navbar';
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

function Home(props: { updateUser: (user:string) => void}) {

    const navigate = useNavigate();
    const currentDate = new Date();
    const [replies, setReplies] = useState<Ireplies[]>([]);
    const formattedDate = currentDate.toISOString().split('T')[0];
    const { updateUser } = props;
    const [postInfo, setPostInfo] = useState<Iposts[]>([]);
    const [postLikes, setPostLikes] = useState<Ilikes[]>([]);

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

    const [finalLikes, setFinalLikes] = useState<Iresult>({});
    const localVariable = localStorage.getItem("currentUser"); 
    const userid = localVariable != null ? JSON.parse(localVariable).logId : 0;
    const currentUser = localVariable != null ? JSON.parse(localVariable).logUser : "";
    
    const refreshPage = () => {
        navigate(0);
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const text = e.currentTarget;
        const post = text.newpost.value;
        console.log(post);
        const localVariable = localStorage.getItem("currentUser"); 
        const tempVariable = localVariable != null ? JSON.parse(localVariable).logUser : "";
        console.log(tempVariable);
        const newPost: Ipost = {
            postid: null,
            post_author: tempVariable != null ? tempVariable : "",
            post_text: post,
            post_date: formattedDate,
            isshown: false,
            isedited: false,
            comments_shown: false,
            reply_shown: false,
        }
        console.log(newPost);

        const createPost = async (post: Ipost) => {
            try {
                // we use the JSON.stringify format because the server/register/ function expects a string!!
                const response = await axios.post(`http://localhost:3000/server/posts/${ JSON.stringify(post) }`);
                console.log("sending request to the database with post info:", post);
                console.log(response.data);
            }  catch (error) {
                console.log(error);
            }
        };
        // execute createPost async function
        createPost(newPost);
        navigate("/myprofile");
    }

     // submit the comment object to the proxy server
     const handleCommentSubmit = async (e: FormEvent<HTMLFormElement>, postId: number) =>{
        e.preventDefault();
        const myform = e.currentTarget;
        const reply = myform.reply.value;
        const replyInfo = {
            post_id: postId,
            username: currentUser,
            text: reply,
            date: formattedDate
        };
        console.log("stelnw afto se string ", replyInfo);
        try {
            const response = await axios.post(`http://localhost:3000/server/replies/${JSON.stringify(replyInfo)}`);
            console.log(replyInfo," was submited successfully!", response);
            refreshPage();
        } catch (error) {
            console.log(error);
        }
    };


    // logs the user out and clears the local storage
    const logout = () => {
        updateUser("");
        localStorage.setItem("currentUser", JSON.stringify({}));
        console.log("the user is logged out");
    }

    // like a post
    const likePost = async (postid: number) => {
        // send the query to the db
        try {
            const response = await axios.post(`http://localhost:3000/server/like/${postid}/${userid}`);
            console.log("post with id:", postid," was deleted successfully!", response);
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
    const calculateLikes = (postLikes: Ilikes[]) => {
        const likesResult: Iresult = {};
        for(let i=0; i<postLikes.length; i++){
            if(!likesResult[postLikes[i].post_id]) likesResult[postLikes[i].post_id] = 1;
            else likesResult[postLikes[i].post_id] += 1;
        }
        console.log(likesResult);
        setFinalLikes(likesResult);
    };

    const isLiked = (userid: number, postid: number) => {
        for(let i=0; i<postLikes.length; i++){
            if( postLikes[i].post_id == postid && postLikes[i].user_id == userid ) {
            return true;
        }}
        return false;
    }

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
    


    useEffect(() => {
 
        const getPosts = async () => {
            let queryResult = [];
            try {
              const response = await axios.get(`http://localhost:3000/server/posts/all`);
              queryResult = response.data;
              console.log(queryResult);
              
              const tempVar = await Promise.all(queryResult.map(async (obj: any) => {
                const getImage = async () => {
                  try {
                    const response = await axios.get(`http://localhost:3000/server/getImage/${obj.post_author}`);
                    console.log("this is my image from db: ",response.data[0]["logimage"].data )
                    const byteArray = new Uint8Array(response.data[0]["logimage"].data);
                    const blob = new Blob([byteArray], { type: 'image/jpeg' });
                    console.log(blob);
                    return blob;
                  } catch (err) {
                    console.log(err);
                    return new Blob([], { type: 'image/jpeg' });
                  }
                };
          
                const fetchedImage = await getImage();
                console.log(fetchedImage);
                obj.logimage = fetchedImage;
                return obj;
              }));
              const sortedPosts = queryResult.sort((a: any,b: any) => (a.post_date > b.post_date ? 1 : b.post_date > a.post_date ? -1 : 0))
              setPostInfo(sortedPosts);
            } catch (err) {
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

        getPosts();
        getReplies();
        getLikes();

    }, []);
    console.log(postInfo, postLikes);
    return(
        <div >
            <Navbar/>
            <div className='text-xl text-center font-[2rem] text-[#615c5c] shadow-lg'>Any new thoughts..?</div>
            <form className="flex justify-center" onSubmit={handleSubmit}>
                <div className="flex flex-col items-center w-fit">
                <input
                    key="username"
                    className="rounded-md mt-2 border-b-4 pb-20 outline-none w-96"
                    type="text"
                    placeholder=" Make your post here" 
                    name="newpost"
                ></input>
                <input type="submit" value="Post" className="text-[#504949] self-center h-[4vh] min-h-[2rem] w-[12vw] bg-[#58a2c4] hover:bg-[#77be74] font-semibold mt-1 rounded-full">
                </input>
                </div> 
            </form>

            {/* ----- Posts ----- */}
            <div className='mt-2'> 
                <div className='text-2xl text-center font-extrabold text-orange-500 shadow-lg'>Published Posts</div>
                { currentPageData.map( (currentPageData, index) => 
                (<div key={currentPageData.postid} className='text-[#363a42] rounded-md border-slate-400 m-2 p-2 bg-[#f5f6f8]'> 

                <div className='flex justify-between'>
                    <div className='flex items-center'>
                        {currentPageData.logimage && <img className="w-8 h-8 rounded-full" src={URL.createObjectURL(currentPageData.logimage)} alt="Selected" />}
                        <span className='font-semibold m-2'>{currentPageData.post_author}</span> 
                        <span>{currentPageData.post_date && currentPageData.post_date.split('T')[0].split('-').join("-")}</span>
                    </div>
                    {currentUser == currentPageData.post_author ?
                    (<div className='relative ml-auto'>
                        <div className='w-[2vw]'><Dots onClick={() => ( showMenu(currentPageData.postid) )}/>
                        { currentPageData.isshown ? <div className='bg-[#f7ebf1] font-semibold text-gray-600 absolute rounded-md ml-[-7.5vw] h-[8vh] min-h-[4rem] w-[7vw] min-w-[3.5rem] border-2 border-[#f7ebf1]'>
                            <div onClick={() => handleOpenEdit(currentPageData.postid)} className='m-[0.2vw] hover:text-[#e661a3]'>Edit</div>
                            <div onClick={() => handleDelete(currentPageData.postid)} className='m-[0.2vw] hover:text-[#ff6a6a]'>Delete</div>
                        </div> : <p/> }
                        </div>
                    </div>)  : <p/> }
                </div>

                <div className='font-sans md:font-serif text-[16px] mt-2'>
                    <div>{currentPageData.post_text}</div>
                    {/*Add dislike icon if a user likes already the post.*/}
                    <div className='flex flex-row '>
                    <div className='flex items-center font-14px'>           
                    { !isLiked(userid, currentPageData.postid) ? <div onClick={() => likePost(currentPageData.postid)} className='hover:text-red-500'><Like/></div>
                    : <div onClick={() => dislikePost(currentPageData.postid)} className='hover:text-red-500'><Dislike/></div> }
                    <span className='ml-2'>{finalLikes[currentPageData.postid] ? finalLikes[currentPageData.postid] : 0}</span>
                    </div>
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
                            key={comment.id}> <span className='font-bold'>{comment.username}</span> on {comment.date ? comment.date.split('T')[0].split('-').join("-") : ""} <span className='font-semibold'>replied:</span> <br/> {comment.text} </div>) 
                            ))
                            : (<div></div>) 
                        }
                    </div>
                    {/* Leave a comment */}
                    <div>
                        { currentPageData.reply_shown 
                            ?   <form className="flex justify-center" onSubmit={(e) => handleCommentSubmit(e, currentPageData.postid)}>
                                    <div className="flex flex-col items-center w-fit">
                                    <input
                                        key="reply"
                                        className="rounded-md mt-2 border-b-4 pb-20 outline-none w-96"
                                        type="text"
                                        placeholder=" Reply here" 
                                        name="reply"
                                    ></input>
                                    <input type="submit" value="Reply" className="text-[#504949] self-center h-[4vh] min-h-[2rem] w-[12vw] bg-[#b5d3e0] hover:bg-[#b1ebaf] font-semibold mt-1 rounded-full">
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
                containerClassName={'border-b-2 p-2 m-2 font-semibold text-center text-gray-600 grid grid-cols-2 w-32'}
                activeClassName={'ml-[2vw] w-[60%] rounded-full bg-red-100 opacity-50'}
            />
           <button className="hover:bg-[#f35353] absolute bottom-4 right-4 bg-[#695681] text-white font-bold m-4 p-4 rounded-md" onClick={logout}>Log out </button>
        </div>
    )
}
export default Home;