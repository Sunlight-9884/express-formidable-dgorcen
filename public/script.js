const url = localStorage.getItem("url");

const fetchData = async () => {
  if (url) {
    const res = await fetch(`${url}/users`);
    const data = await res.json();
    console.log(data);
  } else {
    window.location.href = "/api";
  }
};

fetchData();

const fileInput = document.querySelector(".fileInput");
const uploadBtn = document.querySelector(".upload");
const img = document.querySelector(".img");

img.src = localStorage.getItem("img") || "";

uploadBtn.addEventListener("click", () => {
  const files = [...fileInput.files];
  const formData = new FormData();

  files.forEach((file) => formData.append("file", file));

  fetch(`${url}/upload`, {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      localStorage.setItem("img", data.url);
      img.src = data.url;
    });
});
