const body = document.body;
const themeToggle = document.getElementById("themeToggle");
const sidebar = document.getElementById("sidebar");
const topbar = document.getElementById("topbar");
const pages = document.querySelectorAll(".page");
const menuItems = document.querySelectorAll(".menu li");
const loginForm = document.getElementById("loginForm");
const loginPage = document.getElementById("loginPage");
const logoutBtn = document.getElementById("logoutBtn");

function checkAuth() {
    const user = localStorage.getItem("user");
    if (user) {
        sidebar.style.display = "flex";
        topbar.style.display = "flex";
        pages.forEach(p => p.classList.remove("active"));
        document.getElementById("todoPage").classList.add("active");
        loginPage.classList.remove("active");
    } else {
        sidebar.style.display = "none";
        topbar.style.display = "none";
        pages.forEach(p => p.classList.remove("active"));
        loginPage.classList.add("active");
    }
}
checkAuth();

if (themeToggle) {
    themeToggle.addEventListener("click", () => body.classList.toggle("dark"));
}

if (loginForm) {
    loginForm.addEventListener("submit", e => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        if (password.length < 6) {
            alert("Password must be at least 6 characters!");
            return;
        }
        localStorage.setItem("user", JSON.stringify({ email }));
        checkAuth();
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("user");
        checkAuth();
    });
}

menuItems.forEach(item => {
    item.addEventListener("click", () => {
        menuItems.forEach(li => li.classList.remove("active"));
        item.classList.add("active");
        const pageId = item.dataset.page + "Page";
        pages.forEach(p => p.classList.remove("active"));
        document.getElementById(pageId).classList.add("active");
        if (pageId === "todoPage") initTodo(document.getElementById(pageId));
        if (item.dataset.page === "people") initPeople();
    });
});

let todoInitialized = false;

function initTodo(todoPage) {
    if (todoInitialized) return;
    todoInitialized = true;

    const addBtn = todoPage.querySelector('#addBtn');
    const newTaskInput = todoPage.querySelector('#newTask');
    const categories = todoPage.querySelectorAll('.category');
    const filters = todoPage.querySelectorAll('.filters button');

    function saveTasks() {
        const data = {};
        categories.forEach(cat => {
            const name = cat.dataset.category;
            data[name] = [];
            cat.querySelectorAll('.task').forEach(task => {
                const text = task.querySelector('span').textContent;
                const completed = task.querySelector('input[type="checkbox"]').checked;
                data[name].push({ text, completed });
            });
        });
        localStorage.setItem('tasks', JSON.stringify(data));
    }

    function loadTasks() {
        const saved = JSON.parse(localStorage.getItem('tasks') || '{}');
        categories.forEach(cat => {
            const name = cat.dataset.category;
            cat.innerHTML = `<h2>${cat.querySelector('h2').textContent}</h2>`;
            (saved[name] || []).forEach(taskData => {
                const task = createTaskElement(taskData.text, taskData.completed);
                cat.appendChild(task);
            });
        });
    }

    function createTaskElement(text, completed = false) {
        const task = document.createElement('div');
        task.className = 'task';
        task.draggable = true;
        task.innerHTML = `<input type="checkbox"${completed ? ' checked' : ''}><span>${text}</span><button class="edit"><img src="img/edit.svg" alt=""></button><button class="delete"><img src="img/delete.svg" alt=""></button>`;
        bindTaskEvents(task);
        if (completed) task.classList.add('completed');
        return task;
    }

    function bindTaskEvents(task) {
        const checkbox = task.querySelector('input');
        const span = task.querySelector('span');
        const deleteBtn = task.querySelector('.delete');
        const editBtn = task.querySelector('.edit');

        checkbox.addEventListener('change', () => {
            task.classList.toggle('completed', checkbox.checked);
            saveTasks();
        });

        deleteBtn.addEventListener('click', () => {
            task.remove();
            saveTasks();
        });

        editBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = span.textContent;
            input.className = 'edit-input';
            task.replaceChild(input, span);
            input.focus();

            function finishEdit() {
                span.textContent = input.value.trim() || span.textContent;
                task.replaceChild(span, input);
                saveTasks();
            }

            input.addEventListener('blur', finishEdit);
            input.addEventListener('keydown', e => { if (e.key === 'Enter') finishEdit(); });
        });

        task.addEventListener('dragstart', () => task.classList.add('dragging'));
        task.addEventListener('dragend', () => { task.classList.remove('dragging'); saveTasks(); });
    }

    categories.forEach(cat => {
        cat.addEventListener('dragover', e => e.preventDefault());
        cat.addEventListener('drop', () => {
            const draggingTask = todoPage.querySelector('.dragging');
            if (draggingTask) {
                cat.appendChild(draggingTask);
                draggingTask.classList.remove('dragging');
                saveTasks();
            }
        });
    });

    addBtn.addEventListener('click', () => {
        const text = newTaskInput.value.trim();
        if (!text) return;
        const task = createTaskElement(text);
        todoPage.querySelector('.category[data-category="design"]').appendChild(task);
        newTaskInput.value = '';
        saveTasks();
    });

    filters.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            todoPage.querySelectorAll('.task').forEach(task => {
                task.style.display = (filter === 'all' || (filter === 'completed' && task.classList.contains('completed')) || (filter === 'pending' && !task.classList.contains('completed'))) ? 'flex' : 'none';
            });
        });
    });

    loadTasks();
}

