document.addEventListener("DOMContentLoaded", async () => {
    console.log("🚀 themeget.js loaded");

    const styleSheet = document.getElementById("styleSheet");
    if (!styleSheet) {
        console.error("Error: styleSheet element not found!");
        return;
    }

    function getCookie(name) {
        const cookies = document.cookie.split("; ");
        for (let cookie of cookies) {
            let [key, value] = cookie.split("=");
            if (key === name) return value;
        }
        return null;
    }

    let savedTheme;

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

    if (styleSheet) {
        styleSheet.setAttribute("href", savedTheme);
    } else {
        console.error("Error: styleSheet element is not available to set theme.");
    }
});
