let currentImageIndex = 0;
let images = [];
let currentZoom = 1;

const aspectRatioMap = {
    '16:9': { width: 1344, height: 768 },
    '4:3': { width: 1088, height: 896 },
    '1:1': { width: 1024, height: 1024 },
    '9:16': { width: 768, height: 1344 }
};

const popupOverlay = document.getElementById('popupOverlay');
const popupImage = document.getElementById('popupImage');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const downloadBtn = document.getElementById('downloadBtn');

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function adjustImageSize() {
    const previewImage = document.getElementById('preview-image');
    const container = document.querySelector('.preview-container');
    if (previewImage && container) {
        const containerAspectRatio = container.clientWidth / container.clientHeight;
        const imageAspectRatio = previewImage.naturalWidth / previewImage.naturalHeight;

        if (containerAspectRatio > imageAspectRatio) {
            previewImage.style.height = '100%'; 
            previewImage.style.width = 'auto';
        } else {
            previewImage.style.width = '100%'; 
            previewImage.style.height = 'auto';
        }
    }
}

function updateZoom() {
    popupImage.style.transform = `scale(${currentZoom})`;
}

function adjustPopupImageSize() {
    const container = popupOverlay.querySelector('.popup-content');
    const containerAspectRatio = container.clientWidth / container.clientHeight;
    const imageAspectRatio = popupImage.naturalWidth / popupImage.naturalHeight;

    if (containerAspectRatio > imageAspectRatio) {
        popupImage.style.height = '100%'; 
        popupImage.style.width = 'auto';
    } else {
        popupImage.style.width = '100%'; 
        popupImage.style.height = 'auto';
    }
}

async function generateImages(resetExisting) {
    const prompts = Array.from(document.querySelectorAll('.prompt-field textarea'))
        .map(textarea => textarea.value.trim())
        .filter(Boolean);

    const style = document.getElementById('style').value;
    const aspectRatio = document.getElementById('aspect-ratio').value;
    const viewpoint = document.getElementById('viewpoint').value;
    const lighting = document.getElementById('lighting').value;
    const generateBtn = document.getElementById('generate-btn');
    const continueBtn = document.getElementById('continue-btn');
    const loading = document.querySelector('.loading');
    const result = document.getElementById('result');

    if (prompts.length === 0) {
        alert('Por favor, insira pelo menos um prompt');
        return;
    }

    generateBtn.disabled = true;
    loading.style.display = 'flex';

    if (resetExisting) {
        result.innerHTML = '';
        images = [];
    }

    // Mapeamento de tamanhos por proporção
    const aspectRatioStyles = {
        '16:9': { size: { width: 155, height: 75 } },
        '9:16': { size: { width: 92, height: 155 } },
        '4:3': { size: { width: 92, height: 70 } },
        '1:1': { size: { width: 89, height: 89 } }
    };

    // Estilo correspondente ao aspectRatio selecionado padrão 16:9
    const aspectRatioStyle = aspectRatioStyles[aspectRatio] || aspectRatioStyles['16:9'];

    for (let promptIndex = 0; promptIndex < prompts.length; promptIndex++) {
        const prompt = prompts[promptIndex];

        try {
            const response = await fetch('/api/image-generator', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt,
                    style,
                    viewpoint,
                    lighting,
                    aspectRatio,
                })
            });

            const jsonResponse = await response.json();

            if (!response.ok) {
                console.error('API Error:', jsonResponse);
                alert('Failed to generate image.');
                continue;
            }

            // Verifica se tem uma URL de imagem válida
            if (jsonResponse.imageUrl) {
                const imageContainer = document.createElement('div');
                imageContainer.className = 'image-container';

                // Aplica dimensões ao contêiner
                imageContainer.style.width = `${aspectRatioStyle.size.width}px`;
                imageContainer.style.height = `${aspectRatioStyle.size.height}px`;

                const img = document.createElement('img');
                img.src = jsonResponse.imageUrl;
                img.alt = `Generated image based on: ${prompt}`;
                img.style.opacity = 0;

                // Aplica dimensões diretamente à imagem
                img.style.width = '100%';
                img.style.height = '100%';

                // Adiciona tratamento de erro para a imagem
                img.onerror = () => {
                    console.error('Error loading image:', jsonResponse.imageUrl);
                    imageContainer.innerHTML = '<p class="error-message">Error loading image</p>';
                };

                img.addEventListener('load', () => {
                    img.style.opacity = 1;
                    images.push(img);
                });

                img.addEventListener('click', () => openPopup(images.indexOf(img)));

                imageContainer.appendChild(img);
                result.appendChild(imageContainer);
            } else {
                throw new Error('No image URL in response');
            }
        } catch (error) {
            console.error('Error generating image:', error);
            alert(`Error generating image for prompt: ${prompt}`);
        }
    }

    generateBtn.disabled = false;
    loading.style.display = 'none';
    continueBtn.style.display = 'inline-flex';
}

