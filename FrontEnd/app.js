// récupère les données de l'api
let reloadModal = localStorage.getItem("reloadModal");


function fetchWorks() {
    const token = localStorage.getItem('token');

    if (!token) {
        if (window.location.pathname !== '/FrontEnd/login.html') {
            window.location.href = '/FrontEnd/login.html';
        }
        return Promise.reject('No token');
    }

    return fetch('http://localhost:5678/api/works', {
        headers: {
            'Authorization': 'Bearer ' + token,
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(response.status);
            }
            return response.json();
        })
        .catch(error => {
            console.error('Erreur:', error);

            // Si le token n'est pas valide
            if (error.message == '401') {
                localStorage.removeItem('token');
                window.location.href = '/FrontEnd/login.html';
            }
        });
}

// Initialise l'élément de la galerie
function setupGalleryElement() {
    const element = document.getElementById('gallery');
    element.style.display = 'grid';
    element.style.gridTemplateColumns = 'repeat(3, 1fr)';
    element.style.gap = '10px';
    return element;
}

// Ajoute un élément de travail à la galerie de la home page 
function appendWorkToGallery(work, galleryElement) {
    let div = document.createElement('div');
    div.id = 'work_' + work.id;
    div.style.display = 'flex';
    div.style.flexDirection = 'column';
    div.style.alignItems = 'flex-start';
    div.style.margin = '10px';

    // crée un nouvel élément img
    let img = document.createElement('img');
    img.style.margin = '10px';
    let title = document.createElement('h3');

    // attribut src de l'élément img pour pointer vers l'image
    img.src = work.imageUrl;
    title.textContent = work.title;
    title.style.marginLeft = '10px'

    // ajoute l'élément img à l'élément gallery
    div.appendChild(img);
    div.appendChild(title);
    galleryElement.appendChild(div);
}


// Organise les données par catégorie
function organizeByCategory(data) {
    const result = {};
    for (let item of data) {
        const categoryName = item.category.name;
        if (!result[categoryName]) {
            result[categoryName] = [];
        }
        result[categoryName].push(item);
    }
    return result;
}

// Crée un bouton pour chaque catégorie
function createCategoryButton(category, categories, data, filterContainerElement) {
    const buttonElement = document.createElement('button');
    buttonElement.style.margin = '0 10px';
    buttonElement.style.width = 'auto';
    buttonElement.style.minWidth = '100px'
    buttonElement.style.color = '#1D6154'
    buttonElement.style.padding = '9px'
    buttonElement.style.borderRadius = '60px'
    buttonElement.style.fontWeight = '700'
    buttonElement.style.border = '1px solid #1D6154'
    buttonElement.style.backgroundColor = 'white'
    buttonElement.textContent = category;

    // Met à jour la galerie lorsque le bouton est cliqué
    buttonElement.addEventListener('click', () => {
        updateGalleryOnButtonClick(buttonElement, filterContainerElement, categories, data);
    });

    return buttonElement;
}

// Crée le conteneur de filtre
function createFilterContainer() {
    const filterContainerElement = document.createElement('div');
    filterContainerElement.id = 'filterContainer';
    return filterContainerElement;
}

// Ajoute tous les boutons de catégorie au conteneur de filtre
function addCategoryButtonsToFilterContainer(categories, data, filterContainerElement) {
    let categoryKeys = ['Tous'].concat(Object.keys(categories));
    for (let i = 0; i < categoryKeys.length; i++) {
        let category = categoryKeys[i];
        const button = createCategoryButton(category, categories, data, filterContainerElement);
        filterContainerElement.appendChild(button);
    }
}

// Met à jour la galerie lors du clic sur un bouton
function updateGalleryOnButtonClick(buttonElement, filterContainerElement, categories, data) {
    // Supprime la classe "button-selected" de tous les boutons
    const buttons = filterContainerElement.querySelectorAll('button');
    buttons.forEach(button => {
        button.classList.remove('button-selected');
        button.style.backgroundColor = 'white';
        button.style.color = '#1D6154';
    });

    // Ajoute la classe "button-selected" au bouton sélectionné
    buttonElement.classList.add('button-selected');
    buttonElement.style.backgroundColor = '#1D6154';
    buttonElement.style.color = 'white';

    // Vide la galerie
    const galleryElement = document.getElementById('gallery');
    galleryElement.innerHTML = '';

    // Ajoute les travaux de la catégorie sélectionnée à la galerie
    const selectedCategory = buttonElement.textContent;
    if (selectedCategory === 'Tous') {
        data.forEach(work => appendWorkToGallery(work, galleryElement));
    } else {
        categories[selectedCategory].forEach(work => appendWorkToGallery(work, galleryElement));
    }
}

// Ajoute le conteneur de filtre et la galerie à l'élément de contenu
function appendElementsToContent(filterContainerElement, galleryElement) {
    const contentElement = document.getElementById('content');
    contentElement.appendChild(filterContainerElement);
    contentElement.appendChild(galleryElement);
}

// supprime un travail de la gallerie 
function deleteWork(workId) {
    return fetch('http://localhost:5678/api/works/' + workId, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(response.status);
        }
    })

    .catch(error => {
        console.error('Erreur:', error);
    });
}


