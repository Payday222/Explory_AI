document.addEventListener("DOMContentLoaded", async () => {
    console.log("🚀 theme.js loaded");

    const styleSheet = document.getElementById("styleSheet");
    const Tswitch = document.getElementById("toggle");

    if (!styleSheet || !Tswitch) {
        console.error("Error: Elements not found!");
        return;
    }

    // Function to get cookies in Browser
    function getCookie(name) {
        const cookies = document.cookie.split("; ");
        for (let cookie of cookies) {
            let [key, value] = cookie.split("=");
            if (key === name) return value;
        }
        return null;
    }

    let savedTheme;

    // Check if Electron environment
    if (window.electron) {
        try {
            savedTheme = await window.electron.getCookie("theme");
        } catch (err) {
            console.error("Error getting theme cookie:", err);
        }
    } else {
        savedTheme = getCookie("theme") || "lightmode.css";
    }

    console.log(`Theme applied: ${savedTheme}`);
    styleSheet.setAttribute("href", savedTheme);
    Tswitch.checked = savedTheme === "darkmode.css";

    Tswitch.addEventListener("change", async () => {
        let newTheme = Tswitch.checked ? "darkmode.css" : "lightmode.css";
        styleSheet.setAttribute("href", newTheme);

        console.log(`Saving theme to cookie: ${newTheme}`);

        if (window.electron) {
            try {
                await window.electron.setCookie("theme", newTheme);
            } catch (err) {
                console.error("Error setting theme cookie:", err);
            }
        } else {
            document.cookie = `theme=${newTheme}; path=/; max-age=${30 * 24 * 60 * 60}; secure;`;
        }
    });
});