function openPopup(index) {
    currentImageIndex = index;
    updatePopupImage();
    popupOverlay.style.display = 'flex';
    currentZoom = 1;
    updateZoom();
    adjustPopupImageSize();
}

function updatePopupImage() {
    const img = images[currentImageIndex];
    popupImage.src = img.src;
    popupImage.alt = img.alt;
}

function navigateImage(direction) {
    currentImageIndex += direction;
    if (currentImageIndex < 0) currentImageIndex = images.length - 1;
    if (currentImageIndex >= images.length) currentImageIndex = 0;
    updatePopupImage();
    currentZoom = 1;
    updateZoom();
    adjustPopupImageSize();
}

function downloadImage(imageUrl) {
    // Verifica se a URL existe
    if (!imageUrl) {
        console.error('URL da imagem não fornecida');
        return;
    }
    
    // Cria URL para a rota de download
    const downloadUrl = `/download-image?url=${encodeURIComponent(imageUrl)}`;
    
    // Cria o link 
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function handleDownload() {
    const imageElement = document.querySelector('.popup-image'); 
    if (!imageElement) {
        console.error('Imagem não encontrada');
        return;
    }
    
    const imageUrl = imageElement.src;
    if (imageUrl) {
        downloadImage(imageUrl);
    } else {
        console.error('URL da imagem não encontrada');
    }
}

document.querySelector('#downloadBtn').addEventListener('click', handleDownload);
  
zoomInBtn.addEventListener('click', function () {
    currentZoom += 0.1;
    updateZoom();
});

zoomOutBtn.addEventListener('click', function () {
    currentZoom = Math.max(0.1, currentZoom - 0.1);
    updateZoom();
});

downloadBtn.addEventListener('click', handleDownload);

function closePopup() {
    popupOverlay.style.display = 'none';
}

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePopup();
    if (e.key === 'ArrowLeft') navigateImage(-1);
    if (e.key === 'ArrowRight') navigateImage(1);
});

function addNewPrompt() {
    const promptContainer = document.getElementById('prompt-container');
    const newPromptField = document.createElement('div');
    newPromptField.className = 'prompt-field #prompt'; 
    const promptCount = promptContainer.children.length + 1;

    newPromptField.innerHTML = `
        <label for="prompt-${promptCount}">Prompt ${promptCount}</label>
        <textarea id="prompt-${promptCount}" rows="3" required></textarea>
        <button type="button" class="copy-prompt" onclick="copyPrompt(this)">📋</button>
        <button type="button" class="delete-prompt" onclick="deletePrompt(this)">🗑️</button>
    `;

    promptContainer.appendChild(newPromptField);
}

function copyPrompt(button) {
    // Obtém o textarea relacionado ao botão
    const textarea = button.parentElement.querySelector('textarea');
    if (!textarea) {
        console.error('Nenhum campo de texto encontrado.');
        return;
    }

    // Seleciona e copia o texto usando a API Clipboard
    navigator.clipboard.writeText(textarea.value)
        .then(() => {
            console.log('Texto copiado com sucesso!');

            button.style.backgroundColor = '#02cc02'; // Cor verde para sucesso

            // Restaura a aparência original após 1 segundo
            setTimeout(() => {
                button.style.backgroundColor = '';
                button.style.color = '';
            }, 1000);
        })
        .catch(err => {
            console.error('Falha ao copiar o texto: ', err);

            button.style.backgroundColor = '#ff0000'; // Cor vermelha para erro

            // Restaura a aparência original após 1 segundo
            setTimeout(() => {
                button.style.backgroundColor = '';
                button.style.color = '';
            }, 1000);
        });
}

function confirmDeletion() {
    return new Promise((resolve) => {
        const userConfirmed = confirm('Tem certeza de que deseja deletar este campo?');
        resolve(userConfirmed);
    });
}

async function deletePrompt(button) {
    const promptField = button.closest('.prompt-field');

    // Verifica se o campo existe
    if (!promptField) {
        console.error('Campo de prompt não encontrado.');
        return;
    }

    // Confirmação do usuário
    const userConfirmed = await confirmDeletion();
    if (!userConfirmed) {
        console.log('Ação de exclusão cancelada pelo usuário.');
        return;
    }

    // Verifica se há mais de um campo antes de deletar
    const promptFields = document.querySelectorAll('.prompt-field');
    if (promptFields.length > 1) {
        promptField.remove();
        updatePromptLabels();
        console.log('Campo deletado com sucesso.');
    } else {
        alert('Você deve ter pelo menos um campo de prompt.');
    }
}

function updatePromptLabels() {
    const promptFields = document.querySelectorAll('.prompt-field');
    promptFields.forEach((field, index) => {
        const label = field.querySelector('label');
        const textarea = field.querySelector('textarea');
        label.textContent = `Prompt ${index + 1}`;
        label.setAttribute('for', `prompt-${index + 1}`);
        textarea.id = `prompt-${index + 1}`;
    });
}

window.addEventListener('resize', debounce(adjustImageSize, 250));
