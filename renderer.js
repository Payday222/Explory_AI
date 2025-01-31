document.addEventListener("DOMContentLoaded", () => {
    const Tswitch = document.getElementById("toggle");
    const stylesheet = document.getElementById("styleSheet");

    // Function to get cookie by name
    function getCookie(name) {
        const cookies = document.cookie.split("; ");
        for (let cookie of cookies) {
            let [key, value] = cookie.split("=");
            if (key === name) return value;
        }
        return null;
    }

    // Load theme from cookie
    const savedTheme = getCookie("theme");
    if (savedTheme) {
        stylesheet.setAttribute("href", savedTheme);
        Tswitch.checked = savedTheme === "darkmode.css";
    }

    // Toggle theme and set cookie
    Tswitch.addEventListener("change", () => {
        const newTheme = Tswitch.checked ? "darkmode.css" : "lightmode.css";
        stylesheet.setAttribute("href", newTheme);

        // Set cookie with theme value (expires in 30 days)
        document.cookie = `theme=${newTheme}; path=/; max-age=${30 * 24 * 60 * 60}`;
    });
});
