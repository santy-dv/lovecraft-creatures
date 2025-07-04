document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const API_URL = 'https://lovecraftapirest.fly.dev/api/creatures';
    const creaturesContainer = document.getElementById('creatures-container');
    const loadingElement = document.getElementById('loading');
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    
    // Variables de estado
    let allCreatures = [];
    let currentCreature = null;
    let currentPage = 1;
    const creaturesPerPage = 20;
    
    // Inicializar modal
    const creatureModal = new bootstrap.Modal(document.getElementById('creatureModal'));
    
    // Cargar datos iniciales
    loadCreatures();
    
    // Función para cargar criaturas
    function loadCreatures() {
        showLoading();
        
        fetch(API_URL)
            .then(response => {
                if (!response.ok) throw new Error('Error al cargar los datos');
                return response.json();
            })
            .then(data => {
                allCreatures = data;
                displayCreatures(data.slice(0, creaturesPerPage));
                hideLoading();
            })
            .catch(error => {
                console.error("Error:", error);
                hideLoading();
                showError(error.message);
            });
    }
    
    // Mostrar/ocultar loading
    function showLoading() {
        loadingElement.style.display = 'block';
        creaturesContainer.style.display = 'none';
    }
    
    function hideLoading() {
        loadingElement.style.display = 'none';
        creaturesContainer.style.display = 'flex';
    }
    
    // Mostrar error
    function showError(message) {
        creaturesContainer.innerHTML = `
            <div class="alert alert-danger col-12">
                <i class="bi bi-exclamation-triangle"></i>
                ${message}
                <button onclick="location.reload()" class="btn btn-sm btn-warning ms-2">Reintentar</button>
            </div>
        `;
    }
    
    // Mostrar criaturas
    function displayCreatures(creaturesToShow = allCreatures) {
        creaturesContainer.innerHTML = '';
        
        if (creaturesToShow.length === 0) {
            creaturesContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-search" style="font-size: 2rem;"></i>
                    <h4 class="mt-3">¡Los grimorios no mencionan tales entidades!</h4>
                    <p class="text-muted">No encontramos criaturas con "${searchInput.value}"</p>
                    <button class="btn btn-outline-danger" id="showAllBtn">
                        <i class="bi bi-eye"></i> Mostrar todas las criaturas
                    </button>
                </div>
            `;
            
            document.getElementById('showAllBtn').addEventListener('click', function() {
                searchInput.value = '';
                currentPage = 1;
                displayCreatures(allCreatures.slice(0, creaturesPerPage));
            });
            
            return;
        }
        
        creaturesContainer.innerHTML = creaturesToShow.map(creature => `
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="card h-100 shadow-sm">
                    <img src="${creature.img?.[0] || 'assets/placeholder.png'}" 
                         class="card-img-top creature-img" 
                         alt="${creature.name}"
                         onerror="this.src='assets/placeholder.png'">
                    <div class="card-body">
                        <h5 class="card-title">${creature.name}</h5>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-dark">${creature.category}</span>
                            <span class="text-muted small">${creature.author || 'Autor desconocido'}</span>
                        </div>
                        <p class="card-text mt-2 text-truncate">${creature.overview || 'Descripción no disponible'}</p>
                        <button class="btn btn-outline-primary btn-sm w-100 view-details" 
                                data-id="${creature.id}">
                            <i class="bi bi-eye"></i> Ver detalles
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Agregar botón "Mostrar más" si hay más criaturas por mostrar
        const startIndex = (currentPage - 1) * creaturesPerPage;
        const endIndex = startIndex + creaturesPerPage;
        const hasMoreCreatures = endIndex < allCreatures.length;

        // Eliminar el botón anterior si existe
        const existingButton = document.querySelector('.load-more-container');
        if (existingButton) {
            existingButton.remove();
        }

        if (hasMoreCreatures) {
            // Crear un nuevo contenedor para el botón
            const loadMoreContainer = document.createElement('div');
            loadMoreContainer.className = 'container mt-4 mb-4 load-more-container';
            loadMoreContainer.innerHTML = `
                <div class="row">
                    <div class="col-md-6 mx-auto">
                        <button class="btn btn-outline-primary btn-lg w-100" id="loadMoreBtn">
                            <i class="bi bi-stars"></i> Mostrar más criaturas cósmicas
                        </button>
                    </div>
                </div>
            `;
            
            // Insertar el botón después del contenedor de criaturas
            creaturesContainer.parentNode.insertBefore(loadMoreContainer, creaturesContainer.nextSibling);

            document.getElementById('loadMoreBtn').addEventListener('click', function() {
                currentPage++;
                const nextCreatures = allCreatures.slice(0, currentPage * creaturesPerPage);
                displayCreatures(nextCreatures);
            });
        }
        
        // Agregar event listeners para los detalles
        document.querySelectorAll('.view-details').forEach(button => {
            button.addEventListener('click', function() {
                const creatureId = parseInt(this.getAttribute('data-id'));
                const creature = creaturesToShow.find(c => c.id === creatureId);
                if (creature) showCreatureDetails(creature);
            });
        });
    }
    
    // Mostrar detalles en el modal (VERSIÓN ACTUALIZADA)
    function showCreatureDetails(creature) {
        currentCreature = creature;
        
        // Actualizar contenido del modal
        document.getElementById('creatureModalTitle').textContent = creature.name;
        document.getElementById('creatureModalImage').src = creature.img?.[0] || 'assets/placeholder.png';
        document.getElementById('creatureModalCategory').textContent = creature.category;
        document.getElementById('creatureModalAuthor').textContent = creature.author || 'Desconocido';
        document.getElementById('creatureModalNicks').textContent = creature.nicks?.join(', ') || 'No disponible';
        document.getElementById('creatureModalCanon').textContent = creature.canon || 'No especificado';
        document.getElementById('creatureModalDescription').textContent = creature.overview || 'Descripción no disponible';
        
        // Configurar botón de favoritos
        const favoritesBtn = document.getElementById('addToFavoritesBtn');
        const favorites = getFavorites();
        const isFavorite = favorites.some(fav => fav.id === creature.id);
        
        favoritesBtn.innerHTML = isFavorite 
            ? '<i class="bi bi-star-fill"></i> En Favoritos' 
            : '<i class="bi bi-star"></i> Añadir a Favoritos';
        favoritesBtn.onclick = function() {
            toggleFavorite(creature, !isFavorite);
            creatureModal.hide();
        };
        
        // Mostrar modal
        creatureModal.show();
    }
    
    // Funciones para favoritos
    function getFavorites() {
        return JSON.parse(localStorage.getItem('lovecraftFavorites') || '[]');
    }
    
    function toggleFavorite(creature, add) {
        let favorites = getFavorites();
        
        if (add) {
            if (!favorites.some(fav => fav.id === creature.id)) {
                favorites.push(creature);
                showToast(`${creature.name} añadido a favoritos`, 'success');
            }
        } else {
            favorites = favorites.filter(fav => fav.id !== creature.id);
            showToast(`${creature.name} eliminado de favoritos`, 'danger');
        }
        
        localStorage.setItem('lovecraftFavorites', JSON.stringify(favorites));
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
    
    // Funcionalidad del buscador (VERSIÓN ACTUALIZADA)
    function performSearch(searchTerm) {
        console.log('Realizando búsqueda:', searchTerm);
        
        if (!searchTerm) {
            displayCreatures(allCreatures);
            return;
        }
        
        const filteredCreatures = allCreatures.filter(creature => {
            const matches = 
                creature.name.toLowerCase().includes(searchTerm) ||
                (Array.isArray(creature.nicks) && creature.nicks.some(nick => 
                    nick.toLowerCase().includes(searchTerm))) ||
                (creature.category && creature.category.toLowerCase().includes(searchTerm)) ||
                (creature.author && creature.author.toLowerCase().includes(searchTerm)) ||
                (creature.overview && creature.overview.toLowerCase().includes(searchTerm));
            
            if (matches) {
                console.log('Criatura encontrada:', creature.name);
            }
            return matches;
        });
        
        console.log('Total de resultados:', filteredCreatures.length);
        displayCreatures(filteredCreatures);
    }

    // Evento del formulario de búsqueda
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const searchTerm = searchInput.value.trim().toLowerCase();
        performSearch(searchTerm);
    });

    // Búsqueda en tiempo real
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        
        searchTimeout = setTimeout(() => {
            const searchTerm = this.value.trim().toLowerCase();
            if (searchTerm.length === 0) {
                displayCreatures(allCreatures);
            } else if (searchTerm.length > 2) {
                performSearch(searchTerm);
            }
        }, 300);
    });

    // Agregar evento al botón de búsqueda específicamente
    document.querySelector('#searchForm button[type="submit"]').addEventListener('click', function(e) {
        e.preventDefault();
        const searchTerm = searchInput.value.trim().toLowerCase();
        performSearch(searchTerm);
    });
});