document.addEventListener("DOMContentLoaded", () => {
    const Tswitch = document.getElementById("toggle");
    const stylesheet = document.getElementById("styleSheet");
    function getCookie(name) {
        const cookies = document.cookie.split("; ");
        for (let cookie of cookies) {
            let [key, value] = cookie.split("=");
            if (key === name) return value;
        }
        return null;
    }

    let savedTheme = getCookie("theme") || "lightmode.css";
    console.log("Saved theme:", savedTheme);

    stylesheet.setAttribute("href", savedTheme);

    if (savedTheme === "darkmode.css" && Tswitch) {
        Tswitch.checked = true;
    }

    Tswitch.addEventListener("change", () => {
        let newTheme = Tswitch.checked ? "darkmode.css" : "lightmode.css";
        stylesheet.setAttribute("href", newTheme);

        document.cookie = `theme=${newTheme}; path=/; max-age=${30 * 24 * 60 * 60}; secure; SameSite=Lax`;

        console.log(`Theme changed to: ${newTheme}`);
        savedTheme = Tswitch.checked ? "darkmode.css" : "lightmode.css";
    console.log("savedTheme: ", savedTheme);
        // set();
    });

    if(getCookie('style') === 'darkmode') {
        stylesheet.setAttribute('href', "darkmode.css");
        console.log('darkmode');
        
    } else if (getCookie('style') === 'lightmode') {
        stylesheet.setAttribute('href', "lightmode.css");
        console.log('lightmode');
        
    }
    function set() {
        if(savedTheme != !(Tswitch.checked ? 'darkmode.css' : 'lightmode.css')) {
            console.log("the shitfuck expression is true");
        } else {
            console.log("is false");
            
        }
    }

    console.log('reached end of file');
});
