// favorite-sync.js

// Import the necessary Firebase functions from the Modular SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, onValue, set, remove, get } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAsXxiBkpkOywb7goIfcBRBnB8vNPt9hjc",
    authDomain: "isukat.firebaseapp.com",
    databaseURL: "https://isukat-default-rtdb.firebaseio.com",
    projectId: "isukat",
    storageBucket: "isukat.appspot.com",
    messagingSenderId: "751168754443",
    appId: "1:751168754443:web:e96a67dab5e30f077a080e",
    measurementId: "G-J090BFT08X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

let currentUser = null;
let userFavorites = {};
let favoriteCallbacks = [];

// Initialize Favorites Synchronization
export function initFavoritesSync() {
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        if (user) {
            const favoritesRef = ref(db, `favorites/${user.uid}`);
            onValue(favoritesRef, (snapshot) => {
                userFavorites = snapshot.val() || {};
                // Notify all registered callbacks about the updated favorites
                favoriteCallbacks.forEach(callback => callback(userFavorites));
            });
        } else {
            userFavorites = {};
            // Notify callbacks that there are no favorites
            favoriteCallbacks.forEach(callback => callback(userFavorites));
        }
    });
}

// Toggle Favorite Item
export async function toggleFavoriteItem(shoeId) {
    const user = auth.currentUser;
    if (!user) {
        console.error("User not authenticated");
        return false;
    }

    const userFavoritesRef = ref(db, `favorites/${user.uid}/${shoeId}`);
    const snapshot = await get(userFavoritesRef);

    if (snapshot.exists()) {
        await set(userFavoritesRef, null); // Remove from favorites
        return false;
    } else {
        await set(userFavoritesRef, true); // Add to favorites
        return true;
    }
}

// Check if a Shoe is Favorite
export async function checkFavoriteStatus(shoeId) {
    const user = auth.currentUser;
    if (!user) {
        return false;
    }

    const userFavoritesRef = ref(db, `favorites/${user.uid}/${shoeId}`);
    const snapshot = await get(userFavoritesRef);
    return snapshot.exists();
}

// Register a Callback to Listen for Favorites Changes
export function registerFavoritesCallback(callback) {
    if (typeof callback === 'function') {
        favoriteCallbacks.push(callback);
    }
}

// Get Current User Favorites
export function getUserFavorites() {
    return { ...userFavorites }; // Return a shallow copy to prevent external mutations
}
