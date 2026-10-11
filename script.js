// ============================================================
// СТИКЕРБОРД: drag & drop между двумя полями
// ============================================================

const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const stickerField = document.getElementById('stickerField');
const boardField = document.getElementById('boardField');

// Счётчик для уникальных id стикеров
let stickerCounter = 0;

// ============================================================
// 1. ДОБАВЛЕНИЕ СТИКЕРА
// ============================================================

function addSticker() {
    const text = taskInput.value.trim();

    if (text === '') {
        alert('Введите текст задачи!');
        return;
    }

    // Создаём стикер
    const sticker = document.createElement('div');
    sticker.classList.add('sticker');
    sticker.draggable = true;
    sticker.dataset.id = 'sticker-' + (++stickerCounter);

    // Текст
    const stickerText = document.createElement('span');
    stickerText.classList.add('sticker-text');
    stickerText.textContent = text;

    // Кнопка удаления
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('sticker-delete');
    deleteBtn.textContent = '✕';

    // Собираем стикер
    sticker.appendChild(stickerText);
    sticker.appendChild(deleteBtn);

    // Случайная позиция в поле
    placeRandom(sticker, stickerField);

    // Добавляем в поле
    stickerField.appendChild(sticker);

    // === ОБРАБОТЧИКИ ===

    // Удаление
    deleteBtn.addEventListener('click', (event) => {
        event.stopPropagation();   // чтобы не сработал клик по стикеру
        sticker.remove();
    });

    // Зачёркивание
    stickerText.addEventListener('click', () => {
        stickerText.classList.toggle('done');
    });

    // === DRAG & DROP ===

    sticker.addEventListener('dragstart', (event) => {
        sticker.classList.add('dragging');
        event.dataTransfer.setData('text/plain', sticker.dataset.id);
        event.dataTransfer.effectAllowed = 'move';
    });

    sticker.addEventListener('dragend', () => {
        sticker.classList.remove('dragging');
        document.querySelectorAll('.drop-zone').forEach(z => z.classList.remove('drag-over'));
    });

    // Очистка
    taskInput.value = '';
    taskInput.focus();
}

// ============================================================
// 2. СЛУЧАЙНАЯ ПОЗИЦИЯ ВНУТРИ ЗОНЫ
// ============================================================

function placeRandom(element, zone) {
    // Ждём, пока зона отрисуется, чтобы знать её размеры
    requestAnimationFrame(() => {
        const zoneRect = zone.getBoundingClientRect();
        const stickerW = 140;
        const stickerH = 100;

        // Максимальные координаты, чтобы стикер не вылез за границы
        const maxLeft = Math.max(0, zoneRect.width - stickerW - 20);
        const maxTop = Math.max(0, zoneRect.height - stickerH - 20);

        const left = Math.random() * maxLeft;
        const top = Math.random() * maxTop;

        element.style.left = left + 'px';
        element.style.top = top + 'px';
    });
}

// ============================================================
// 3. DRAG & DROP ДЛЯ ЗОН
// ============================================================

document.querySelectorAll('.drop-zone').forEach(zone => {
    zone.addEventListener('dragover', (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    });

    zone.addEventListener('dragenter', (event) => {
        event.preventDefault();
        zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', () => {
        zone.classList.remove('drag-over');
    });

    zone.addEventListener('drop', (event) => {
        event.preventDefault();
        zone.classList.remove('drag-over');

        // Находим стикер по id
        const stickerId = event.dataTransfer.getData('text/plain');
        const sticker = document.querySelector(`[data-id="${stickerId}"]`);

        if (!sticker) return;

        // Перемещаем стикер в новую зону
        zone.appendChild(sticker);

        // Ставим его в место, где отпустили мышь
        const zoneRect = zone.getBoundingClientRect();
        const x = event.clientX - zoneRect.left - 70;   // 70 = половина ширины стикера
        const y = event.clientY - zoneRect.top - 50;    // 50 = половина высоты

        // Ограничиваем, чтобы стикер не вылез за границы
        const maxX = zoneRect.width - 140;
        const maxY = zoneRect.height - 100;

        sticker.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
        sticker.style.top  = Math.max(0, Math.min(y, maxY)) + 'px';
    });
});

// ============================================================
// 4. КНОПКИ ОЧИСТКИ ПОЛЕЙ
// ============================================================

document.querySelectorAll('.clear-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const zoneId = btn.dataset.clear;
        const zone = document.getElementById(zoneId);

        if (!zone) return;

        if (confirm('Очистить всё поле?')) {
            zone.innerHTML = '';   // удаляем все стикеры
        }
    });
});

// ============================================================
// 5. СЛУШАТЕЛИ ДОБАВЛЕНИЯ
// ============================================================

addBtn.addEventListener('click', addSticker);

taskInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        addSticker();
    }
});