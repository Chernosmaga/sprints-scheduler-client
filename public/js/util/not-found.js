document.addEventListener("DOMContentLoaded", function () {
    let container = document.getElementById("stars-container");
    let starCount = 100;

    for (let i = 0; i < starCount; i++) {
        let star = document.createElement("div");
        star.classList.add("star");

        let size = Math.random() * 2 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;

        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;

        let duration = Math.random() * 3 + 2;
        star.style.setProperty("--duration", `${duration}s`);

        star.style.animationDelay = `${Math.random() * 5}s`;

        container.appendChild(star);
    }

    for (let i = 0; i < 10; i++) {
        let spark = document.createElement("div");
        spark.classList.add("absolute", "rounded-full", "bg-indigo-300");
        spark.style.width = "4px";
        spark.style.height = "4px";
        spark.style.left = "50%";
        spark.style.top = "50%";
        spark.style.transform = "translate(-50%, -50%)";

        let angle = Math.random() * Math.PI * 2;
        let distance = Math.random() * 30 + 20;
        let x = Math.cos(angle) * distance;
        let y = Math.sin(angle) * distance;

        spark.animate(
            [
                { transform: "translate(-50%, -50%)", opacity: 1 },
                { transform: `translate(${x}px, ${y}px)`, opacity: 0 },
            ],
            {
                duration: 800,
                easing: "cubic-bezier(0.4, 0, 0.2, 1)",
            }
        );

        rocket.parentElement.appendChild(spark);
        setTimeout(() => spark.remove(), 800);
    }
});
