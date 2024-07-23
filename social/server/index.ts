import { Iuser, Ireplies, Ipost} from '../src/components/MyInterfaces.js';
import { Request, Response, request } from 'express';

process.env.TZ = 'Europe/Athens';

const moment = require('moment-timezone');
const bodyParser = require('body-parser');
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

const port = 3000;

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password',
    database: "social",
});

connection.connect((error: Error | null) => {
    if(error) {
        console.log("Error", error);
        return;
    }
    console.log("new connection!!");
});

app.use(cors());

app.use(bodyParser.json({limit: "50mb"}));

app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

//Log the user In
app.post('/server/login/:logname', (req: Request, res:Response) => {

    const loggedUser = req.params.logname;

    // get all the usernames
    if( loggedUser === "fetchall" ) {
        connection.query(`SELECT logname FROM loginfo;`, (error: Error, result: any, fields:any) => {
            if(error) {
                console.log("What can be wrong here?", error);
                res.status(500);
                return;
            } else {
                console.log('The query run successfully we got all the usernames!', result, "these are the fields: ", fields);
                res.status(200).json(result);
                return;
            }
        });
    } else {
     // get the username and the password for the user given in params
        connection.query(`SELECT * FROM loginfo WHERE logname="${loggedUser}";`, (error: Error, result: any, fields:string) => {
            if(error) {
                console.log("Name does not exist");
                res.status(500).send("Not valid username")
            } else {
                console.log('The query run successfully!' , "these are the fields: ", fields)
                res.status(200).json(result);
            }
        });
    };

});

// get the id
app.post('/server/getid/:logname', (req: Request, res:Response) => {

    const loggedUser = req.params.logname;
    connection.query(`SELECT logid FROM loginfo WHERE logname = '${loggedUser}';`, (error: Error, result: any, fields:any) => {
        if(error) {
            console.log("What can be wrong here?", error);
            res.status(500);
            return;
        } else {
            console.log('The query run successfully we got all the usernames!', result, "these are the fields: ", fields);
            res.status(200).json(result);
            return;
        }
    });
});

//Register the user
app.post('/server/register/:user', (req: Request, res:Response) => {

    const registeredUser: Iuser = JSON.parse(req.params.user);
    const myQuery: string = `INSERT INTO loginfo (logname, logpass) VALUES ( ?, ? )`;
    console.log(registeredUser, registeredUser.username, registeredUser.password)

    // insert the users into the db
    connection.query(myQuery, [registeredUser.username, registeredUser.password], (error: Error, result: any, fields:any) => {
        if(error) {
            console.log("Error =>", error);
            res.status(500).send("Not valid query")
        } else {
            console.log('The query run successfully!')
            res.status(200).json(result);
        }
    });
});

//Get the user image 
app.get('/server/getImage/:user', (req:Request, res:Response) => {
    const userImg: string = req.params.user;
    const getphoto: string = `SELECT logimage FROM loginfo WHERE logname = '${userImg}'`;
    connection.query(getphoto, (err: Error, result: any) => {
        if(err) {
            console.log("Error", err);
            res.status(500).send("Error here")
        } else {
            console.log("getImage retrieved successfully!");
            // console.log("this is the image before json: ", result);
            res.status(200).json(result);
        }
    })
})

//Set the user image 
app.post('/server/setImage/:id', (req:Request, res:Response) => {
    const id: string = req.params.id;
    const userImage: Buffer = req.body.image;
  
    const setphoto: string = `UPDATE loginfo SET logimage = '${userImage}' WHERE logid = '${id}'`;
    console.log("this is the image that goes in: ", userImage , "<---");
    connection.query(setphoto, (err: Error, result: any) => {
        if(err) {
            console.log("Error", err);
            res.status(500).send("Error here")
        } else {
            console.log("setImage retrieved successfully!");
            res.status(200).json(result);
        }
    })
})

//Display the posts
app.get(`/server/posts/:user`, (req: Request, res:Response) => {

    const currentUser = req.params.user;

    if(currentUser == "all") {
        const getPostsQuery: string = `SELECT p.*, DATE_FORMAT(post_date, "%Y-%m-%d") AS pdate, logimage FROM posts p INNER JOIN loginfo ON logname = post_author;`;
        
        connection.query(getPostsQuery, (error: Error, result: any) => {
            if(error) {
                console.log("Error", error);
                res.status(500).send("Error here")
            } else {
                console.log(`My Time: ${new Date()}`);
                console.log("Posts retrieved successfully but we have an error with time", result[0].pdate);
                console.log("gpt solution", moment(result[0].post_date).format('YYYY-MM-DD'));
                res.status(200).json(result);
            }
        });
        
    } else {
        const getPostsQuery: string = `SELECT *, DATE_FORMAT(post_date, "%Y-%m-%d") AS pdate FROM posts WHERE post_author="${currentUser}";`;
        connection.query(getPostsQuery, (error: Error, result: any) => {
            if(error) {
                console.log("Error", error);
                res.status(500).send("Error here")
            } else {
                console.log("Posts retrieved successfully")
                res.status(200).json(result);
            }
        });
    };
});

//Display the replies
app.post('/server/replies', (req: Request, res:Response) => {
    const getRepliesQuery: string = 'SELECT *, DATE_FORMAT(date, "%Y-%m-%d") AS pdate FROM replies;';
    connection.query(getRepliesQuery, (error: Error, result: any) => {
        if(error) {
            console.log("Error", error);
            res.status(500).send("Error here")
        } else {
            console.log("Replies retrieved successfully")
            res.status(200).json(result);
        }
    })
});

