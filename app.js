const express = require("express");
const app = express();

app.use(express.json());

const {open} = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");


//initialization
let db = null;
const initializeDbAndServer = async ()=>{
    try{
        db = await open({
        filename: dbPath,
        driver : sqlite3.Database,
    });
    app.listen(3000,() =>
    console.log("Server is Running at http://localhost:3000/"));
}
catch(e){
    console.log(`DB Error : ${e.messaga}`);
    process.exit(1);
}
};
initializeDbAndServer();

//convert to response Object
const convertDbObjectToResponseObject= (dbObject)=>{
    return{
    movieId : dbObject.movie_id,
    directorId : dbObject.director_id,
    movieName : dbObject.movie_name,
    leadActor : dbObject.lead_actor,
    };
}

//Get all movie names
app.get("/movies/", async (request, response)=>{
    const getMoviesQuery = `SELECT movie_name FROM movie ORDER BY movie_id;`;
    const moviesArray = await db.all(getMoviesQuery);
    response.send(moviesArray.map((eachMovie)=>convertDbObjectToResponseObject(eachMovie)));
});

//Post given movie details
app.post("/movies/",async (request, response)=>{
    const movieDetails = request.body;
    const {directorId, movieName, leadActor} = movieDetails;
    const postMovieQuery = `INSERT INTO movie (director_id, movie_name, lead_actor) 
    VALUES ("${directorId}", "${movieName}", "${leadActor}");`;
    await db.run(postMovieQuery);
    response.send("Movie Successfully Added");
});

//Get movie details of given movieId
app.get("/movies/:movieId/",async (request, response)=>{
    const {movieId} = request.params;
    const getMoviesQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
    const movie = await db.get(getMoviesQuery);
    response.send(convertDbObjectToResponseObject(movie));
});

//update given movie details
app.put("/movies/:movieId/", async (request, response)=>{
    const { movieId } = request.params;
    const {directorId, movieName, leadActor} = request.body;
    const updateMovieQuery = `
    UPDATE movie 
    SET
    director_id = '${directorId}',
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE 
    movie_id = ${movieId}; `;
    await db.run(updateMovieQuery);
    response.send("Movie Details Updated");
});

//Delete
app.delete("/movies/:movieId/", async (request, response)=>{
    const {movieId} = request.params;
    const deleteQuery = `DELETE FROM movie WHERE movie_id = ${movieId};`;
    await db.run(deleteQuery);
    response.send("Movie Removed");
});

//Get all directors
app.get("/directors/", async (request, response)=>{
    const getDirectorsQuery = `SELECT director_id, director_name FROM director ORDER BY director_id;`;
    const directorsArray = await db.all(getDirectorsQuery);
    response.send(directorsArray.map((each)=>convertDbObjectToResponseObject(each)));
});

//Get movie names by given director
app.get("/directors/:directorId/movies/", async (request, response)=>{
    const { directorId } = request.params;
    const getMoviesQuery = `SELECT movie_name FROM movie WHERE director_id = ${directorId};`;
    const moviesArray = await db.all(getMoviesQuery);
    response.send(moviesArray.map((each)=>convertDbObjectToResponseObject(each)));
});

module.exports = app;