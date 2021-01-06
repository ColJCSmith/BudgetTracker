const pendItemName = `pending`;
const request = indexedDB.open(`budget`, 2);

request.onupgradeneeded = event => {
    const db = request.result;
    if (!db.objectStoreNames.contains(pendItemName)) {
        db.createObjectStore(pendItemName, { autoIncrement: true });
    }
};

request.onsuccess = event => {
    if (navigator.onLine) {
        checkDB();
    }
};

request.onerror = event => console.error(event);

function checkDB() {
    const db = request.result;
    let transaction = db.transaction([pendItemName], `readwrite`);
    let store = transaction.objectStore(pendItemName);
    const getAll = store.getAll();

    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch(`/api/transaction/bulk`, {
                method: `POST`,
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: `application/json, text/plain, */*`,
                    "Content-Type": `application/json`
                }
            })
                .then(response => response.json())
                .then(() => {
                    transaction = db.transaction([pendItemName], `readwrite`);
                    store = transaction.objectStore(pendItemName);
                    store.clear();
                });
        }
    };
}

function saveItem(record) {
    const db = request.result;
    const transaction = db.transaction([pendItemName], `readwrite`);
    const store = transaction.objectStore(pendItemName);
    store.add(record);
}
window.addEventListener(`online`, checkDB);
