document.addEventListener('DOMContentLoaded', () => {
    const dot = document.getElementById('dot');
    const circle = document.getElementById("circle");
    const radiusInput = document.getElementById('radius');
    const radiusValue = document.getElementById("radiusValue");
    const angleInput = document.getElementById("angleInput");
    const angleValue = document.getElementById("angleValue");
    const pos = document.getElementById("pos");
    const opacityInput = document.getElementById("opacity");
    const opacityValue = document.getElementById("opacityValue");
    const dotOpacity = document.getElementById('dotOpacity');
    const dotOpacityValue = document.getElementById('dotOpacityValue');
    const rotation = document.getElementById('rot');
    const counterRotation = document.getElementById('counter-clockwise');
    const tempThetaValue = document.getElementById('tempThetaValue');
    
    let currentRotation = 0;
    let animationId = null;
    let rotationTarget = 0;
    let rotationSpeed = 0;
    let isAnimating = false;

    const updateDotPosition = (angle, radius) => {
        const radian = angle * (Math.PI / 180);
        const x = Math.cos(radian);
        const y = Math.sin(radian);

        if (angle % 180 == 0 || angle == 0) {
            pos.textContent = `Position: ${(radius / 10 * x).toFixed(2)} + ${(radius / 10 * 0).toFixed(2)}i`;
        } else if (angle == 90 || angle == 270) {
            pos.textContent = `Position: ${(radius / 10 * 0).toFixed(2)} + ${(radius / 10 * y).toFixed(2)}i`;
        } else {
            pos.textContent = `Position: ${(radius / 10 * x).toFixed(2)} + ${(radius / 10 * y).toFixed(2)}i`;
        }
        circle.style.transform = `rotate(${-radian}rad)`;
    };

    const updateCircle = () => {
        const radius = radiusInput.value;
        const opacity = opacityInput.value;

        radiusValue.textContent = (radius / 10).toFixed(1);
        opacityValue.textContent = opacity;
        circle.style.width = `${2 * radius}px`;
        circle.style.height = `${2 * radius}px`;
        circle.style.borderColor = `rgba(52, 152, 219, ${opacity})`;
    };

    angleInput.addEventListener('input', () => {
        const angle = angleInput.value;
        angleValue.textContent = angle;
        updateDotPosition(angle, radiusInput.value);
    });

    radiusInput.addEventListener('input', () => {
        const angle = angleInput.value;
        angleValue.textContent = angle;
        updateDotPosition(angle, radiusInput.value);
    });

    dotOpacity.addEventListener('input', () => {
        const opacity = dotOpacity.value;
        dotOpacityValue.textContent = opacity;
        dot.style.backgroundColor = `rgba(255,0,0,${opacity})`;
    });

    radiusInput.addEventListener("input", updateCircle);
    opacityInput.addEventListener("input", updateCircle);
    updateCircle();

    const socket = io('/main');  // Main connection
    const thetaSocket = io('/theta');  // Connection for theta updates
    const thetaInput = document.getElementById('theta');

    socket.on('update_euler', data => {
        eulerValue.innerHTML = `\\(${data.euler_value}\\)`;
        thetaValue.innerHTML = `\\(${data.theta_str}\\)`;
        MathJax.typeset();
    });

    function getRotationAmount() {
        const rotationAmount = parseFloat(thetaInput.value);
        const startAngle = parseFloat(angleInput.value);
        return { rotationAmount, startAngle };
    }

    function animate() {
        if (Math.abs(currentRotation - rotationTarget) > 0.1) {
            currentRotation += rotationSpeed;
            circle.style.transform = `rotate(${-currentRotation}deg)`;
            const normalizedRotation = ((currentRotation % 360) + 360) % 360;
            angleInput.value = normalizedRotation.toFixed(2);
            updateDotPosition(normalizedRotation, radiusInput.value);
            thetaSocket.emit('theta_update', { tempThetaValue: normalizedRotation });
            animationId = requestAnimationFrame(animate);
        } else {
            isAnimating = false;
            const finalRotation = ((currentRotation % 360) + 360) % 360;
            angleInput.value = finalRotation.toFixed(2);
            updateDotPosition(finalRotation, radiusInput.value);
            thetaSocket.emit('theta_update', { tempThetaValue: finalRotation });
            updatePositionEuler();
            rotationSpeed = 0;
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    function startRotation(factor) {
        isAnimating = true;
        const { rotationAmount, startAngle } = getRotationAmount();
        currentRotation = startAngle;
        rotationTarget = currentRotation + rotationAmount * factor;
        rotationSpeed = rotationAmount * factor / 60;
        const finalRotation = ((rotationTarget % 360) + 360) % 360;
        updateDotPosition(finalRotation);
        angleValue.textContent = finalRotation;
        circle.style.transform = `rotate(${-currentRotation}deg)`;
        if (!animationId) {
            animationId = requestAnimationFrame(animate);
        }
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    const debouncedTypeset = debounce(() => {
        if (!isAnimating) {
            MathJax.typeset();
        }
    }, 100);

    thetaSocket.on('theta_update', data => {
        const thetaValue = parseFloat(data.tempThetaValue.split('=')[1]);
        if (isAnimating) {
            tempThetaValue.textContent = `θ = ${thetaValue.toFixed(2)}`;
        } else {
            tempThetaValue.innerHTML = `\\(${data.tempThetaValue}\\)`;
            debouncedTypeset();
        }
    });

    function updatePositionEuler() {
        const theta = thetaInput.value;
        const angle = angleInput.value;
        const radius = radiusInput.value;
        socket.emit('change_values', { theta, angle, radius });
    }

    thetaInput.addEventListener('input', updatePositionEuler);
    angleInput.addEventListener('input', updatePositionEuler);
    radiusInput.addEventListener('input', updatePositionEuler);

    rotation.addEventListener('click', () => {
        startRotation(1);  // Positive for clockwise rotation
    });

    counterRotation.addEventListener('click', () => {

        startRotation(-1);  // Negative for counter-clockwise rotation

    });



   
    //initial animation logic 
    // function easeInOutQuad(t) {
    //     return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    // }

});
