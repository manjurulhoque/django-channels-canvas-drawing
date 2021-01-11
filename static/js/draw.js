let canvas = document.getElementsByTagName('canvas')[0];
const context = canvas.getContext('2d');
let dataURL = '';
let colors = document.getElementsByClassName('color');
let current = {
    color: 'black',
    x: 0,
    y: 0,
};

let prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0;

const onColorUpdate = (e) => {
    current.color = e.target.className.split(' ')[1];
};

for (let i = 0; i < colors.length; i++) {
    colors[i].addEventListener('click', onColorUpdate, false);
}

let drawing = false;

const send = (x0, y0, x1, y1, color) => {
    ws.send(JSON.stringify({
        x0,
        y0,
        x1,
        y1,
        color,
    }));
}

const drawLine = (x0, y0, x1, y1, color, send) => {
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = 5;
    // context.lineCap = "round";
    context.stroke();
    context.closePath();
    context.save();
    dataURL = canvas.toDataURL('image/png');
    if (!send) {
        return;
    }
    const w = canvas.width;
    const h = canvas.height;

    ws.send(JSON.stringify({
        x0: x0 / w,
        y0: y0 / h,
        x1: x1 / w,
        y1: y1 / h,
        color,
    }));
};

const onMouseDown = (e) => {
    drawing = true;
    prevX = currX;
    prevY = currY;
    currX = e.clientX - canvas.offsetLeft;
    currY = e.clientY - canvas.offsetTop;

    // it won't send socket data
    context.beginPath();
    context.fillStyle = current.color;
    context.fillRect(currX, currY, 5, 5);
    context.closePath();

    ws.send(JSON.stringify({
        x0: x0 / w,
        y0: y0 / h,
        x1: x1 / w,
        y1: y1 / h,
        color,
    }));

    // current.x = e.clientX - canvas.offsetLeft || e.touches[0].clientX;
    // current.y = e.clientY - canvas.offsetTop || e.touches[0].clientY;
};

const onMouseMove = (e) => {
    if (!drawing) {
        return;
    }
    prevX = currX;
    prevY = currY;
    currX = e.clientX - canvas.offsetLeft;
    currY = e.clientY - canvas.offsetTop;

    const w = canvas.width;
    const h = canvas.height;

    //send(prevX / w, prevY / h, currX / w, currY / h, current.color);

    drawLine(prevX, prevY, currX, currY, current.color, true);

    // drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, true);
    // current.x = e.clientX || e.touches[0].clientX;
    // current.y = e.clientY || e.touches[0].clientY;
};

const onMouseUp = (e) => {
    if (!drawing) {
        return;
    }
    drawing = false;
    //drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, true);
};

const throttle = (callback, delay) => {
    let previousCall = new Date().getTime();
    return function () {
        const time = new Date().getTime();
        if ((time - previousCall) >= delay) {
            previousCall = time;
            callback.apply(null, arguments);
        }
    };
};

// resize canvas
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let img = document.createElement('img');
    img.src = dataURL;
    context.drawImage(img, 0, 0);
    context.restore();
}

canvas.addEventListener('mousedown', onMouseDown, false);
canvas.addEventListener('mouseup', onMouseUp, false);
canvas.addEventListener('mouseout', onMouseUp, false);
// canvas.addEventListener('mousemove', onMouseMove, false);
canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

canvas.addEventListener('touchstart', onMouseDown, false);
canvas.addEventListener('touchend', onMouseUp, false);
canvas.addEventListener('touchcancel', onMouseUp, false);
canvas.addEventListener('touchmove', throttle(onMouseMove, 10), false);
window.addEventListener('resize', resize);

const erase = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

document.getElementById("erase").addEventListener("click", (e) => {
    erase();
    //document.getElementById("canvasimg").style.display = "none";
    ws.send(JSON.stringify({
        "event": "erase"
    }));
})

const onDrawingEvents = (data) => {
    const w = canvas.width;
    const h = canvas.height;
    drawing = true;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
}