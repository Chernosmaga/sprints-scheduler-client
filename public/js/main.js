import { applyThemeToElements } from '../js/sprint.js';

document.addEventListener("DOMContentLoaded", () => {
    updateTheme();
    formatDate();
});

function updateTheme() {
    let toggleBtn = document.getElementById("theme-toggle");
    let themeIcon = document.getElementById("theme-icon");

    toggleBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-theme");

        // Сохраняем состояние темы
        if (document.body.classList.contains("dark-theme")) {
            localStorage.setItem("theme", "dark");
        } else {
            localStorage.removeItem("theme");
        }

        updateThemeToggleIcon();
        applyThemeToElements();
    });

    function updateThemeToggleIcon() {
        if (document.body.classList.contains("dark-theme")) {
            themeIcon.src = "../icons/lightbulb-solid-on.svg";
        } else {
            themeIcon.src = "../icons/lightbulb-solid-off.svg";
        }
    }

    // восстановление состояния темы при загрузке
    window.addEventListener("DOMContentLoaded", () => {
        if (localStorage.getItem("theme") === "dark") {
            document.body.classList.add("dark-theme");
        }
        updateThemeToggleIcon();
        applyThemeToElements();
    });
}

function formatDate() {
    window.onload = function () {
        let sprintStartDate = document.getElementById("start-date");
        let sprintEndDate = document.getElementById("end-date");

        if (!sprintStartDate.value) {
            let today = new Date();
            let formattedToday = formatDate(today);
            sprintStartDate.value = formattedToday;
        }

        if (!sprintEndDate.value) {
            let endDate = new Date();
            endDate.setDate(endDate.getDate() + 14);
            let formattedEndDate = formatDate(endDate);
            sprintEndDate.value = formattedEndDate;
        }
    };

    function formatDate(date) {
        let year = date.getFullYear();
        let month = String(date.getMonth() + 1).padStart(2, "0");
        let day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }
}