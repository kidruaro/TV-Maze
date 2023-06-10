"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $episodesList = $("#episodesList");

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  const response = await axios({
    url: "http://api.tvmaze.com/search/shows",
    method: "GET",
    params: {
      q: term,
    },
  });

  return response.data.map((result) => {
    const show = result.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image ? show.image.medium : "https://tinyurl.com/missing-tv",
    };
  });
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(`
        <div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
           <div class="media">
             <img src="${show.image}" alt="${show.name}" class="w-25 me-3">
             <div class="media-body">
               <h5 class="text-primary">${show.name}</h5>
               <div><small>${show.summary}</small></div>
               <button class="btn btn-outline-light btn-sm Show-getEpisodes">
                 Episodes
               </button>
             </div>
           </div>
        </div>
      `);

    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */
/*
This function takes id as a parameter then a get request is made with axios
the function will then return the response data that is transformed 
using the .map method with new properties
*/
async function getEpisodesOfShow(id) {
  const response = await axios({
    url: `http://api.tvmaze.com/shows/${id}/episodes`,
    method: "GET",
  });

  return response.data.map((ep) => ({
    id: ep.id,
    name: ep.name,
    season: ep.season,
    number: ep.number,
  }));
}

/** Given list of episodes, create markup for each and to DOM */

/*
For this function the event handler fetches each episode then displays
them on the webpage
*/

async function getEpisodesAndDisplay(evt) {
  const showId = $(evt.target).closest(".Show").data("show-id");

  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
}

/*  
This function first takes episodes as a parameter, then it uses the .empty method
to clear any existing items on the list. 

In the for-loop we iterate over each episode in the array,
and it creates a new list item that includes the name season and
number of each episode

Then we append each episode to the list
*/
function populateEpisodes(episodes) {
  $episodesList.empty();

  for (let ep of episodes) {
    const $item = $(
      `<li>
         ${ep.name}
         (season ${ep.season}, episode ${ep.number})
       </li>
      `
    );

    $episodesList.append($item);
  }
  $episodesArea.show();
}

/** Handle click on episodes button: get episodes for show and display */

$showsList.on("click", ".Show-getEpisodes", getEpisodesAndDisplay);
