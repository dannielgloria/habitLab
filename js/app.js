// Variables
var appName = "Habit Lab";
let filter = "all"; // es let porque el valor cambiará a lo largo del programa
const STORAGE = "habits"; // es const porque el valor no cambiará a lo largo del programa

//DOM Elements
const form = document.querySelector("#form"); // seleccionamos el formulario
const input = document.querySelector("#name"); // seleccionamos el input
const energy = document.getElementById("energy"); // seleccionamos el input de energía
const list = document.getElementById("lista"); // seleccionamos la lista donde se mostrarán los hábitos

// Botones
const btnAll = document.getElementById("all"); // seleccionamos el botón de "All"
const btnPending = document.getElementById("pending"); // seleccionamos el botón de "Pendientes"
const btnDone = document.getElementById("done"); // seleccionamos el botón de "Completados"

// Datos (array de objetos o el lugar donde se guardarán los hábitos)
let habits = load();


// Funciones

// carga los datos del localStorage
function load() {
    const data = localStorage.getItem(STORAGE); // guardamos en una variable los datos

    if (!data) {
        return [];
    }

    return JSON.parse(data);
}

// guarda los datos en el localStorage
function save() {
    localStorage.setItem(STORAGE, JSON.stringify(habits)); // guardamos los datos en el localStorage
}

// guarda habito en arreglo y guarda en localStorage
function addHabit(name, energy) {
    const habit = {
        id: Date.now(), // generamos un id único para cada hábito
        name: name, // nombre del hábito
        energy: energy, // energía del hábito
        done: false // estado del hábito (completado o no)
    };
    
    habits.push(habit); // agregamos el hábito al array de hábitos
    save(); // guardamos los datos en el localStorage
    render(); // renderizamos la lista de hábitos
}

// elimina un hábito del arreglo y del localStorage
function deleteHabit(id) {
    habits = habits.filter(habit => habit.id !== id); // eliminamos el hábito del array de hábitos
    save(); // guardamos los datos en el localStorage
    render(); // renderizamos la lista de hábitos
}

// obtiene los hábitos filtrados según el estado (all, pending o done)
function getFiltered() {
    if (filter === "pending") {
        return habits.filter(habit => !habit.done);
    } else if (filter === "done") {
        return habits.filter(habit => habit.done);
    } else {
        return habits;
    }
}

//  cambia el estado del hábito (completado o no)
function toggleHabit(id) {
    habits = habits.map(habit => {
        if (habit.id === id) {
            habit.done = !habit.done; // cambiamos el estado del hábito
        }
        return habit;       
    });
    save(); // guardamos los datos en el localStorage
    render(); // renderizamos la lista de hábitos
}

// renderiza la lista de hábitos
function render() {
    const data = getFiltered();

    list.innerHTML = data.map(habit => {
        return `
            <div class="border p-2 mb-2 flex justify-between">
                <span>
                ${habit.name} - energia: ${habit.energy}  - ${habit.done ? "✅" : "❌"}
                </span>

                <div>
                    <button onclick="toggle(${habit.id})" class="bg-green-500 text-white px-2 py-1">✅</button>
                    <button onclick="remove(${habit.id})" class="bg-red-500 text-white px-2 py-1">❌</button>
                </div>
            </div>
        `;
    }).join("");
}

// Eventos

// evento para agregar hábito
form.addEventListener("submit", (e) => {
    e.preventDefault(); // evitamos que el formulario se recargue

    addHabit(input.value, energy.value); // agregamos el hábito al array de hábitos
    
    form.reset(); // reseteamos el formulario
});

// eventos para filtrar hábitos
btnAll.addEventListener("click", () => {
    filter = "all"; // cambiamos el filtro a "all"
    render(); // renderizamos la lista de hábitos
});

btnPending.addEventListener("click", () => {
    filter = "pending"; // cambiamos el filtro a "pending"
    render(); // renderizamos la lista de hábitos
});

btnDone.addEventListener("click", () => {
    filter = "done"; // cambiamos el filtro a "done"
    render(); // renderizamos la lista de hábitos
});

// funciónes globales para botones de inline
window.toggle = toggleHabit; // hacemos la función toggleHabit global para poder usarla en los botones de inline
window.remove = deleteHabit; // hacemos la función removeHabit global para poder usarla en los botones de inline

// Init (renderizamos la lista de hábitos al cargar la página)
console.log(`Bienvenido a ${appName}`); // mensaje de bienvenida
render(); // renderizamos la lista de hábitos al cargar la página