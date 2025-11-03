const searchInput = document.getElementById('search-input');
const searchIcon = document.querySelector('.search-icon');
const quotesDisplay = document.getElementById('quotes-display');
const favoritesDisplay = document.getElementById('favorites-display');
const clearFavoritesBtn = document.getElementById('clear-favorites');

let quotesCache = [];
let isQuotesLoaded = false;

const FAVORITES_KEY = 'favorites';


searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') performSearch();
});

searchIcon.addEventListener('click', performSearch);

clearFavoritesBtn.addEventListener('click', () => {
  favoritesDisplay.innerHTML = '';
  localStorage.removeItem(FAVORITES_KEY);
  document.getElementById('favorites-section').classList.add('hidden');
});


window.onload = () => {
  loadFavorites();
  fetchQuotes(); 
};


function fetchQuotes() {
  fetch('https://dummyjson.com/quotes')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return res.json();
    })
    .then(data => {
      quotesCache = (data.quotes || []).map(quote => ({
        q: quote.quote,
        a: quote.author
      }));
      isQuotesLoaded = true;
      console.log(`Loaded ${quotesCache.length} quotes from API ✅`);

    })
    .catch(err => {
      console.warn(`Failed to load quotes: ${err.message}`);
    });
}



function loadFavorites() {
  const savedQuotes = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  
  if (savedQuotes.length === 0) {
    document.getElementById('favorites-section').classList.add('hidden');
  } else {
    document.getElementById('favorites-section').classList.remove('hidden');
    savedQuotes.forEach(quote => {
      favoritesDisplay.innerHTML += quoteWithIcon(quote, true);
    });
    attachBookmark();
  }
}



function performSearch() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  if (!isQuotesLoaded) {
    alert('Quotes are still loading, please wait a moment...');
    return;
  }

  const matches = quotesCache.filter(q =>
    q.q.toLowerCase().includes(searchTerm) ||
    q.a.toLowerCase().includes(searchTerm)
  );

  displayQuotes(matches);
}



function displayQuotes(quotes) {
  document.getElementById('search-section').classList.remove('hidden');

  quotesDisplay.innerHTML = '';

  if (quotes.length === 0) {
    quotesDisplay.innerHTML = '<p>No quotes found</p>';
  } else {
    quotes.forEach(quote => {
      quotesDisplay.innerHTML += quoteWithIcon(quote, false);
    });
    attachBookmark();
  }
}



function quoteWithIcon(quote, isFavorite) {
  const quoteHTML = `
    <p class='quote-text'>${quote.q}</p>
    <span class='quote-author'>— ${quote.a}</span>
  `;

  if (isFavorite) {
    return `
      <div class='quote-box'>
        <i class='fa-solid fa-xmark remove-favorite'></i>
        ${quoteHTML}
      </div>
    `;
  } else {
    return `
      <div class='quote-box'>
        <i class='fa-regular fa-bookmark bookmark-icon'></i>
        ${quoteHTML}
      </div>
    `;
  }
}



function attachBookmark() {
  document.querySelectorAll('.bookmark-icon').forEach(icon => {
    icon.onclick = () => toggleFavorite(icon);
  });

  document.querySelectorAll('.remove-favorite').forEach(icon => {
    icon.onclick = () => removeFavorite(icon);
  });
}


function toggleFavorite(icon) {
  const quoteDiv = icon.parentElement;
  const text = quoteDiv.querySelector('.quote-text').textContent;
  const author = quoteDiv.querySelector('.quote-author').textContent.replace('— ', '');
  const quote = { q: text, a: author };

  const isFav = icon.classList.contains('saved');

  if (isFav) {
    icon.classList.remove('fa-solid', 'saved');
    icon.classList.add('fa-regular');
    removeFavorite(icon);
  } else {
    icon.classList.remove('fa-regular');
    icon.classList.add('fa-solid', 'saved');
    addFavorite(quote);
  }
  attachBookmark();
}



function addFavorite(quote) {
  const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];

  if (favorites.some(f => f.q === quote.q && f.a === quote.a)) {
    return;
  }

  favorites.unshift(quote);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  
  favoritesDisplay.innerHTML = '';
  favorites.forEach(fav => {
    favoritesDisplay.innerHTML += quoteWithIcon(fav, true);
  });
  
  attachBookmark();
  document.getElementById('favorites-section').classList.remove('hidden');
}



function removeFavorite(icon) {
  const quoteDiv = icon.parentElement;
  const text = quoteDiv.querySelector('.quote-text').textContent;
  const author = quoteDiv.querySelector('.quote-author').textContent.replace('— ', '');

  let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  favorites = favorites.filter(f => !(f.q === text && f.a === author));
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));

  const favQuotes = favoritesDisplay.querySelectorAll('.quote-box');
  favQuotes.forEach(box => {
    const boxText = box.querySelector('.quote-text').textContent;
    const boxAuthor = box.querySelector('.quote-author').textContent.replace('— ', '');
    if (boxText === text && boxAuthor === author) {
      favoritesDisplay.removeChild(box);
    }
  });

  const icons = quotesDisplay.querySelectorAll('.bookmark-icon');
  icons.forEach(bookmark => {
    const bText = bookmark.parentElement.querySelector('.quote-text').textContent;
    const bAuthor = bookmark.parentElement.querySelector('.quote-author').textContent.replace('— ', '');
    if (bText === text && bAuthor === author) {
      bookmark.classList.remove('fa-solid', 'saved');
      bookmark.classList.add('fa-regular');
    }
  });

  if (favorites.length === 0) {
    document.getElementById('favorites-section').classList.add('hidden');
  }
}



