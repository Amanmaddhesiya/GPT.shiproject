let authMode = "login";

const $ = id => document.getElementById(id);


/* =========================
   AUTH
========================= */

function openAuth(mode) {
    authMode = mode;
    updateAuth();
    $("authModal").classList.remove("hidden");
}

function closeAuth() {
    $("authModal").classList.add("hidden");
}

function toggleAuth() {
    authMode = authMode === "login" ? "signup" : "login";
    updateAuth();
}

function updateAuth() {

    const signup = authMode === "signup";

    $("authTitle").textContent =
        signup ? "Create your account" : "Welcome back";

    $("authSub").textContent =
        signup
            ? "Create a demo account and start exploring."
            : "Log in to explore airfare intelligence.";

    $("authSubmit").textContent =
        signup ? "Create account →" : "Log in →";

    $("nameField").classList.toggle("hidden", !signup);

    $("switchText").textContent =
        signup
            ? "Already have an account?"
            : "Don't have an account?";

    document.querySelector(".switch-auth button").textContent =
        signup ? "Log in" : "Sign up";
}


$("authForm").addEventListener("submit", function (e) {

    e.preventDefault();

    const name =
        $("name").value.trim() || "Traveller";

    $("userName").textContent =
        name.split(" ")[0];

    $("landing").classList.remove("active");

    $("dashboard").classList.add("active");

    $("authModal").classList.add("hidden");

    window.scrollTo(0, 0);

    showToast(
        "Welcome to APIx, " + name.split(" ")[0] + "!"
    );
});


function logout() {

    $("dashboard").classList.remove("active");

    $("landing").classList.add("active");

    window.scrollTo(0, 0);

    showToast("Logged out of demo");
}


/* =========================
   ROUTE
========================= */

function swapCities() {

    [
        $("from").value,
        $("to").value
    ] = [
        $("to").value,
        $("from").value
    ];

    updateRoute();
}


function parseCity(value) {

    const match =
        value.match(/^(.+?)\s*\(([A-Z]{3})\)$/);

    if (match) {

        return {
            name: match[1],
            code: match[2]
        };

    }

    return {
        name: value || "Origin",
        code: "---"
    };
}


function updateRoute() {

    const from =
        parseCity($("from").value);

    const to =
        parseCity($("to").value);

    $("chartRoute").textContent =
        `${from.name} → ${to.name} • Last 30 days`;

    $("historyTitle").textContent =
        `${from.name} → ${to.name}`;
}


/* =========================
   AIRLINE HELPERS
========================= */

function getAirlineCode(airline) {

    const codes = {

        "IndiGo": "6E",
        "Air India": "AI",
        "Air India Express": "IX",
        "Akasa Air": "QP",
        "SpiceJet": "SG"

    };

    return codes[airline] || "✈";
}


function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================
   SEARCH FLIGHTS
========================= */

