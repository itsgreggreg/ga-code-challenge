// We wrap our entire application in a function to isolate it
// from the rest of the browser
(function(){
  // we put our browser into strict-mode
  "use strict";

  // First we need to grab references to our app's components
  let searchForm = document.getElementById("searchForm");
  let searchInput = document.getElementById("searchInput");
  let searchButton = document.getElementById("searchButton");
  let searchResults = document.getElementById("searchResults");

  // Now we attach handlers to events our components may fire
  searchForm.onsubmit = function(){
    let movieTitle = searchInput.value;
    let successFunction = function(movies){
      console.log(movies)
      searchResults.innerHTML = buildMovieList(movies.Search);
    };
    searchOMDB(movieTitle, successFunction, searchError);
    return false;
  }

  // UI FUNCTIONS

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
    movies.map(function(movie){
      ul += '<li>' + movie.Year + ' - ' + movie.Title + '</li>';
    })
    return ul + '</ul>'
  }


  // HELPER FUNCTIONS

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
    let baseUrl = "http://omdbapi.com/?s=";
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
