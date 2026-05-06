// Variables
const APP_NAME = "Habit Lab"; // es const porque el valor no cambiará a la ejecución del programa

const STORAGE = "habit-lab:habits"; // se sentraliza en una constante para evitar errores al escribr texto vaias veces

// Estado principal de la aplicacion.
// Se mantiene en un solo objeto para que sea facil saber que datos estan disponibles en la aplicacion y para evitar tener muchas variables 
// sueltas por el codigo.
const state = {
    habits: loadHabits(), // cargamos los hábitos del localStorage al iniciar la aplicación con la función loadHabits()
    currentFilter: "all" // estado del filtro actual en este caso mostrara todos los hábitos, pero puede cambiarse a "pending" o "done"
};

// referencia al DOM
// Se agrupan todos los elementos en un objeto llamado elements 
const elements = {
    form: document.querySelector("#habitForm"), // seleccionamos el formulario
    habitName: document.querySelector("#habitName"), // seleccionamos el input del nombre del hábito
    habitEnergy: document.querySelector("#habitEnergy"), // seleccionamos el input de energía del hábito
    formMessage: document.querySelector("#formMessage"), // seleccionamos el elemento donde se mostrarán los mensajes del formulario
    habitList: document.querySelector("#habitList"), // seleccionamos la lista donde se mostrarán los hábitos
    filterButtons: document.querySelectorAll(".filter-btn"), // seleccionamos todos los botones para aplicar los filtros
    totalCount: document.querySelector("#totalCount"), // seleccionamos el elemento donde se mostrará el conteo total de hábitos
    pendingCount: document.querySelector("#pendingCount"), // seleccionamos el elemento donde se mostrará el conteo de hábitos pendientes
    doneCount: document.querySelector("#doneCount") // seleccionamos el elemento donde se mostrará el conteo de hábitos completados
}

// Inicializar la aplicación
// Separar la inicializacion para que sea mas facil de entender y para que el código sea mas organizado.
function init() {
    bindEvents(); // vinculamos los eventos a los elementos del DOM
    render(); // renderizamos la lista de hábitos al cargar la página

    console.log(`Bienvenido a ${APP_NAME}`); // mensaje de bienvenida
}

//Registra los eventos principales de la aplicación
// Esto evitara tener eventoz mezclados con la lógica de la aplicación y hará que el código sea más organizado y fácil de entender.
function bindEvents() {
    elements.form.addEventListener("submit", handleFormSubmit); // evento que escucha si oprime el botón de submit del formulario para agregar un 
    // nuevo hábito

    elements.filterButtons.forEach((button) => {
        button.addEventListener("click", handleFilterClick); // evento que escucha si se hace click en alguno de los botones de filtro para cambiar 
        // el estado del filtro actual
    })

    // Delegacion de eventos:
    // En lugar de usar un evenyo onclick (es decir que se ejecuta al hacer click en el botón) en el html, 
    // va a escuchar los clics que esten dentro de el contenedor de la lista de hábitos 
    // Esto ayuda a que si se tiene que modicar el html, no se tenga que modificar el código js
    elements.habitList.addEventListener("click", handleHabitAction); // evento que escucha los clics dentro de la lista de hábitos para manejar
    // las acciones de completar o eliminar un hábito
}


// Carga los hábitos del localStorage
// se usa un try/catch para evitar que la app falle si el almacenamiento tiene datos invalidos
function loadHabits() {
    try {
        const storeHabits = localStorage.getItem(STORAGE); // obtenemos los hábitos almacenados en el localStorage
        
        if (!storeHabits) {
            return []; // si no hay hábitos almacenados, retornamos un array vacío
        }
        return JSON.parse(storeHabits);
    } catch (error) {
        console.error("No se pudieron cargar los hábitos:", error);
        return [];
    }
}

// Guarda los hábitos actuales en el localStorage
// Esta funcion centraliza el guardado para no estar repitiendo logica
function saveHabits() {
    localStorage.setItem(STORAGE, JSON.stringify(state.habits)); // convertimos el array de hábitos a una cadena JSON y lo guardamos en el localStorage
}

// funcion para manejar el envio del formulario
function handleFormSubmit(event) { // handleFormSubmit en español seria: manejarEnvioFormulario
    event.preventDefault(); // evitamos que el formulario se recargue al enviar

    const habitName = elements.habitName.value.trim(); // obtenemos el valor del input del nombre del hábito y eliminamos espacios en blanco
    const habitEnergy = elements.habitEnergy.value; // obtenemos el valor seleccionado del select de energía del hábito

    // Validación básica del formulario
    // evita que se agreguen hábitos sin nombre (evita habitos fantasma)
    if (!habitName) {
        showMessage("Escribe el nombre del hábito antes de agregarlo"); // mostramos un mensaje de error si el nombre del hábito está vacío
        return;
    }

    // Crear un nuevo hábito
    addHabit(habitName, habitEnergy); // llamamos a la función para agregar un nuevo hábito con el nombre y energía proporcionados


    // Limpiar el formulario después de agregar el hábito
    elements.form.reset(); // reseteamos el formulario para limpiar los campos después de agregar un hábito
    elements.habitName.focus(); // ponemos el foco de nuevo en el input del nombre del hábito para facilitar la entrada de nuevos hábitos
    hideMessage(); // ocultamos cualquier mensaje que se haya mostrado anteriormente
}

// Cambia el estado de un habito
// Nos devolvera (retornará) el objeto habito cuando se cambie su estado para poder mostrarse
function toggleHabit(id) { // toggleHabit en español seria: cambiarEstadoHabito
    state.habits = state.habits.map((habit) => {
        if (habit.id !== id) { // buscamos el hábito con el id proporcionado
            return habit; // si el id no coincide, retornamos el hábito sin cambios
        }

        return {
            ...habit, // se devuelve eo habito pero con el estado actualizado
            done: !habit.done // cambiamos el estado de "done" a su valor contrario (si estaba en true, se cambia a false y viceversa)
        }; 
    });

    saveHabits(); // guardamos los hábitos actualizados en el localStorage
    render(); // renderizamos o actualizamos la lista de hábitos para reflejar el cambio en la interfaz
}

// Elimina un hábito de la lista
function deleteHabit(id) {
    state.habits = state.habits.filter((habit) => habit.id !== id);//filtramos el array de hábitos para eliminar el hábito con el id 
    // proporcionado y devolvemos un nuevo array sin ese hábito
    saveHabits();
    render();
}

// Obtiene habitos filtrados según el estado del filtro actual
function getFilteredHabits() {
    if (state.currentFilter === "pending") {
        return state.habits.filter((habit) => !habit.done); // si el filtro es "pending", retornamos solo los hábitos 
        // que no están completados (done: false)
    }
    if (state.currentFilter === "done") {
        return state.habits.filter((habit) => habit.done); // si el filtro es "done", retornamos solo los hábitos que están completados (done: true)
    }

    return state.habits; // si el filtro es "all", retornamos todos los hábitos sin filtrar
}

// Maneja el cambio del filtro al hacer click en los botones
function handleFilterClick(event) {
    const selectedFilter = event.target.dataset.filter; // obtenemos el valor del filtro seleccionado del atributo data-filter del botón clickeado

    state.currentFilter = selectedFilter; // actualizamos el estado del filtro actual con el valor seleccionado
    render(); // renderizamos la lista de hábitos para mostrar los hábitos filtrados según el nuevo estado del filtro
}