import { APP_KEY, APP_ID } from "./keys.js";
const textInput = document.getElementById("item");
const submitItem = document.getElementById("submit");
const list = document.getElementById("list");
const dropdown = document.getElementById("dropdown");
const socket = io();

function initItems(data) {
  list.innerHTML = "";
  if (data.length === 0) {
    list.innerText = "There are no items in your grocery list";
  } else {
    data.forEach((item, index) => {
      appendListItem(item, index);
    });
  }
}

function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

window.addEventListener("click", function (e) {
  if (!dropdown.contains(e.target)) {
    dropdown.classList.replace("block", "hidden");
  }
});

// Create the XHR object.
function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    // XHR for Chrome/Firefox/Opera/Safari.
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest != "undefined") {
    // XDomainRequest for IE.
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    // CORS not supported.
    xhr = null;
  }
  return xhr;
}

function generateOptions(options) {
  dropdown.classList.replace("hidden", "block");
  dropdown.innerHTML = "";
  options.forEach((option, index) => {
    const optionNode = document.createElement("div");
    optionNode.innerHTML = option;
    setAttributes(optionNode, {
      id: index,
      class: "cursor-pointer p-3 hover:bg-gray-100",
    });
    optionNode.addEventListener("click", function () {
      textInput.value = option;
      dropdown.classList.replace("block", "hidden");
    });
    dropdown.appendChild(optionNode);
  });
}

function setAttributes(el, attrs) {
  for (var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
}

function fetchFoodItems(query) {
  const xhr = new createCORSRequest(
    "GET",
    `https://api.edamam.com/auto-complete?app_id=${APP_ID}&app_key=${APP_KEY}&q=${query}`
  );
  xhr.onreadystatechange = function (e) {
    const options = JSON.parse(this.responseText);
    generateOptions(options);
  };
  xhr.send();
}

textInput.addEventListener(
  "input",
  debounce((e) => fetchFoodItems(e.target.value))
);

submitItem.addEventListener("click", function (e) {
  socket.emit("addItem", textInput.value);
});

function appendListItem(item, index) {
  const newItem = document.createElement("li");
  const checkbox = document.createElement("input");
  setAttributes(checkbox, { type: "checkbox", class: "m-2", id: index });
  checkbox.checked = item.checked;
  const label = document.createElement("label");
  setAttributes(label, {
    for: index,
    class: item.checked ? "m-2 line-through" : "m-2",
  });
  label.innerText = item.name;
  checkbox.addEventListener("click", function (e) {
    const checked = label.classList.contains("line-through");
    if (checked) {
      setAttributes(label, { class: "m-2" });
      socket.emit("updateItem", { index: index, checked: false });
    } else {
      setAttributes(label, { class: "line-through m-2" });
      socket.emit("updateItem", { index: index, checked: true });
    }
  });
  const remove = document.createElement("span");
  remove.innerHTML = "x";
  remove.addEventListener("click", function () {
    socket.emit("removeItem", index);
  });
  newItem.append(checkbox, label, remove);
  list.appendChild(newItem);
}

socket.on("loadItems", (data) => {
  initItems(data);
});
