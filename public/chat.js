const socket = io();

const username = localStorage.getItem("username");

socket.emit("join",username);

let selected="all";

socket.on("onlineUsers",(users)=>{

let list=document.getElementById("userList");

list.innerHTML="";

for(let id in users){

let li=document.createElement("li");

li.innerText=users[id];

li.onclick=()=>selected=id;

list.appendChild(li);

}

});

function send(){

let message=document.getElementById("msg").value;

socket.emit("chatMessage",{

sender:username,

receiver:selected,

message:message

});

msg.value="";

}

socket.on("message",(data)=>{

messages.innerHTML+=`<p><b>${data.sender}</b>: ${data.message}
<span>${data.time}</span></p>`;

});

msg.addEventListener("keypress",()=>{

socket.emit("typing",username);

});

socket.on("typing",(user)=>{

typing.innerHTML=user+" is typing...";

setTimeout(()=>typing.innerHTML="",2000);

});