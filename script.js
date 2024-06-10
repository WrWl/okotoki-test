// Елементи DOM
const root = document.getElementById('root');
const mainContainer = document.createElement('div');
const loadButton = document.createElement('button');
const searchContainer = document.createElement('div');
const searchInput = document.createElement('input');
const buttonsContainer = document.createElement('div');
const showFavoritesButton = document.createElement('button');
const showAllCoinsButton = document.createElement('button');
const content = document.createElement('div');
const favoritesContainer = document.createElement('div');
const favoritesList = document.createElement('div');

// Ініціалізація DOM
function initDOM() {
    mainContainer.id = 'mainContainer';
    mainContainer.style.display = 'none';

    loadButton.id = 'loadButton';
    loadButton.textContent = 'SEARCH';

    searchContainer.id = 'searchContainer';

    searchInput.type = 'text';
    searchInput.id = 'searchInput';
    searchInput.placeholder = 'Search...';

    buttonsContainer.id = 'buttonsContainer';

    showFavoritesButton.id = 'showFavoritesButton';
    showFavoritesButton.textContent = 'FAVORITES';

    showAllCoinsButton.id = 'showAllCoinsButton';
    showAllCoinsButton.textContent = 'ALL COINS';

    content.id = 'content';
    favoritesContainer.id = 'favoritesContainer';
    favoritesList.id = 'favoritesList';

    root.appendChild(loadButton);
    root.appendChild(mainContainer);

    mainContainer.appendChild(searchContainer);
    searchContainer.appendChild(searchInput);

    mainContainer.appendChild(buttonsContainer);
    buttonsContainer.appendChild(showFavoritesButton);
    buttonsContainer.appendChild(showAllCoinsButton);

    mainContainer.appendChild(content);
    mainContainer.appendChild(favoritesContainer);
    favoritesContainer.appendChild(favoritesList);
}

initDOM();

// Глобальні змінні
let allData = [];
let favorites = [];

// Функція для створення іконки "Вибране"
function createFavoritesIcon(isActive) {
    const icon = document.createElement('img');
    icon.className = 'favorite-icon';
    icon.setAttribute('src', isActive ? './icons/star-checked.svg' : './icons/star-unchecked.svg');
    return icon;
}

// Функція для фільтрації даних
function filterData(data, searchTerm) {
    content.innerHTML = '';
    data.forEach(item => {
        if (item.toLowerCase().startsWith(searchTerm)) {
            const itemElement = createItemElement(item);
            content.appendChild(itemElement);
        }
    });
}

// Функція для створення елемента списку
function createItemElement(item) {
    const itemElement = document.createElement('div');
    itemElement.className = 'item';

    const favoriteIcon = createFavoritesIcon(favorites.includes(item));
    itemElement.appendChild(favoriteIcon);

    const textElement = document.createElement('span');
    textElement.textContent = item;
    itemElement.appendChild(textElement);

    favoriteIcon.addEventListener('click', () => toggleFavorite(item, favoriteIcon));

    return itemElement;
}

// Функція для додавання/видалення зі списку обраного
function toggleFavorite(item, icon) {
    if (favorites.includes(item)) {
        favorites = favorites.filter(fav => fav !== item);
        icon.setAttribute('src', './icons/star-unchecked.svg');
        localStorage.removeItem(`favorite-${item}`);
        const favItem = favoritesList.querySelector(`[data-item="${item}"]`);
        if (favItem) favoritesList.removeChild(favItem);
    } else {
        favorites.push(item);
        icon.setAttribute('src', './icons/star-checked.svg');
        localStorage.setItem(`favorite-${item}`, item);
        const favoriteItem = createFavoriteItemElement(item);
        favoritesList.appendChild(favoriteItem);
    }
}

// Функція для створення елемента обраного списку
function createFavoriteItemElement(item) {
    const favoriteItem = document.createElement('div');
    favoriteItem.className = 'item';
    favoriteItem.dataset.item = item;

    const favoriteIcon = createFavoritesIcon(true);
    favoriteItem.appendChild(favoriteIcon);

    const textElement = document.createElement('span');
    textElement.textContent = item;
    favoriteItem.appendChild(textElement);

    favoriteIcon.addEventListener('click', () => toggleFavorite(item, favoriteIcon));

    return favoriteItem;
}

// Функція для завантаження даних з API
function loadFromAPI(callback) {
    fetch('https://api-eu.okotoki.com/coins')
        .then(response => response.json())
        .then(data => {
            allData = data;
            callback(data);
        })
        .catch(error => console.error('Error:', error));
}

// Функція для відображення даних
function displayData(data) {
    const searchTerm = searchInput.value.toLowerCase();
    content.innerHTML = '';

    const filteredData = data.filter(item => item.trim() !== '');
    const sortedData = filteredData.sort((a, b) => a.localeCompare(b));

    sortedData.forEach(item => {
        if (item.toLowerCase().includes(searchTerm)) {
            const itemElement = createItemElement(item);
            content.appendChild(itemElement);
        }
    });
}

// Функція для відображення обраного
function displayFavorites() {
    favoritesList.innerHTML = '';
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('favorite-')) {
            const item = localStorage.getItem(key);
            const favoriteItem = createFavoriteItemElement(item);
            favoritesList.appendChild(favoriteItem);
        }
    });
}

// Функція для оновлення стану іконок обраного
function updateFavoriteIconState() {
    const favoriteIcons = content.querySelectorAll('.item img');
    favoriteIcons.forEach(icon => {
        const item = icon.parentNode.textContent;
        icon.setAttribute('src', favorites.includes(item) ? './icons/star-checked.svg' : './icons/star-unchecked.svg');
    });
}

// Обробники подій
loadButton.addEventListener('click', () => {
    if (!allData.length) {
        loadFromAPI(() => {
            displayData(allData);
            updateFavoriteIconState();
        });
    }
    mainContainer.style.display = mainContainer.style.display === 'none' ? 'block' : 'none';
});

showFavoritesButton.addEventListener('click', () => {
    content.style.display = 'none';
    favoritesContainer.style.display = 'block';
    showFavoritesButton.style.fontWeight = 'bold';
    showAllCoinsButton.style.fontWeight = 'normal';
    displayFavorites();
    updateFavoriteIconState();
});

showAllCoinsButton.addEventListener('click', () => {
    content.style.display = 'block';
    favoritesContainer.style.display = 'none';
    showAllCoinsButton.style.fontWeight = 'bold';
    showFavoritesButton.style.fontWeight = 'normal';
    searchInput.value = '';
    content.innerHTML = '';
    displayData(allData);
    updateFavoriteIconState();
});

searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    filterData(allData, searchTerm);
});