// Ajoute un élément de travail à la galerie de la fenètre modal
function appendWorkToModal(work, modalElement) {
    let div = document.createElement('div');
    div.className = 'img-content'

    // crée un nouvel élément img
    let img = document.createElement('img');
    let title = document.createElement('h4');

    // attribut src de l'élément img pour pointer vers l'image
    img.src = work.imageUrl;
    title.textContent = 'éditer';[]

    // Crée un bouton de suppression pour chaque travail
    let deleteButton = document.createElement('button');
    deleteButton.className = 'trash-btn'
    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';

    deleteButton.addEventListener('click', function () {
        deleteWork(work.id)
            .then(() => {
                
                div.remove();
    
                
                let workElementOnHomePage = document.getElementById('work_' + work.id);
                if (workElementOnHomePage) {
                    workElementOnHomePage.remove();
                }
                console.log(workElementOnHomePage);
            })
            .catch((error) => {
                console.error('Erreur:', error);
            });
    });

    // ajoute l'élément à l'élément gallery
    div.appendChild(img);
    div.appendChild(title);
    modalElement.appendChild(div);
    div.appendChild(deleteButton);
    modalElement.appendChild(div);
}

let fileInput = document.querySelector("#photoUpload");
let preview = document.querySelector("#preview-img");

fileInput.addEventListener("change", function(event) {
  let file = event.target.files[0];
  
  // Créez un URL temporaire pour le fichier
  let url = URL.createObjectURL(file);

  // Définissez l'URL comme source de l'image
  preview.src = url;
});

document.getElementById('photoUpload').addEventListener('change', function (event) {
    const input = event.target;

    if ('files' in input && input.files.length > 0) {
        placeImage(input.files[0]);
    }
}, false);

function placeImage(file) {
    const imagePreview = document.getElementById('preview-img');
    const label = document.querySelector('.custom-file-upload');
    const p = document.querySelector('.photoUpload p');
    const reader = new FileReader();
    const icones = document.querySelector('.fa-image')

    reader.addEventListener('load', function (event) {
        imagePreview.src = event.target.result;
        // Modifie le style CSS pour cacher le label et le paragraphe
        label.style.display = 'none';
        p.style.display = 'none';
        icones.style.display ='none'
    }, false);

    if (file) {
        reader.readAsDataURL(file);
    }
}



// modal 
let modalStack = [];
let focusables = [];
const focusablesSelector = 'button, a, input, textarea';

const openModal = function (e) {
    e.preventDefault();
    const target = document.querySelector(e.target.getAttribute('href'));
    if (target) {
        target.style.display = null;
        target.removeAttribute('aria-hidden');
        target.setAttribute('aria-modal', 'true');
        modalStack.push(target);
        modal = target;
        focusables = Array.from(modal.querySelectorAll(focusablesSelector));
        modal.addEventListener('click', function (e) {
            if (!e.target.closest('.js-modal-stop')) {
                closeModal(e);
            }
        });
        modal.querySelector('.js-close-modal').addEventListener('click', closeModal);
        modal.querySelector('.js-modal-stop').addEventListener('click', stopPropagation);
    }
}

const closeModal = function (e) {
    const modal = modalStack.pop();
    if (!modal) return;
    e.preventDefault();
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    modal.removeAttribute('aria-modal');
    modal.removeEventListener('click', closeModal);
    modal.querySelector('.js-close-modal').removeEventListener('click', closeModal);
    modal.querySelector('.js-modal-stop').removeEventListener('click', stopPropagation);
    if (modalStack.length > 0) {
        const lastModal = modalStack[modalStack.length - 1];
        focusables = Array.from(lastModal.querySelectorAll(focusablesSelector));
    }
}

const stopPropagation = function (e) {
    e.stopPropagation()
}
const focusInModal = function (e) {
    e.preventDefault();
    let index = focusables.findIndex(f => f === modal.querySelector(':focus'));
    if (e.shiftKey === true) {
        index--;
    } else {
        index++;
    }
    if (index >= focusables.length) {
        index = 0;
    }
    if (index < 0) {
        index = focusables.length - 1;
    }
    focusables[index].focus();
}

if (window.location.pathname == "/FrontEnd/Homepage_edit.html" || window.location.pathname == "/FrontEnd/index.html") {


    fetchWorks().then(data => {
        if (data) {
            const categories = organizeByCategory(data);
            const galleryElement = setupGalleryElement();
            const filterContainerElement = createFilterContainer();
            addCategoryButtonsToFilterContainer(categories, data, filterContainerElement);
            appendElementsToContent(filterContainerElement, galleryElement);
            filterContainerElement.querySelector('button').click();
        }
    });
    document.querySelectorAll('.js-modal').forEach(a => {
        a.addEventListener('click', openModal)

    })

    




    window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' || e.key === 'Esc') {
            closeModal(e)
        }
        if (e.key === 'Tab' && modal !== null) {
            focusInModal(e)
        }
    })

    const modalGallery = document.querySelector('#modal1 .gallerie');

    fetchWorks().then(data => {
        const modalGalleryElement = document.querySelector('#modal1 .gallerie');
        data.forEach(work => appendWorkToModal(work, modalGalleryElement));

    });


    const categorySelect = document.querySelector('#category');

    let defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "";
    categorySelect.appendChild(defaultOption);


    fetch('http://localhost:5678/api/categories', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(response.status);
            }

            return response.json();
        })
        .then(data => {

            data.forEach(category => {
                let option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name; 
                categorySelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Erreur:', error);
        });



    const addWorkForm = document.querySelector('#addWorkForm');

    addWorkForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = new FormData();
        let image = document.querySelector('#photoUpload').files[0];
        let title = document.querySelector('#title').value
        let categorie = document.querySelector('#category').value;

        formData.append('image', image);
        formData.append('title', title);
        formData.append('category', categorie);


        fetch('http://localhost:5678/api/works', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
            },
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.status);
                }
                location.reload();
            })
            .catch(error => {
                console.error('Erreur:', error);
            });
    });

}