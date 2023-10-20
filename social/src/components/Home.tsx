import { useState, useEffect } from 'react';
import { AiFillDislike as Dislike} from 'react-icons/Ai';
import { AiFillLike as Like} from 'react-icons/Ai';
import ReactPaginate from 'react-paginate';
import { useNavigate } from 'react-router-dom';
import { FormEvent } from 'react';
import Navbar from './Navbar';
import axios from 'axios';

// used for the post created here
interface Ipost {
    postid: number | null,
    post_author: string | null,
    post_text: string,
    post_date: string,
    isshown: boolean,
    isedited: boolean,
}

// used for the posts displayed in the return function
interface Iposts {
    postid: number,
    post_author: string,
    post_text: string,
    post_date: string,
    isshown: boolean,
    isedited: boolean,
    logimage: Blob,
}

interface Ilikes {
    user_id: number,
    post_id: number,
}

interface Iresult {
    [postId: string]: number;
}


function Home(props: { updateUser: (user:string) => void}) {

    const navigate = useNavigate();
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    const { updateUser } = props;
    const [postInfo, setPostInfo] = useState<Iposts[]>([]);
    const [postLikes, setPostLikes] = useState<Ilikes[]>([]);
    // ============ pagination ====================
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 4; // Number of items per page
    const pageCount = Math.ceil(postInfo.length / itemsPerPage);
    const handlePageClick = (selectedItem: { selected: number }) => {
        setCurrentPage(selectedItem.selected);
    };
    const offset = currentPage * itemsPerPage;
    const currentPageData = postInfo.slice(offset, offset + itemsPerPage);
    // ============ pagination ====================
    const [finalLikes, setFinalLikes] = useState<Iresult>({});
    const localVariable = localStorage.getItem("currentUser"); 
    const userid = localVariable != null ? JSON.parse(localVariable).logId : 0;
    
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

    useEffect(() => {
 
        const getPosts = async() => {
            let queryResult = [];
            try {
              const response = await axios.get(`http://localhost:3000/server/posts/all`);
              queryResult = response.data;
              queryResult.map((obj: any) => {
                let blob = new Blob([new Uint8Array(obj.logimage.data)], { type: 'image/jpeg' });
                // Create a blob URL from the Blob
                let blobUrl = URL.createObjectURL(blob);
                obj.logimage = blobUrl
                return(obj);
              })
              setPostInfo(queryResult);
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

        getPosts();
        getLikes();

    }, []);

    return(
        <div>
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
                <input type="submit" value="Post" className="text-[#504949] self-center h-[4vh] w-[12vw] bg-[#58a2c4] hover:bg-[#77be74] font-semibold mt-1 rounded-full">
                </input>
                </div> 
            </form>

            {/* ----- Posts ----- */}
            <div className='mt-2'> 
                <div className='text-2xl text-center font-extrabold text-orange-500 shadow-lg'>Published Posts</div>
                { postInfo.map( (currentPageData, index) => 
                (<div key={currentPageData.postid} className='text-[#363a42] rounded-md border-slate-400 m-2 p-2 bg-[#f5f6f8]'> 

                <div className='flex justify-between'>
                    <div className='flex items-center'>
                        {currentPageData.logimage && <img className="w-8 h-8 rounded-full" src={currentPageData.logimage.toString()} alt="Selected" />}
                        <span className='font-semibold m-2'>{currentPageData.post_author}</span> 
                        <span>{currentPageData.post_date && currentPageData.post_date.split('T')[0].split('-').join("-")}</span>
                    </div>
                </div>

                <div className='font-sans md:font-serif text-[16px] mt-2'>
                    <div>{currentPageData.post_text}</div>
                    {/*Add dislike icon if a user likes already the post.*/}
                    <div className='flex items-center font-14px mt-2'>           
                    { !isLiked(userid, currentPageData.postid) ? <div onClick={() => likePost(currentPageData.postid)} className='hover:text-red-500'><Like/></div>
                    : <div onClick={() => dislikePost(currentPageData.postid)} className='hover:text-red-500'><Dislike/></div> }
                    <span className='ml-2'>{finalLikes[currentPageData.postid] ? finalLikes[currentPageData.postid] : 0}</span>
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
           <button className="hover:bg-[#f35353] absolute bottom-4 right-4 bg-[#695681] text-white font-bold m-4 p-4 rounded-md" onClick={logout}>Log out </button>
        </div>
    )
}
export default Home;