let analyticsInitialized = false;

async function initAnalytics() {
    if (analyticsInitialized) return;
    analyticsInitialized = true;

    const res = await fetch("sales_february_2025.json");
    const data = await res.json();
    const sales = data.sales;

    const salesByDate = {};
    sales.forEach(s => { salesByDate[s.date] = (salesByDate[s.date] || 0) + s.amount; });
    new Chart(document.getElementById("salesByDay"), {
        type: "line",
        data: { labels: Object.keys(salesByDate), datasets: [{ label: "Продажі", data: Object.values(salesByDate), borderColor: "#7100FC", backgroundColor: "rgba(113,0,252,0.2)", tension: 0.3, fill: true }] }
    });

    const leadsByDate = {};
    sales.filter(s => s.isLead).forEach(s => { leadsByDate[s.date] = (leadsByDate[s.date] || 0) + 1; });
    new Chart(document.getElementById("leadsByDay"), {
        type: "bar",
        data: { labels: Object.keys(leadsByDate), datasets: [{ label: "Ліди", data: Object.values(leadsByDate), backgroundColor: "#FF4D8D" }] }
    });

    const customerOrders = {};
    sales.forEach(s => { customerOrders[s.customerId] = (customerOrders[s.customerId] || 0) + 1; });
    const repeatCounts = {};
    Object.values(customerOrders).forEach(cnt => { repeatCounts[cnt] = (repeatCounts[cnt] || 0) + 1; });
    new Chart(document.getElementById("repeatPurchases"), {
        type: "pie",
        data: { labels: Object.keys(repeatCounts).map(c => `${c} покупки`), datasets: [{ data: Object.values(repeatCounts), backgroundColor: ["#7100FC","#00CFC1","#FF4D8D","#FFC857","#3A86FF"] }] }
    });

    const revenueByMonth = {};
    sales.forEach(s => { const month = s.date.slice(0,7); revenueByMonth[month] = (revenueByMonth[month] || 0) + s.amount; });
    new Chart(document.getElementById("revenueByMonth"), {
        type: "line",
        data: { labels: Object.keys(revenueByMonth), datasets: [{ label: "Оборот", data: Object.values(revenueByMonth), borderColor: "#00CFC1", backgroundColor: "rgba(0,207,193,0.2)", tension: 0.3, fill: true }] }
    });

    const salesByManager = {};
    sales.forEach(s => { salesByManager[s.manager] = (salesByManager[s.manager] || 0) + s.amount; });
    new Chart(document.getElementById("salesByManager"), {
        type: "radar",
        data: { labels: Object.keys(salesByManager), datasets: [{ label: "Продажі", data: Object.values(salesByManager), backgroundColor: "rgba(255,200,87,0.3)", borderColor: "#FFC857", pointBackgroundColor: "#7100FC" }] }
    });

    const managerStats = {};
    sales.forEach(s => {
        if (!managerStats[s.manager]) managerStats[s.manager] = { orders:0, revenue:0 };
        managerStats[s.manager].orders++;
        managerStats[s.manager].revenue += s.amount;
    });
    const managerTable = document.getElementById("managerTable");
    managerTable.innerHTML = "<tr><th>Manager</th><th>Orders</th><th>Revenue</th><th>Avg Check</th></tr>";
    Object.entries(managerStats).forEach(([manager, st]) => {
        managerTable.innerHTML += `<tr><td>${manager}</td><td>${st.orders}</td><td>${st.revenue}</td><td>${(st.revenue/st.orders).toFixed(2)}</td></tr>`;
    });

    const productStats = {};
    sales.forEach(s => {
        if (!productStats[s.product]) productStats[s.product] = { units:0, revenue:0 };
        productStats[s.product].units++;
        productStats[s.product].revenue += s.amount;
    });
    const lowTurnover = Object.entries(productStats).map(([prod, st]) => ({ product: prod, ...st })).sort((a,b)=>a.revenue-b.revenue);
    const lowTable = document.getElementById("lowTurnoverTable");
    lowTable.innerHTML = "<tr><th>Product</th><th>Units</th><th>Revenue</th></tr>";
    lowTurnover.forEach(p => { lowTable.innerHTML += `<tr><td>${p.product}</td><td>${p.units}</td><td>${p.revenue}</td></tr>`; });
}

