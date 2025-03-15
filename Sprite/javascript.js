let zoomLevel = 1;
let spriteWidth = 8; // changing this to 8x8 so it will default for others not working with mcr xD
let spriteHeight = 8;
let isDragging = false;
let startCoords = { x: 0, y: 0 };
let startScroll = { x: 0, y: 0 };

function displaySprites(image) {
    const container = document.getElementById('sprite-container');
    container.innerHTML = '';
    let scale = 4; // default zoom, 3 works for 16x16 maybe 4 is better for 8x8?

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const updateCanvas = () => {
        const scaledWidth = image.width * scale;
        const scaledHeight = image.height * scale;

        canvas.width = scaledWidth;
        canvas.height = scaledHeight;
        ctx.imageSmoothingEnabled = false; //so pixelart got crisp edges, fuck this took a while to figure out!!

        const cellWidth = spriteWidth * scale;
        const cellHeight = spriteHeight * scale;

        for (let y = 0; y < scaledHeight; y += cellHeight) {
            for (let x = 0; x < scaledWidth; x += cellWidth) {
                ctx.fillStyle = (Math.floor(x / cellWidth) + Math.floor(y / cellHeight)) % 2 === 0
                    ? 'rgba(200, 200, 200, 0.5)'
                    : 'rgba(150, 150, 150, 0.5)';
                ctx.fillRect(x, y, cellWidth, cellHeight);
            }
        }

        ctx.drawImage(image, 0, 0, scaledWidth, scaledHeight);

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1;

        for (let x = 0; x <= scaledWidth; x += cellWidth) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, scaledHeight);
            ctx.stroke();
        }

        for (let y = 0; y <= scaledHeight; y += cellHeight) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(scaledWidth, y);
            ctx.stroke();
        }
    };

    const updateZoom = (deltaY) => {
        const zoomSpeed = 0.01; //was using scrollweel, changed because it was fucking with scrollbar
        scale += deltaY * zoomSpeed;
        scale = Math.min(Math.max(0.125, scale), 10);
        updateCanvas();
    };

    window.addEventListener('keydown', (event) => {
        if (event.key === '+' || event.key === '=') {
            updateZoom(100);
        } else if (event.key === '-') {
            updateZoom(-100);
        }
    });

    window.addEventListener('mouseup', (event) => {
        if (event.button === 0) {
            isDragging = false;
        }
    });

    function displayInfo(lastClicked, lastHovered) {
        document.getElementById('last-clicked-info').textContent = `Last Clicked: ${lastClicked}`;
        document.getElementById('last-hovered-info').textContent = `Last Hovered: ${lastHovered}`;
    }

    let lastClickedValue = '';
    let lastHoveredValue = '';

    canvas.addEventListener('dblclick', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const spritePosition = pixelToSpritePosition(x, y, image.width, image.height, scale);
        const clickedInfo = `0x${spritePosition.vertical}${spritePosition.horizontal}`;
        lastClickedValue = clickedInfo;

        copyToClipboard(clickedInfo);
        document.getElementById('last-clicked-value').textContent = clickedInfo;
        displayInfo(lastClickedValue, lastHoveredValue);
    });

    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const spritePosition = pixelToSpritePosition(x, y, image.width, image.height, scale);
        const hoveredSquareInfo = `0x${spritePosition.vertical}${spritePosition.horizontal}`;

        lastHoveredValue = hoveredSquareInfo;
        document.getElementById('last-hovered-value').textContent = hoveredSquareInfo;
        displayInfo(lastClickedValue, lastHoveredValue);
    });

    updateCanvas();
    container.appendChild(canvas);
}

function pixelToSpritePosition(x, y, width, height, scale) {
    const scaledX = x / scale;
    const scaledY = y / scale;
    const spriteX = Math.floor(scaledX / spriteWidth);
    const spriteY = Math.floor(scaledY / spriteHeight);

    return { vertical: spriteY.toString(16), horizontal: spriteX.toString(16) };
}

function copyToClipboard(value) {
    navigator.clipboard.writeText(value).then(() => {
        console.log('Value copied to clipboard:', value);
    }, (error) => {
        console.error('Unable to copy value to clipboard', error);
        alert('Unable to copy value to clipboard');
    });
}

document.getElementById('sprite-upload').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => displaySprites(img);
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

document.getElementById('sprite-width').addEventListener('change', (event) => {
    spriteWidth = parseInt(event.target.value);
    if (document.getElementById('sprite-upload').files.length > 0) {
        const file = document.getElementById('sprite-upload').files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => displaySprites(img);
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('sprite-height').addEventListener('change', (event) => {
    spriteHeight = parseInt(event.target.value);
    if (document.getElementById('sprite-upload').files.length > 0) {
        const file = document.getElementById('sprite-upload').files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => displaySprites(img);
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});
