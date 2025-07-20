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

function markDown(text){
  text=text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
  text=text.replace(/^## (.*$)/gm, '<h1>$1</h1>');
  text=text.replace(/^### (.*$)/gm, '<h1>$1</h1>');
  text=text.replace(/^#### (.*$)/gm, '<h1>$1</h1>');
  text=text.replace(/\*\*(.*?)\*\*/gm, '<b>$1</b>');
  text=text.replace(/\*(.*?)\*/gm, '<i>$1</i>');
  text=text.replace(/_(.*?)_/gm, '<i>$1</i>');
  text=text.replace(/~~(.*?)~~/gm, '<s>$1</s>');
  text=text.replace(/`(.*?)`/gm, '<code>$1</code>');
  text=text.replace(/\n/gm, '<br>');
  return text;
}

function displayMessage(role, text){
  const div=document.createElement("div");
  div.classList.add("chat_bubble");
  if(role==="user")
    div.classList.add("user_message");
  else
    div.classList.add("ai_message");

  div.innerHTML = markDown(text);
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

async function sendMessageWithStreaming() {
  const text=inputArea.value;
  if(!text) return;

  displayMessage("user", text);
  currentChat.push({role: "user", content: text});
  inputArea.value="";

  const model=modelSelector.value;

  const response=await fetch("https://openrouter.ai/api/v1/chat/completions",{
    method: "POST",
    headers:{
      "Authorization": "Bearer "+apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: currentChat,
      stream: true
    })
  });

  if(!response.ok || !response.body) {
    displayMessage("ai", "Failed to get response.");
    return;
  }
  const div=document.createElement("div");
  div.classList.add("chat_bubble", "ai_message");
  chatbox.appendChild(div);
  chatbox.scrollTop=chatbox.scrollHeight;

  const reader=response.body.getReader();
  const decoder=new TextDecoder("utf-8");

  let fullText="";

  while(true) {
    const{value, done} = await reader.read();
    if(done) break;
    const chunk=decoder.decode(value, { stream: true });

    const lines=chunk.split("\n").filter(line => line.trim() !== "");

    for(const line of lines){
      if(line.startsWith("data: ")){
        const dataStr=line.replace("data: ", "");
        if(dataStr==="[DONE]") break;

        try{
          const data=JSON.parse(dataStr);
          const data2=data.choices?.[0]?.delta?.content;
          if (data2){
            fullText+=data2;
            div.innerHTML=markDown(fullText);
            chatbox.scrollTop=chatbox.scrollHeight;
          }
        }catch (e) {
          console.error("Error", e);
        }
      }
    }
  }

  currentChat.push({ role: "ai", content: fullText });
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

sendbutton.addEventListener("click", sendMessageWithStreaming);


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
