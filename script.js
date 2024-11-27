const slider = document.getElementById("slider");
const scrollLeftButton = document.getElementById("scroll-left");
const scrollRightButton = document.getElementById("scroll-right");
const taskForm = document.getElementById("task-form");
const taskNameInput = document.getElementById("task-name");
const startTimeInput = document.getElementById("start-time");
const endTimeInput = document.getElementById("end-time");
const taskColorInput = document.getElementById("task-color"); // Новый элемент для выбора цвета
const taskList = document.createElement("div"); // Новый блок для отображения задач под слайдером
document.body.appendChild(taskList); // Добавляем блок задач в тело документа
const deleteAllButton = document.getElementById("delete-all-tasks"); // Кнопка "Удалить все задачи"

// Модальное окно и кнопки
const deleteModal = document.getElementById("delete-modal");
const confirmDeleteButton = document.getElementById("confirm-delete");
const cancelDeleteButton = document.getElementById("cancel-delete");

let currentPosition = 0;
const slideWidth = 120; // Ширина одного часа
const visibleCount = 5; // Количество видимых часов
const totalWidth = 2880; // Общая ширина слайдера (24 * 120px)

// Генерация слайдов для 24 часов
function generateHours() {
  for (let i = 0; i < 24; i++) {
    const hourDiv = document.createElement("div");
    hourDiv.classList.add("hour");
    hourDiv.textContent = `${String(i).padStart(2, "0")}:00`;
    slider.appendChild(hourDiv);
  }
}

// Преобразование времени в минуты с начала дня
function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// Преобразование цвета из формата #RRGGBB в rgba с альфа-каналом
function hexToRgba(hex, alpha = 0.3) {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((hexChar) => hexChar + hexChar)
      .join("");
  }
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Добавление задачи на слайдер с прозрачным фоном
function addTaskToSlider(taskName, startTime, endTime, taskColor, taskId) {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const rgbaColor = hexToRgba(taskColor, 0.3); // Прозрачность 0.3

  const taskElement = document.createElement("div");
  taskElement.classList.add("task");
  taskElement.style.left = `${(startMinutes / 60) * slideWidth}px`;
  taskElement.style.width = `${
    ((endMinutes - startMinutes) / 60) * slideWidth
  }px`;
  taskElement.textContent = taskName;
  taskElement.style.backgroundColor = rgbaColor;
  taskElement.setAttribute("data-id", taskId); // Присваиваем id для удаления

  slider.appendChild(taskElement);
}

// Функция добавления задачи в список под слайдером
function addTaskToList(taskName, startTime, endTime, taskColor, taskId) {
  const taskDiv = document.createElement("div");
  taskDiv.classList.add("task-item");
  taskDiv.setAttribute("data-id", taskId); // Уникальный ID для каждой задачи

  const taskText = document.createElement("span");
  taskText.textContent = `${taskName} (${startTime} - ${endTime})`;

  // Чекбокс для удаления задачи
  const taskCheckbox = document.createElement("input");
  taskCheckbox.type = "checkbox";
  taskCheckbox.addEventListener("change", () => {
    if (taskCheckbox.checked) {
      // Если чекбокс отмечен, перечеркиваем задачу и блокируем взаимодействие
      taskText.style.textDecoration = "line-through"; // Перечеркиваем текст
      taskCheckbox.disabled = true; // Блокируем чекбокс
      deleteButton.disabled = true; // Блокируем кнопку удаления
      deleteButton.style.display = "none"; // Прячем кнопку удаления
    } else {
      // Если чекбокс снят, снимаем перечеркивание
      taskText.style.textDecoration = "none";
      taskCheckbox.disabled = false;
      deleteButton.disabled = false;
      deleteButton.style.display = "inline"; // Показываем кнопку удаления
    }
  });

  // Кнопка для удаления задачи
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Удалить";
  deleteButton.addEventListener("click", () => {
    removeTask(taskId); // Удалить задачу по id
  });

  taskDiv.appendChild(taskText);
  taskDiv.appendChild(taskCheckbox);
  taskDiv.appendChild(deleteButton);

  taskList.appendChild(taskDiv);
}

// Удаление задачи по id
function removeTask(taskId) {
  // Удаление задачи со слайдера
  const taskElement = document.querySelector(`.task[data-id="${taskId}"]`);
  if (taskElement) {
    taskElement.remove();
  }

  // Удаление задачи из списка
  const taskItem = document.querySelector(`.task-item[data-id="${taskId}"]`);
  if (taskItem) {
    taskItem.remove();
  }
}

// Функция прокрутки слайдера влево или вправо
function scrollSlider(direction) {
  if (direction === "left") {
    if (currentPosition > 0) {
      currentPosition -= slideWidth;
    }
  } else if (direction === "right") {
    if (currentPosition < totalWidth - visibleCount * slideWidth) {
      currentPosition += slideWidth;
    }
  }
  slider.style.transform = `translateX(-${currentPosition}px)`;
}

// Прокрутка слайдера с помощью мыши
let isMouseDown = false;
let startX = 0;
let scrollLeft = 0;

slider.addEventListener("mousedown", (e) => {
  isMouseDown = true;
  startX = e.pageX - slider.offsetLeft;
  scrollLeft = currentPosition;
  slider.style.cursor = "grabbing"; // Меняем курсор на захват
});

slider.addEventListener("mouseleave", () => {
  isMouseDown = false;
  slider.style.cursor = "grab"; // Возвращаем курсор в состояние захвата
});

