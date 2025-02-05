function getCookie(name) {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        let [key, value] = cookie.split("=");
        if (key === name) return value;
    }
    // console.log("All cookies:", document.cookie);
// console.log("Theme cookie:", getCookie("theme"));

    return null;
}

document.addEventListener("DOMContentLoaded", () => {
    const stylesheet = document.getElementById("styleSheet");

    if (!stylesheet) {
        console.error("Error: Stylesheet link element not found!");
        return;
    }

    let savedTheme = getCookie("theme") || "lightmode.css";

    stylesheet.setAttribute("href", savedTheme);

    console.log(`Theme applied: ${savedTheme}`);
});
