function bindCheckbox(task) {
    const checkbox = task.querySelector('input');
    checkbox.addEventListener('change', () => {
        task.classList.toggle('completed', checkbox.checked);
    });
}

function bindDnD(task) {
    let dragging = false;
    let clone = null;
    let offsetX = 0;
    let offsetY = 0;

    task.addEventListener('touchstart', e => {
        const touch = e.touches[0];
        offsetX = touch.clientX - task.getBoundingClientRect().left;
        offsetY = touch.clientY - task.getBoundingClientRect().top;
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
            } else {
                return;
            }
        }

        if (dragging && clone) {
            clone.style.left = `${touch.clientX - offsetX}px`;
            clone.style.top = `${touch.clientY - offsetY}px`;
        }
    });

    task.addEventListener('touchend', e => {
        if (!dragging) return;

        const touch = e.changedTouches[0];
        let dropElem = document.elementFromPoint(touch.clientX, touch.clientY);
        let dropCategory = dropElem.closest('.category');

        if (dropCategory) {
            dropCategory.appendChild(task);
        }

        if (clone) {
            clone.remove();
            clone = null;
        }

        dragging = false;
    });
}

document.getElementById('addBtn').addEventListener('click', () => {
    const text = document.getElementById('newTask').value.trim();
    if (text) {
        const task = document.createElement('div');
        task.className = 'task';
        task.innerHTML = `<input type="checkbox"><span>${text}</span>`;

        document.querySelector('.category[data-category="design"]').appendChild(task);
        bindCheckbox(task);
        bindDnD(task);
        document.getElementById('newTask').value = '';
    }
});

document.querySelectorAll('.task').forEach(task => {
    bindCheckbox(task);
    bindDnD(task);
});
