
let currentCoords = null;
let database;

const dbRequest = indexedDB.open('CommentsDB', 1);

dbRequest.onupgradeneeded = function(event) {
    database = event.target.result;
    database.createObjectStore('comments', { keyPath: 'id', autoIncrement: true });
};

dbRequest.onsuccess = function(event) {
    database = event.target.result;
    console.log('IndexedDB успешно открыта');
};

dbRequest.onerror = function(event) {
    console.error('Ошибка открытия IndexedDB:', event);
};

document.getElementById('getLocationBtn').onclick = function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            currentCoords = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
            };
            document.getElementById('coordinates').innerText = 
                `Широта: ${currentCoords.latitude}, Долгота: ${currentCoords.longitude}`;
        }, error => {
            console.error(error);
            alert('Не удалось определить местоположение.');
        });
    } else {
        alert('Ваш браузер не поддерживает Geolocation.');
    }
};

document.getElementById('commentForm').onsubmit = function(event) {
    event.preventDefault();
    const commentText = document.getElementById('commentInput').value;

    if (currentCoords) {
        const commentData = {
            comment: commentText,
            coordinates: currentCoords
        };
        let commentsList = JSON.parse(localStorage.getItem('comments')) || [];
        commentsList.push(commentData);
        localStorage.setItem('comments', JSON.stringify(commentsList));
        document.getElementById('commentInput').value = '';
        renderComments();
    } else {
        alert('Сначала определите местоположение.');
    }
};

function renderComments() {
    const commentsList = JSON.parse(localStorage.getItem('comments')) || [];
    const commentsDisplay = document.getElementById('commentsList');
    commentsDisplay.innerHTML = '';

    commentsList.forEach(item => {
        commentsDisplay.innerHTML += `<div class="comment-item">Комментарий: ${item.comment}, Координаты: ${item.coordinates.latitude}, ${item.coordinates.longitude}</div>`;
    });
}

document.getElementById('saveToIndexedDBBtn').onclick = function() {
    const commentText = document.getElementById('commentInput').value;

    if (currentCoords && commentText) {
        const transaction = database.transaction('comments', 'readwrite');
        const store = transaction.objectStore('comments');

        const newComment = {
            comment: commentText,
            coordinates: currentCoords
        };

        const addRequest = store.add(newComment);
        addRequest.onsuccess = function() {
            console.log('Комментарий успешно добавлен в IndexedDB');
            document.getElementById('commentInput').value = '';
        };

        addRequest.onerror = function(event) {
            console.error('Ошибка добавления в IndexedDB:', event);
        };
    } else {
        alert('Сначала определите местоположение и введите комментарий.');
    }
};

document.getElementById('viewFromIndexedDBBtn').onclick = function() {
    const transaction = database.transaction('comments', 'readonly');
    const store = transaction.objectStore('comments');
    const getRequest = store.getAll();

    getRequest.onsuccess = function(event) {
        const items = event.target.result;
        const indexedDBDisplay = document.getElementById('indexedDBList');
        indexedDBDisplay.innerHTML = '';

        items.forEach(item => {
            indexedDBDisplay.innerHTML += `<div class="comment-item">Комментарий: ${item.comment}, Координаты: ${item.coordinates.latitude}, ${item.coordinates.longitude}</div>`;
        });
    };

    getRequest.onerror = function(event) {
        console.error('Ошибка при получении данных из IndexedDB:', event);
    };
};