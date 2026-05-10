let mouse = { x: window.innerWidth, y: window.innerHeight };

const updateMousePosition = (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
};

document.addEventListener("mousemove", updateMousePosition);

export { mouse };