async function searchFlights() {

    console.log("APIx searchFlights() started");

    updateRoute();

    const from =
        parseCity($("from").value);

    const to =
        parseCity($("to").value);

    const origin = from.code;
    const destination = to.code;


    if (origin === "---" || destination === "---") {

        showToast(
            "Please enter valid airport codes"
        );

        return;
    }


    const fareRows =
        $("fareRows");


    /* Loading state */

    if (fareRows) {

        fareRows.innerHTML = `
            <div class="fare-row">
                <span>Loading fares...</span>
                <span>APIx</span>
                <span>—</span>
                <span>—</span>
                <strong>—</strong>
                <span>...</span>
            </div>
        `;

    }


    if ($("fareUpdated")) {

        $("fareUpdated").textContent =
            "Fetching live fares...";

    }


    showToast(
        `Fetching fares for ${origin} → ${destination}...`
    );


    try {

        const apiURL =
            `https://apix-backend.onrender.com/api/fares?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;


        console.log(
            "APIx requesting:",
            apiURL
        );


        const response =
            await fetch(apiURL);


        console.log(
            "APIx response status:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "APIx received data:",
            data
        );


        if (
            !data.fares ||
            !Array.isArray(data.fares) ||
            data.fares.length === 0
        ) {

            $("avgFare").textContent = "—";

            $("bestFare").textContent = "—";


            if (fareRows) {

                fareRows.innerHTML = `
                    <div class="fare-row">
                        <span>No fares found</span>
                        <span>APIx</span>
                        <span>—</span>
                        <span>—</span>
                        <strong>—</strong>
                        <span>—</span>
                    </div>
                `;

            }


            if ($("fareUpdated")) {

                $("fareUpdated").textContent =
                    "No fares found";

            }


            showToast(
                `No fares found for ${data.route || origin + "-" + destination}`
            );

            return;
        }


        /* =========================
           CALCULATE AVERAGE
        ========================= */

        const totals =
            data.fares
                .map(fare => Number(fare.total))
                .filter(price => Number.isFinite(price));


        if (totals.length === 0) {

            throw new Error(
                "No valid fare totals received"
            );

        }


        const average =
            Math.round(
                totals.reduce(
                    (sum, price) => sum + price,
                    0
                ) / totals.length
            );


        const best =
            Math.min(...totals);


        $("avgFare").textContent =
            "₹" + average.toLocaleString("en-IN");


        $("bestFare").textContent =
            "₹" + best.toLocaleString("en-IN");


        /* =========================
           BUILD FARE TABLE
        ========================= */

        if (fareRows) {

            fareRows.innerHTML = "";


            data.fares.forEach(fare => {

                const row =
                    document.createElement("div");


                row.className =
                    "fare-row";


                const total =
                    Number(fare.total);


                const base =
                    Number(fare.base_fare);


                const fees =
                    Number(fare.taxes_fees);


                const isBest =
                    total === best;


                if (isBest) {

                    row.classList.add("best");

                }


                row.innerHTML = `

                    <span class="carrier">

                        <b>
                            ${getAirlineCode(fare.airline)}
                        </b>

                        ${escapeHTML(fare.airline)}

                    </span>


                    <span>
                        ${escapeHTML(fare.source)}
                    </span>


                    <span>
                        ₹${base.toLocaleString("en-IN")}
                    </span>


                    <span>
                        ₹${fees.toLocaleString("en-IN")}
                    </span>


                    <strong>
                        ₹${total.toLocaleString("en-IN")}
                    </strong>


                    <button
                        type="button"
                        class="fare-select"
                    >
                        ${isBest ? "BEST" : "Select"}
                    </button>

                `;


                const button =
                    row.querySelector(".fare-select");


                button.addEventListener(
                    "click",
                    function () {

                        chooseFare(
                            fare.airline,
                            total
                        );

                    }
                );


                fareRows.appendChild(row);

            });

        }


        /* =========================
           UPDATED TIME
        ========================= */

        if ($("fareUpdated")) {

            const now =
                new Date();

            $("fareUpdated").textContent =
                "Updated " +
                now.toLocaleTimeString(
                    "en-IN",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );

        }


        showToast(
            `${data.fares.length} fares found for ${data.route || origin + "-" + destination}`
        );

    }


    catch (error) {

        console.error(
            "APIx ERROR:",
            error
        );


        $("avgFare").textContent =
            "—";


        $("bestFare").textContent =
            "—";


        if (fareRows) {

            fareRows.innerHTML = `

                <div class="fare-row">

                    <span>
                        Unable to load fares
                    </span>

                    <span>
                        APIx
                    </span>

                    <span>—</span>

                    <span>—</span>

                    <strong>—</strong>

                    <span>
                        Error
                    </span>

                </div>

            `;

        }


        if ($("fareUpdated")) {

            $("fareUpdated").textContent =
                "Connection error";

        }


        showToast(
            "Unable to fetch fares. Please try again."
        );

    }

}


/* =========================
   SEARCH / HISTORY
========================= */

function focusSearch() {

    $("searchPanel").scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


function showHistory() {

    updateRoute();

    $("historyModal").classList.remove("hidden");

}


function closeHistory() {

    $("historyModal").classList.add("hidden");

}


function chooseFare(name, price) {

    showToast(
        `${name} selected — ₹${price.toLocaleString("en-IN")}`
    );

}


/* =========================
   TOAST
========================= */

function showToast(message) {

    const toast =
        $("toast");

    toast.textContent =
        message;

    toast.classList.add("show");

    clearTimeout(window.tt);

    window.tt =
        setTimeout(
            () => toast.classList.remove("show"),
            2600
        );

}


/* =========================
   ESC KEY
========================= */

document.addEventListener(
    "keydown",
    function (e) {

        if (e.key === "Escape") {

            closeAuth();
            closeHistory();

        }

    }
);


/* =========================
   DEFAULT DATE
========================= */

const date =
    new Date();

date.setDate(
    date.getDate() + 14
);


if ($("date")) {

    $("date").value =
        date.toISOString().split("T")[0];

}
/* ==========================================
   CITY AUTOCOMPLETE
========================================== */

const airportCities = [
    { name: "Delhi", code: "DEL" },
    { name: "Mumbai", code: "BOM" },
    { name: "Bangalore", code: "BLR" },
    { name: "Kolkata", code: "CCU" },
    { name: "Hyderabad", code: "HYD" },
    { name: "Chennai", code: "MAA" },
    { name: "Ahmedabad", code: "AMD" },
    { name: "Pune", code: "PNQ" },
    { name: "Goa", code: "GOI" },
    { name: "Jaipur", code: "JAI" },
    { name: "Lucknow", code: "LKO" },
    { name: "Varanasi", code: "VNS" },
    { name: "Patna", code: "PAT" },
    { name: "Bhubaneswar", code: "BBI" },
    { name: "Guwahati", code: "GAU" },
    { name: "Chandigarh", code: "IXC" },
    { name: "Kochi", code: "COK" },
    { name: "Indore", code: "IDR" },
    { name: "Nagpur", code: "NAG" },
    { name: "Surat", code: "STV" }
];


function setupAutocomplete(inputId, suggestionId) {

    const input = $(inputId);
    const box = $(suggestionId);

    if (!input || !box) return;


    input.addEventListener("input", function () {

        const query = input.value
            .trim()
            .toLowerCase();

        box.innerHTML = "";

        if (!query) {
            box.classList.remove("show");
            return;
        }


        const matches = airportCities.filter(city =>
            city.name.toLowerCase().includes(query) ||
            city.code.toLowerCase().includes(query)
        );


        if (matches.length === 0) {

            box.classList.remove("show");
            return;

        }


        matches.slice(0, 6).forEach(city => {

            const item =
                document.createElement("div");

            item.className = "suggestion-item";

            item.innerHTML = `
                <span class="suggestion-icon">✈</span>
                <span>
                    <strong>${city.name}</strong>
                    <small>${city.code}</small>
                </span>
            `;


            item.addEventListener("click", function () {

                input.value =
                    `${city.name} (${city.code})`;

                box.innerHTML = "";

                box.classList.remove("show");

                updateRoute();

            });


            box.appendChild(item);

        });


        box.classList.add("show");

    });


    input.addEventListener("focus", function () {

        if (input.value.trim()) {

            input.dispatchEvent(
                new Event("input")
            );

        }

    });

}


/* Initialize autocomplete */

setupAutocomplete(
    "from",
    "fromSuggestions"
);

setupAutocomplete(
    "to",
    "toSuggestions"
);


/* Close suggestions when clicking outside */

document.addEventListener("click", function (event) {

    if (
        !event.target.closest(".autocomplete-field")
    ) {

        document
            .querySelectorAll(".suggestions")
            .forEach(box =>
                box.classList.remove("show")
            );

    }

});