//Create a reply
app.post(`/server/replies/:replyInfo`, (req: Request, res: Response) => {

    const replyInfo: Ireplies = JSON.parse(req.params.replyInfo);
    const myQuery: string = `INSERT INTO replies (post_id, username, text, date) VALUES ( ?, ?, ?, ?)`;
    console.log(replyInfo.post_id, replyInfo.username, replyInfo.text, replyInfo.date, "<- this is sent by the front end for the post info");
    connection.query(myQuery, [replyInfo.post_id, replyInfo.username, replyInfo.text, replyInfo.date], (error: Error, result: any) => {
        if(error) {
            console.log("Error", error);
            res.status(500).send("Error here")
        } else {
            console.log("Post created successfully")
            res.status(200).json(result);
        }
    })

});

//Create a new post in the db
app.post(`/server/posts/:postInfo`, (req: Request, res: Response) => {

    const postInfo: Ipost = JSON.parse(req.params.postInfo);
    const myQuery: string = `INSERT INTO posts (post_author, post_text, post_date) VALUES ( ?, ?, ? )`;
    console.log(postInfo.post_author, postInfo.post_text, postInfo.post_date, "<- this is sent by the front end for the post info");
    
    connection.query(myQuery, [postInfo.post_author, postInfo.post_text, postInfo.post_date ], (error: Error, result: any) => {
        if(error) {
            console.log("Error", error);
            res.status(500).send("Error here")
        } else {
            console.log("Post created successfully")
            res.status(200).json(result);
        }
    })

});

//Delete a post in the db with its comments!
app.delete('/server/delete/:postid', (req: Request, res: Response) => {
    const postid = req.params.postid;
    const myQuery: string = `DELETE FROM posts WHERE postid = ${postid};`;
    console.log(`post with number ${postid} was deleted!`);
    connection.query(myQuery, (error: Error, result: any) => {
        if(error) throw error;
        console.log("The number of rows deleted: " + result.affectedRows);
        return;
    })
    //delete comments for the post that was deleted
    connection.query(`DELETE FROM replies WHERE post_id = ${postid};`, (error:Error, result: any) => {
        if(error) throw error;
        console.log("The number of rows deleted: " + result.affectedRows);
        res.status(200).json(result);
    }) 
});

//Edit a post
app.post('/server/edit/:postid',(req: Request, res: Response) => {
    console.log(req);
    const postid = req.params.postid;
    const text = req.body.text;
    console.log(postid, text);
    const myQuery: string = `UPDATE posts SET post_text = ? WHERE postid = ?`;
    connection.query(myQuery, [text, postid], (error: Error, result: any) => {
        if(error) throw error;
        console.log(`the post with id ${postid} edited successfully!`);
        res.status(200).json(result);
    })
});

//Add a like
app.post('/server/like/:postid/:userid',(req: Request, res: Response) => {
    const post_id = req.params.postid;
    const user_id = req.params.userid;
    console.log(post_id, user_id);

    // get the existing likes
    if( post_id == "0" && user_id == "0" ){
        const getLikes: string = 'SELECT user_id, post_id FROM likes';
        connection.query(getLikes, (error: Error, result: any) => {
            if(error) throw error;
            res.status(200).json(result);
        })
    // add a like
    } else {
        const myQuery: string = `INSERT INTO likes ( post_id, user_id ) VALUES ( ?, ? )`;
        connection.query(myQuery, [post_id, user_id], (error: Error, result: any) => {
            if(error) throw error;
            console.log(`the post's likes with id ${post_id} are updated successfully!`);
            res.status(200).json(result);
        })
    }
});

//Dislike
app.delete('/server/dislike/:postid/:userid',(req: Request, res: Response) => {
    console.log("ok?")
    const post_id = req.params.postid;
    const user_id = req.params.userid;
    const delQuery = `DELETE FROM likes WHERE post_id = ${post_id} AND user_id = ${user_id}`;
    connection.query(delQuery, (error: Error, result: any) => {
        if(error) throw error;
        console.log("the like object with post_id: ",post_id,"and user_id", user_id, "was deleted successfully!");
        res.status(200).json(result);
    })

});

//Follow
app.post('/server/follow/:followerId/:followingId', (req:Request, res:Response) => {
    const followerId = req.params.followerId;
    const followingId = req.params.followingId;
    const followQuery = 'INSERT INTO follows ( followerId, followingId ) VALUES (?, ?)';
    connection.query(followQuery, [followerId, followingId], (error: Error, result: any) => {
        if(error) throw error;
        console.log(`The user with id ${followerId} follows user with id ${followingId} successfully!`);
        res.status(200).json(result);
    })
});

//Unfollow
app.post('/server/unfollow/:followerId/:followingId', (req:Request, res:Response) => {
    const followerId = req.params.followerId;
    const followingId = req.params.followingId;
    const followQuery = `DELETE FROM follows WHERE followerId = ${followerId} AND followingId = ${followingId}`;
    connection.query(followQuery, [followerId, followingId], (error: Error, result: any) => {
        if(error) throw error;
        console.log(`The user with id ${followerId} unfollows now user with id ${followingId}`);
        res.status(200).json(result);
    })
});

//get Follows
app.post('/server/getfollows', (req:Request, res:Response) => {
    const getFollowsQuery = 'SELECT * FROM follows';
    connection.query(getFollowsQuery, (error: Error, result: any) => {
        if(error) throw error;
        console.log('Follows taken successfully!');
        res.status(200).json(result);
    })
});

app.listen(port, () => {
    console.log(`Server is on port ${port}`);
});
