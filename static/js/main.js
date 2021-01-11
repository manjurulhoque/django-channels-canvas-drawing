let colorPicker = document.querySelector('.color-picker');
colorPicker.addEventListener("change", watchColorPicker, false);

function watchColorPicker(event) {
    document.getElementById('colors').style.background = event.target.value;
}

const clearButton = document.querySelector('.clear');
const stroke_weight = document.querySelector('.stroke-weight');
const color_picker = document.querySelector('.color-picker');

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;

function start(e) {
    isDrawing = true;

    let x = e.clientX, y = e.clientY;
    let lineWidth = stroke_weight.value;
    let strokeStyle = color_picker.value;

    send(x, y, lineWidth, strokeStyle);
}

const send = (x, y, lineWidth, strokeStyle) => {

    if(!isDrawing) return;

    const w = canvas.width;
    const h = canvas.height;

    ws.send(JSON.stringify({
        x: x,
        y: y,
        "lineWidth": lineWidth,
        "color": strokeStyle,
        "event": "drawing"
    }));
}

const move = (e) => {
    let x = e.clientX, y = e.clientY;
    let lineWidth = stroke_weight.value;
    let strokeStyle = color_picker.value;

    send(x, y, lineWidth, strokeStyle);
}

function draw(x, y, lineWidth, color, event) {
    if (!isDrawing && event !== "drawing") return;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.strokeStyle = color;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function stop() {
    isDrawing = false;
    ctx.beginPath();
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

window.addEventListener('resize', resizeCanvas);

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();

const onDrawingEvent = (data) => {
    console.log(data);
    const w = canvas.width;
    const h = canvas.height;
    draw(data.x, data.y, data.lineWidth, data.color, data.event);
}

canvas.addEventListener('mousedown', start);
canvas.addEventListener('mousemove', move)
canvas.addEventListener('mouseup', stop);

clearButton.addEventListener('click', clearCanvas, false);