document.getElementById("showCharts").addEventListener("click", ()=>{ document.getElementById("chartsContainer").style.display="block"; document.getElementById("tablesContainer").style.display="none"; });
document.getElementById("showTables").addEventListener("click", ()=>{ document.getElementById("chartsContainer").style.display="none"; document.getElementById("tablesContainer").style.display="block"; });

menuItems.forEach(item => { item.addEventListener("click", () => { if (item.dataset.page === "analytics") initAnalytics(); }); });

let peopleInitialized = false;
let peopleData = [];

async function initPeople() {
    if (peopleInitialized) return;
    peopleInitialized = true;

    const container = document.getElementById("peopleContainer");
    container.innerHTML = "<p>Loading...</p>";

    try {
        const res = await fetch("https://jsonplaceholder.typicode.com/users");
        peopleData = await res.json();
        renderPeople(peopleData, container);
    } catch {
        container.innerHTML = "<p style='color:red;'>Failed to load people.</p>";
    }
}

function renderPeople(list, container) {
    container.innerHTML = "";
    list.forEach(user => {
        const card = document.createElement("div");
        card.className = "person-card";
        card.innerHTML = `<h3>${user.name}</h3><p><strong>Email:</strong> ${user.email}</p><p><strong>Phone:</strong> ${user.phone}</p><p><strong>Company:</strong> ${user.company.name}</p>`;
        container.appendChild(card);
    });
}

menuItems.forEach(item => { item.addEventListener("click", () => { if (item.dataset.page === "people") initPeople(); }); });

const searchInput = document.querySelector(".topbar input");
if (searchInput) {
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();
        const container = document.getElementById("peopleContainer");
        if (!peopleInitialized || !document.getElementById("peoplePage").classList.contains("active")) return;
        const filtered = peopleData.filter(u => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query) || u.phone.toLowerCase().includes(query) || u.company.name.toLowerCase().includes(query));
        renderPeople(filtered, container);
    });
}

function initSettings() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const emailEl = document.querySelector("#userEmail strong");
    if (user.email && emailEl) emailEl.textContent = user.email;

    const themeBtn = document.getElementById("toggleThemeBtn");
    if (themeBtn) themeBtn.addEventListener("click", () => document.body.classList.toggle("dark"));

    const clearBtn = document.getElementById("clearDataBtn");
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to clear all local data?")) {
                localStorage.clear();
                alert("Local data cleared!");
                checkAuth();
            }
        });
    }
}

menuItems.forEach(item => { item.addEventListener("click", () => { if (item.dataset.page === "settings") initSettings(); }); });

const menuToggle = document.getElementById("menuToggle");
if (menuToggle) menuToggle.addEventListener("click", () => sidebar.classList.toggle("active"));

menuItems.forEach(item => { item.addEventListener("click", () => { if (window.innerWidth <= 768) sidebar.classList.remove("active"); }); });
