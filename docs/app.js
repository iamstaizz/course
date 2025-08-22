function saveTasks() {
    const categories = {};
    document.querySelectorAll('.category').forEach(cat => {
        const name = cat.dataset.category;
        categories[name] = [];
        cat.querySelectorAll('.task').forEach(task => {
            const text = task.querySelector('span').textContent;
            const completed = task.querySelector('input').checked;
            categories[name].push({ text, completed });
        });
    });
    localStorage.setItem('tasks', JSON.stringify(categories));
}

function loadTasks() {
    const saved = localStorage.getItem('tasks');
    if (!saved) return;
    const categories = JSON.parse(saved);
    Object.keys(categories).forEach(name => {
        const container = document.querySelector(`.category[data-category="${name}"]`);
        if (!container) return;
        container.innerHTML = `<h2>${container.querySelector('h2').textContent}</h2>`;
        categories[name].forEach(item => {
            const task = document.createElement('div');
            task.className = 'task';
            task.innerHTML = `<input type="checkbox"${item.completed ? ' checked' : ''}><span>${item.text}</span>`;
            if (item.completed) task.classList.add('completed');
            container.appendChild(task);
            bindCheckbox(task);
            bindDnD(task);
        });
    });
}

function bindCheckbox(task) {
    const checkbox = task.querySelector('input');
    checkbox.addEventListener('change', () => {
        task.classList.toggle('completed', checkbox.checked);
        saveTasks();
    });
}

function bindDnD(task) {
    let dragging = false;
    let clone = null;
    let offsetX = 0;
    let offsetY = 0;

    task.addEventListener('touchstart', e => {
        const touch = e.touches[0];
        const rect = task.getBoundingClientRect();
        offsetX = touch.clientX - rect.left;
        offsetY = touch.clientY - rect.top;
        dragging = false;
    });

    task.addEventListener('touchmove', e => {
        const touch = e.touches[0];
        if (!dragging) {
            const dx = Math.abs(touch.clientX - (task.getBoundingClientRect().left + offsetX));
            const dy = Math.abs(touch.clientY - (task.getBoundingClientRect().top + offsetY));
            if (dx > 10 || dy > 10) {
                dragging = true;
                clone = task.cloneNode(true);
                clone.style.position = 'absolute';
                clone.style.zIndex = 1000;
                clone.style.width = `${task.offsetWidth}px`;
                clone.style.opacity = 0.7;
                clone.style.pointerEvents = 'none';
                document.body.appendChild(clone);
            } else return;
        }
        if (dragging && clone) {
            clone.style.left = `${touch.pageX - offsetX}px`;
            clone.style.top = `${touch.pageY - offsetY}px`;
        }
    });

    task.addEventListener('touchend', e => {
        if (!dragging) return;
        const touch = e.changedTouches[0];
        const dropElem = document.elementFromPoint(touch.clientX, touch.clientY);
        const dropCategory = dropElem.closest('.category');
        if (dropCategory) dropCategory.appendChild(task);
        if (clone) clone.remove();
        dragging = false;
        saveTasks();
    });

    task.addEventListener('mousedown', e => {
        e.preventDefault();
        const rect = task.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        dragging = true;
        clone = task.cloneNode(true);
        clone.style.position = 'absolute';
        clone.style.zIndex = 1000;
        clone.style.width = `${task.offsetWidth}px`;
        clone.style.opacity = 0.7;
        clone.style.pointerEvents = 'none';
        document.body.appendChild(clone);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
        if (dragging && clone) {
            clone.style.left = `${e.pageX - offsetX}px`;
            clone.style.top = `${e.pageY - offsetY}px`;
        }
    }

    function onMouseUp(e) {
        if (dragging) {
            const dropElem = document.elementFromPoint(e.clientX, e.clientY);
            const dropCategory = dropElem.closest('.category');
            if (dropCategory) dropCategory.appendChild(task);
            if (clone) clone.remove();
            dragging = false;
            saveTasks();
        }
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
}

document.getElementById('addBtn').addEventListener('click', () => {
    const text = document.getElementById('newTask').value.trim();
    if (!text) return;
    const task = document.createElement('div');
    task.className = 'task';
    task.innerHTML = `<input type="checkbox"><span>${text}</span>`;
    document.querySelector('.category[data-category="design"]').appendChild(task);
    bindCheckbox(task);
    bindDnD(task);
    document.getElementById('newTask').value = '';
    saveTasks();
});

document.querySelectorAll('.task').forEach(task => {
    bindCheckbox(task);
    bindDnD(task);
});

loadTasks();
