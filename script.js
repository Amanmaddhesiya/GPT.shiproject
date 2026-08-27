let authMode = "login";

function openAuth(mode="login"){
  authMode=mode;
  document.getElementById("authModal").classList.remove("hidden");
  updateAuth();
}
function closeAuth(){document.getElementById("authModal").classList.add("hidden")}
function toggleAuth(){authMode=authMode==="login"?"signup":"login";updateAuth()}
function updateAuth(){
  const signup=authMode==="signup";
  document.getElementById("authTitle").textContent=signup?"Create your account":"Welcome back";
  document.getElementById("authSub").textContent=signup?"Create a demo account and start exploring.":"Log in to explore airfare intelligence.";
  document.getElementById("authSubmit").textContent=signup?"Create account →":"Log in →";
  document.getElementById("nameField").classList.toggle("hidden",!signup);
  document.getElementById("switchText").textContent=signup?"Already have an account?":"Don't have an account?";
  document.querySelector(".switch-auth button").textContent=signup?"Log in":"Sign up";
}
function handleAuth(e){
  e.preventDefault();
  const name=document.getElementById("name").value.trim() || "Traveller";
  document.getElementById("userName").textContent=name.split(" ")[0];
  closeAuth();
  document.getElementById("landing").classList.remove("active");
  document.getElementById("dashboard").classList.add("active");
  showToast("Welcome to APIx, "+name.split(" ")[0]+"!");
}
function logout(){
  document.getElementById("dashboard").classList.remove("active");
  document.getElementById("landing").classList.add("active");
  showToast("Logged out of demo");
}
function swapCities(){
  const a=document.getElementById("from"),b=document.getElementById("to");
  [a.value,b.value]=[b.value,a.value];
  updateRoute();
}
function parseCity(v){
  const m=v.match(/^(.+?)\s*\(([A-Z]{3})\)$/);
  return m?{name:m[1],code:m[2]}:{name:v||"Origin",code:"---"};
}
function updateRoute(){
  const a=parseCity(document.getElementById("from").value);
  const b=parseCity(document.getElementById("to").value);
  document.getElementById("chartRoute").textContent=`${a.name} → ${b.name} • Last 30 days`;
  document.getElementById("historyTitle").textContent=`${a.name} → ${b.name}`;
}
function searchFlights(){
  updateRoute();
  const routes={
    "DEL-BOM":[5350,4890],
    "BOM-BLR":[4730,4290],
    "DEL-BLR":[6180,5590],
    "DEL-CCU":[5240,4780],
    "BLR-HYD":[3890,3510],
    "MAA-DEL":[6900,6220]
  };
  const a=parseCity(document.getElementById("from").value).code;
  const b=parseCity(document.getElementById("to").value).code;
  const key=`${a}-${b}`;
  const data=routes[key] || [5350,4890];
  document.getElementById("avgFare").textContent="₹"+data[0].toLocaleString("en-IN");
  document.getElementById("bestFare").textContent="₹"+data[1].toLocaleString("en-IN");
  showToast(`Showing demo fares for ${a} → ${b}`);
}
function focusSearch(){
  document.getElementById("searchPanel").scrollIntoView({behavior:"smooth",block:"center"});
}
function showHistory(){
  updateRoute();
  document.getElementById("historyModal").classList.remove("hidden");
}
function closeHistory(){document.getElementById("historyModal").classList.add("hidden")}
function chooseFare(name,price){showToast(`${name} selected — ₹${price.toLocaleString("en-IN")} demo fare`)}
function showToast(msg){
  const t=document.getElementById("toast");
  t.textContent=msg;t.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer=setTimeout(()=>t.classList.remove("show"),2600);
}
function showDemo(){
  document.getElementById("authModal").classList.remove("hidden");
  authMode="login";updateAuth();
}
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeAuth();closeHistory()}});
const d=new Date();d.setDate(d.getDate()+14);document.getElementById("date").value=d.toISOString().split("T")[0];
