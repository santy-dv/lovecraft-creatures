document.addEventListener('DOMContentLoaded', function() {
    const favoritesContainer = document.getElementById('favorites-container');
    const noFavoritesElement = document.getElementById('no-favorites');
    
    // Cargar favoritos al iniciar
    loadFavorites();
    
    function loadFavorites() {
        const favorites = getFavorites();
        
        if (favorites.length === 0) {
            noFavoritesElement.style.display = 'block';
            favoritesContainer.style.display = 'none';
            return;
        }
        
        noFavoritesElement.style.display = 'none';
        favoritesContainer.style.display = 'flex';
        displayFavorites(favorites);
    }
    
    function getFavorites() {
        return JSON.parse(localStorage.getItem('lovecraftFavorites') || '[]');
    }
    
    function displayFavorites(favorites) {
        favoritesContainer.innerHTML = favorites.map(creature => `
            <div class="col">
                <div class="card h-100 shadow-sm">
                    <img src="${creature.img?.[0] || './assets/placeholder.png'}" 
                         class="card-img-top creature-img" 
                         alt="${creature.name}"
                         onerror="this.src='./assets/placeholder.png'">
                    <div class="card-body">
                        <h5 class="card-title">${creature.name}</h5>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-dark">${creature.category}</span>
                            <span class="text-muted small">${creature.author || 'Autor desconocido'}</span>
                        </div>
                        <button class="btn btn-danger btn-sm w-100 mt-2 remove-favorite" 
                                data-id="${creature.id}">
                            <i class="bi bi-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Agregar event listeners para eliminar
        document.querySelectorAll('.remove-favorite').forEach(button => {
            button.addEventListener('click', function() {
                const creatureId = parseInt(this.getAttribute('data-id'));
                removeFavorite(creatureId);
            });
        });
    }
    
    function removeFavorite(creatureId) {
        let favorites = getFavorites();
        const creature = favorites.find(fav => fav.id === creatureId);
        
        favorites = favorites.filter(fav => fav.id !== creatureId);
        localStorage.setItem('lovecraftFavorites', JSON.stringify(favorites));
        
        // Mostrar notificación
        showToast(`${creature?.name || 'La criatura'} eliminada de favoritos`, 'danger');
        
        // Recargar la lista
        loadFavorites();
    }
    
    function showToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast show position-fixed bottom-0 end-0 m-3 bg-${type} text-white`;
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.remove(), 3000);
    }
});