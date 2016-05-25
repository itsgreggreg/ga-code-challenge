// We wrap our entire application in a function to isolate it
// from the rest of the browser
(function(){
  // we put our application into strict-mode
  "use strict";

  // Set up global vars for our application
  let movies = [];

  // Setup references to our app's components
  let searchForm = document.getElementById("searchForm");
  let searchInput = document.getElementById("searchInput");
  let searchButton = document.getElementById("searchButton");
  let searchResults = document.getElementById("searchResults");
  let movieDetails = document.getElementById("movieDetails");
  let showFavorites = document.getElementById("favoritesButton");

  //
  //  EVENT HANDLERS
  //

  // This function runs when the search form is submitted
  searchForm.onsubmit = function(){
    // Clear the search results
    movies = [];
    searchResults.innerHTML = "";
    movieDetails.innerHTML = "";
    // We grab the search term from the input
    let movieTitle = searchInput.value;
    // Setup what to do when we get some search results
    let successFunction = function(results){
      // Grab the movies from the results
      movies = results.Search;
      // Sort the movies by year
      movies.sort((a,b) => a.Year*1 - b.Year*1);
      // Build and insert the list of movies
      searchResults.innerHTML = "<h2>Search Results</h2>"+buildMovieList(movies);
    };
    // Now we run the actual search
    searchOMDB(movieTitle, successFunction, searchError);
    // We must return false to prevent the form from actually submitting
    return false;
  };

  // This function runs when the search results are clicked
  searchResults.onclick = function(e){
    // We've got a list of movies in the global 'movies' variable
    // we've also attached each movies index to the li item
    // we grab that index so we can grab the movie details
    let movieIndex = e.target.getAttribute("data-index");
    let successFunction = function (results) {
      movieDetails.innerHTML = buildMovieDetails(results, movieIndex);
    };
    getMovieById(movies[movieIndex].imdbID, successFunction);
  };

  // This gets called when details is clicked, used to check if the
  // favorites button is clicked
  movieDetails.onclick = function(e){
    if(e.target.getAttribute("id") === "favoriteButton"){
      let movieIndex = e.target.getAttribute("data-index");
      let movie = movies[movieIndex];
      saveFavorite(movie.Title, movie.Year, movie.imdbID);
    }
  };

  // This gets called when the show favorites button is clicked
  showFavorites.onclick = function(e){
    // Clear the search results
    searchResults.innerHTML = "";
    movieDetails.innerHTML = "";
    movies = [];
    // Function to build the html on a successful return
    let successFunction = function(results){
      movies = results;
      searchResults.innerHTML = "<h2>Favorites</h2>"+buildMovieList(movies);
    };
    getFavorites(successFunction);
  };

  //
  // UI BUILDING HELPERS
  //

  /*
    Simply displays No Results in the searchResults if called
  */
  function searchError(){
    searchResults.innerHTML = "<h2>No Results</h2>";
  }

  /*
    Takes an Array of movies and builds UL to display them
    Parameters:
      movies : Array - an array of movie objects returned from OMDB
    Returns:
      A UL dom element to be inserted into the web page
  */
  function buildMovieList(movies){
    let ul = '<ul id="movieList">';
    movies.map(function(movie,index){
      ul += `<li data-index=${index}>${movie.Year} - ${movie.Title}</li>`;
    });
    return ul + '</ul>';
  }

  /*
    Takes a movie object and builds the ui to display it
    Paramaters:
      movie : Object - a movie object returned from OMDBapi
    Returns:
      html to be inserted into the page
  */
  function buildMovieDetails(movie, index){
    let details = ['Genre', 'Rated', 'Released', 'Runtime', 'Director'];
    let html = `<h3>${movie.Title}</h3>
                <div><button id="favoriteButton" data-index="${index}">Favorite</button></div>`;
    details.map(function(detail){
      html += `<div><strong>${detail}: </strong>${movie[detail]}</div>`;
    });
    html += `<div><img src="${movie.Poster}"></div>`;
    return html;
  }


  //
  // REMOTE CALL HELPERS
  //

  /*
    A function to search the omdbapi for a movie title
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
    baseXHRGet(baseUrl + movieTitle, success, error);
  }

  /*
    A function to search the omdbapi for a specific movie by imbdID
    Parameters:
     imdbID : string - the imdbID to search for
     success : function - a function to call if the request was successful
                          receives an array of movie objects as it's only parameter
     error : function - a function to call if the request failed
                        receives no parameters
  */
  function getMovieById(imdbID, success, error){
    let baseUrl = "http://omdbapi.com/?type=movie&i=";
    baseXHRGet(baseUrl + imdbID, success, error);
  }

  /*
    A function to get a user's favorites
    Parameters:
      success : function - a function to run if the request succeeds
      error : function - a function to run if the request fails
  */
  function getFavorites(success, error){
    let baseUrl = "/favorites";
    baseXHRGet(baseUrl, success, error);
  }

  /*
    A function for saving a single favorites
    Parameters:
      title : string - movie title
      year : string - movie year
      imdbID : string - valid imdbID of the movie
      success : function - called if the request succeeds
      error : function - called if the request fails
  */
  function saveFavorite(title, year, imdbID, success, error){
    let baseUrl = "/favorites";
    let params = {"Title":title, "Year":year, imdbID};
    baseXHRPost(baseUrl, params, success, error);
  }

  /*
    Does all the cross site GETing and callbacking
    Parameters:
      url : string - The url to call
      success : function - a function to call if the request is successful
      error : function - a function to call if the request failes
  */
  function baseXHRGet(url, success, error){
    let request = new XMLHttpRequest();
    request.open('GET', url, true);
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

  /*
    Does all the cross site POST and callbacking
    Parameters:
      url : string - The url to call
      params : object - params to send
      success : function - a function to call if the request is successful
      error : function - a function to call if the request failes
  */
  function baseXHRPost(url, params, success, error){
    let request = new XMLHttpRequest();
    params = Object.keys(params).reduce(function(prev, key){
      prev.push(`${key}=${params[key]}`);
      return prev;
    }, []).join("&");
    request.open("POST", url, true);

    //Send the proper header information along with the request
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    request.onreadystatechange = function() {
      if(request.readyState == 4){
        let data = JSON.parse(request.responseText);
        // if the status code is in the success region and there's no error
        if(request.status >= 200 && request.status < 400 && !data.Error) {
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
      }
    }
    request.send(params);
  }
})()
