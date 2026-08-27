let authMode="login";
const $=id=>document.getElementById(id);
function openAuth(mode){authMode=mode;updateAuth();$("authModal").classList.remove("hidden")}
function closeAuth(){$("authModal").classList.add("hidden")}
function toggleAuth(){authMode=authMode==="login"?"signup":"login";updateAuth()}
function updateAuth(){const s=authMode==="signup";$("authTitle").textContent=s?"Create your account":"Welcome back";$("authSub").textContent=s?"Create a demo account and start exploring.":"Log in to explore airfare intelligence.";$("authSubmit").textContent=s?"Create account →":"Log in →";$("nameField").classList.toggle("hidden",!s);$("switchText").textContent=s?"Already have an account?":"Don't have an account?";document.querySelector(".switch-auth button").textContent=s?"Log in":"Sign up"}
$("authForm").addEventListener("submit",e=>{e.preventDefault();const name=$("name").value.trim()||"Traveller";$("userName").textContent=name.split(" ")[0];
/* FIXED PAGE TRANSITION: remove landing, then show dashboard */
$("landing").classList.remove("active");$("dashboard").classList.add("active");$("authModal").classList.add("hidden");window.scrollTo(0,0);showToast("Welcome to APIx, "+name.split(" ")[0]+"!")});
function logout(){$("dashboard").classList.remove("active");$("landing").classList.add("active");window.scrollTo(0,0);showToast("Logged out of demo")}
function swapCities(){[$("from").value,$("to").value]=[$("to").value,$("from").value];updateRoute()}
function parseCity(v){const m=v.match(/^(.+?)\s*\(([A-Z]{3})\)$/);return m?{name:m[1],code:m[2]}:{name:v||"Origin",code:"---"}}
function updateRoute(){const a=parseCity($("from").value),b=parseCity($("to").value);$("chartRoute").textContent=`${a.name} → ${b.name} • Last 30 days`;$("historyTitle").textContent=`${a.name} → ${b.name}`}
async function searchFlights() {
    updateRoute();

    const a = parseCity($("from").value).code;
    const b = parseCity($("to").value).code;

    if (a === "---" || b === "---") {
        showToast("Please enter valid airport codes");
        return;
    }

    showToast(`Fetching fares for ${a} → ${b}...`);

    try {
        const response = await fetch(
            `https://apix-backend.onrender.com/api/fares?origin=${a}&destination=${b}`
        );

        if (!response.ok) {
            throw new Error("API request failed");
        }

        const data = await response.json();

        if (!data.fares || data.fares.length === 0) {
            showToast("No fares found for this route");
            return;
        }

        const totals = data.fares.map(fare => fare.total);

        const average = Math.round(
            totals.reduce((sum, price) => sum + price, 0) / totals.length
        );

        const best = Math.min(...totals);

        $("avgFare").textContent =
            "₹" + average.toLocaleString("en-IN");

        $("bestFare").textContent =
            "₹" + best.toLocaleString("en-IN");

        showToast(
            `${data.count} fares found for ${data.route}`
        );

    } catch (error) {
        console.error("APIx error:", error);
        showToast("Unable to fetch fares. Please try again.");
    }
}
function focusSearch(){$("searchPanel").scrollIntoView({behavior:"smooth",block:"center"})}
function showHistory(){updateRoute();$("historyModal").classList.remove("hidden")}
function closeHistory(){$("historyModal").classList.add("hidden")}
function chooseFare(n,p){showToast(`${n} selected — ₹${p.toLocaleString("en-IN")} demo fare`)}
function showToast(m){const t=$("toast");t.textContent=m;t.classList.add("show");clearTimeout(window.tt);window.tt=setTimeout(()=>t.classList.remove("show"),2600)}
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeAuth();closeHistory()}});
const d=new Date();d.setDate(d.getDate()+14);$("date").value=d.toISOString().split("T")[0];
