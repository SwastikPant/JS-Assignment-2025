const chatbox=document.getElementById("chatbox");
const sendbutton=document.getElementById("sendbutton");
const inputArea=document.getElementById("user_input");
const newChat=document.getElementById("newChat");
const modelSelector=document.getElementById("model_selector");
const historyList=document.getElementById("historyList");
const enterKey=document.getElementById("enterKey");
const apiKeyInput=document.getElementById("apiKeyInput");
const saveKey=document.getElementById("saveKey");
let apiKey=localStorage.getItem("openrouter_api_key") || "";
let currentChat=[];
let chatHistory=JSON.parse(localStorage.getItem("chatHistory") || "[]");

if (!apiKey){
  enterKey.style.display="flex";
}

saveKey.addEventListener('click', ()=>{
  const key=apiKeyInput.value;
  if(key){
    localStorage.setItem("openrouter_api_key", key);
    apiKey=key;
    enterKey.style.display="none";
  }
})

function displayMessage(role, text){
  const div=document.createElement("div");
  div.classList.add("chat_bubble");
  if(role==="user")
    div.classList.add("user_message");
  else
    div.classList.add("ai_message");

  div.innerHTML = marked.parse(text);
  chatbox.appendChild(div);
  chatbox.scrollTop=chatbox.scrollHeight;
}

function saveCurrentChat() {
  if(currentChat.length===0) 
    return;
  chatHistory.push({
    title: currentChat[0]?.content.slice(0, 20),
    messages: currentChat
  });
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  updateHistoryList();
}

function updateHistoryList(){
  historyList.innerHTML="";
  chatHistory.forEach((chat, id)=>{
    const chatHistory= document.createElement("li");
    chatHistory.textContent=chat.title;
    chatHistory.addEventListener('click', ()=>{
      chatbox.innerHTML="";
      currentChat=chat.messages;
      currentChat.forEach(e=>
        displayMessage(e.role, e.content));
    });
    historyList.appendChild(chatHistory);
  });
}

async function sendMessage(){
  const text=inputArea.value;
  if (!text) return;

  displayMessage("user", text);
  currentChat.push({role: "user", content: text});
  inputArea.value="";

  const model=modelSelector.value;

  const res=await fetch("https://openrouter.ai/api/v1/chat/completions",{
    method: "POST",
    headers: {
      "Authorization": "Bearer " + apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: currentChat
    })
  });

  const data=await res.json();
  const reply=data.choices?.[0]?.message?.content || "No response";
  displayMessage("ai", reply);
  currentChat.push({role: "ai", content: reply});
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));

}

sendbutton.addEventListener("click", sendMessage);


newChat.addEventListener('click',()=>{
  saveCurrentChat();
  currentChat=[];
  chatbox.innerHTML="";
});

updateHistoryList();

document.getElementById("clearHistory").addEventListener('click', ()=>{
  if (confirm("Are you sure you want to delete all chat history?")){
    localStorage.removeItem("chatHistory");
    chatHistory=[];
    updateHistoryList();
    chatbox.innerHTML="";
    currentChat=[];
  }
});