slider.addEventListener("mouseup", () => {
  isMouseDown = false;
  slider.style.cursor = "grab"; // Возвращаем курсор в состояние захвата
});

slider.addEventListener("mousemove", (e) => {
  if (!isMouseDown) return; // Если кнопка мыши не нажата, не выполняем прокрутку

  const x = e.pageX - slider.offsetLeft;
  const move = (x - startX) * 0.75; // Уменьшаем коэффициент для более плавной прокрутки
  currentPosition = scrollLeft - move;

  // Ограничиваем движение слайдера
  if (currentPosition < 0) {
    currentPosition = 0;
  }
  if (currentPosition > totalWidth - visibleCount * slideWidth) {
    currentPosition = totalWidth - visibleCount * slideWidth;
  }

  slider.style.transform = `translateX(-${currentPosition}px)`;
});

// Прокрутка слайдера с помощью пальца (мобильные устройства)
let isTouching = false;
let touchStartX = 0;
let touchScrollLeft = 0;

slider.addEventListener("touchstart", (e) => {
  isTouching = true;
  touchStartX = e.touches[0].pageX - slider.offsetLeft;
  touchScrollLeft = currentPosition;
  slider.style.cursor = "grabbing"; // Меняем курсор на захват (хотя на мобильных устройствах это не влияет)
});

slider.addEventListener("touchend", () => {
  isTouching = false;
  slider.style.cursor = "grab";
});

slider.addEventListener("touchmove", (e) => {
  if (!isTouching) return;

  const x = e.touches[0].pageX - slider.offsetLeft;
  const move = (x - touchStartX) * 0.75; // Уменьшаем коэффициент для более плавной прокрутки
  currentPosition = touchScrollLeft - move;

  // Ограничиваем движение слайдера
  if (currentPosition < 0) {
    currentPosition = 0;
  }
  if (currentPosition > totalWidth - visibleCount * slideWidth) {
    currentPosition = totalWidth - visibleCount * slideWidth;
  }

  slider.style.transform = `translateX(-${currentPosition}px)`;
});

// Обработчик события колесика мыши
slider.addEventListener("wheel", (e) => {
  e.preventDefault();
  if (e.deltaY < 0) {
    if (currentPosition > 0) {
      currentPosition -= slideWidth;
    }
  } else {
    if (currentPosition < totalWidth - visibleCount * slideWidth) {
      currentPosition += slideWidth;
    }
  }
  slider.style.transform = `translateX(-${currentPosition}px)`;
});

// Функция для установки центрального слайда на текущее время
function setCenterSlideToCurrentTime() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  currentPosition =
    (currentMinutes / 60) * slideWidth - (visibleCount / 2) * slideWidth;
  slider.style.transform = `translateX(-${currentPosition}px)`;
}

// Обработчики событий для кнопок
scrollLeftButton.addEventListener("click", () => {
  scrollSlider("left");
});

scrollRightButton.addEventListener("click", () => {
  scrollSlider("right");
});

// Добавление задачи через форму
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const taskName = taskNameInput.value;
  const startTime = startTimeInput.value;
  const endTime = endTimeInput.value;
  const taskColor = taskColorInput.value;

  // Генерация уникального ID для каждой задачи
  const taskId = Date.now();

  addTaskToSlider(taskName, startTime, endTime, taskColor, taskId);
  addTaskToList(taskName, startTime, endTime, taskColor, taskId);

  // Очистка формы
  taskNameInput.value = "";
  startTimeInput.value = "";
  endTimeInput.value = "";
});

// Функция для удаления всех задач
function removeAllTasks() {
  // Удаление всех задач со слайдера
  const tasksOnSlider = document.querySelectorAll(".task");
  tasksOnSlider.forEach((task) => {
    task.remove();
  });

  // Удаление всех задач из списка
  const taskItems = document.querySelectorAll(".task-item");
  taskItems.forEach((taskItem) => {
    taskItem.remove();
  });
}

//////////////////////////

// Открытие модального окна
function openDeleteModal() {
  deleteModal.style.display = "block"; // Показать модальное окно
  /*   deleteModal.classList.add("show"); */
}

// Закрытие модального окна
function closeDeleteModal() {
  deleteModal.style.display = "none"; // Скрыть модальное окно
  /*   deleteModal.classList.remove("show"); */
}

// Обработчик для кнопки "Удалить все задачи"
deleteAllButton.addEventListener("click", openDeleteModal);

// Обработчик кнопки "Подтвердить удаление"
confirmDeleteButton.addEventListener("click", () => {
  removeAllTasks();
  closeDeleteModal();
});

// Обработчик кнопки "Отмена"
cancelDeleteButton.addEventListener("click", closeDeleteModal);

// Закрытие модального окна при клике вне его
window.addEventListener("click", (event) => {
  if (event.target === deleteModal) {
    closeDeleteModal();
  }
});

// Закрытие модального окна при нажатии клавиши "Esc"
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeDeleteModal();
  }
});

/////////////

// Обработчик клика по кнопке "Удалить все задачи"
deleteAllButton.addEventListener("click", removeAllTasks);

// Инициализация слайдера
generateHours();
// Устанавливаем центральный слайд на текущее время при загрузке
setCenterSlideToCurrentTime();

// Устанавливаем таймер для автоматического удаления задач через каждые 24 часа (86400000 миллисекунд)
setInterval(removeAllTasks, 86400000);
