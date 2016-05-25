// We wrap our entire application in a function to isolate it
// from the rest of the browser
(function(){
  // we put our browser into strict-mode
  "use strict";

  // Set up global vars for our application
  let movies = [];

  // Setup references to our app's components
  let searchForm = document.getElementById("searchForm");
  let searchInput = document.getElementById("searchInput");
  let searchButton = document.getElementById("searchButton");
  let searchResults = document.getElementById("searchResults");
  let movieDetails = document.getElementById("movieDetails");

  // Now we attach handlers to events our components may fire

  // This function runs when the search form is submitted
  searchForm.onsubmit = function(){
    // Clear the search results
    movies = [];
    // We grab the search term from the input
    let movieTitle = searchInput.value;
    // Setup what to do when we get some search results
    let successFunction = function(results){
      // Grab the movies from the results
      movies = results.Search;
      // Sort the movies by year
      movies.sort((a,b) => a.Year*1 - b.Year*1);
      // Build and insert the list of movies
      searchResults.innerHTML = buildMovieList(movies);
    };
    searchOMDB(movieTitle, successFunction, searchError);
    // We must return false to prevent the form from actually submitting
    return false;
  }

  // This function runs when the search results are clicked
  searchResults.onclick = function(e){
    let movieIndex = e.target.getAttribute("data-index");
    movieDetails.innerHTML = buildMovieDetails(movies[movieIndex]);
  }

  //
  // UI FUNCTIONS
  //

  /*
    Simply displays No Results in the searchResults if called
  */
  function searchError(){
    searchResults.innerHTML = "<h2>No Results</h2>"
  };

  /*
    Takes an Array of movies and builds UL to display them
    Parameters:
      movies : Array - an array of movie objects returned from OMDB
    Returns:
      A UL dom element to be inserted into the web page
  */
  function buildMovieList(movies){
    let ul = '<ul id="movieList">'
    movies.map(function(movie,index){
      ul += '<li data-index='+index+'>' + movie.Year + ' - ' + movie.Title + '</li>';
    })
    return ul + '</ul>'
  }

  /*
    Takes a movie object and builds the ui to display it
    Paramaters:
      movie : Object - a movie object returned from OMDBapi
    Returns:
      html to be inserted into the page
  */
  function buildMovieDetails(movie){
    console.log(movie)
    return `<h3>${movie.Title}</h3>
            <div><strong>Year: </strong>${movie.Year}</div>
            <div><strong>IMDB ID: </strong>${movie.imdbID}</div>
            <div><img src="${movie.Poster}"></div>
            `
  }


  //
  // HELPER FUNCTIONS
  //

  /*
    A function to search the omdbapi for a specific movie title
    Parameters:
     movieTitle : string - the movie title to search for
     success : function - a function to call if the request was successful
                          receives an array of movie objects as it's only parameter
     error : function - a function to call if the request failed
                        receives no parameters
    Returns:
      undefined
  */
  function searchOMDB(movieTitle, success, error){
    let baseUrl = "http://omdbapi.com/?type=movie&s=";
    let request = new XMLHttpRequest();

    request.open('GET', baseUrl + movieTitle, true);

    request.onload = function() {
      let data = JSON.parse(request.responseText);
      // if the status code is in the success region and there's no error
      if (request.status >= 200 && request.status < 400 && !data.Error) {
        // then call the success function if it exists
        if(typeof success === "function"){
          success(data);
        }
      // otherwise
      } else {
        // let's call the error function if it exists
        if(typeof error === "function"){
          error();
        }
      }
    };

    request.onerror = function() {
      // if there is an error in the connection we call the error function
      // if it exists
      if(typeof error === "function"){
        error();
      }
    };

    request.send();
  }
})()
