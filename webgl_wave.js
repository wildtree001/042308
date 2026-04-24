/*
    Function: WebGl Animation for the homepage
    Usage: The function takes 2 arguments, the "action" that can be : "init", "kill", "play" and "pause" and the "targe" div where the script creates the canvas element
*/

var SEPARATION = 125, AMOUNTX = 35, AMOUNTY = 35;
var container, stats;
var camera, scene, renderer;
var particles, particle, count = 0, particles_globe = [];
var mouseX = 0, mouseY = 0;
var objTo;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var animation_type;
var rotation_speed = 0.002;
var timeout = null;
var $viewPort = $(document);
var $_body = $('body');
var $_html = $('html');

// 爆炸效果相关变量
var explosion_particles = [];
var explosions = [];
var EXPLOSION_DURATION = 3000;
var EXPLOSION_PARTICLE_COUNT = 80;

// 主题系统
var currentTheme = 'starry';
var themeTransitionProgress = 1;
var isTransitioning = false;

var themes = {
    starry: {
        name: '星空',
        background: 'linear-gradient(45deg, #0a0a20 0, #1a1a3a 25%, #0d1b2a 60%)',
        backgroundColor1: '#0a0a20',
        backgroundColor2: '#1a1a3a',
        backgroundColor3: '#0d1b2a',
        particleColor: 0xffffff,
        particleShape: 'circle',
        animationSpeed: 0.08,
        rotationSpeed: 0.0015,
        particleOpacity: 0.15,
        particleScale: 4,
        explosionColor: 0xffff88
    },
    ocean: {
        name: '海洋',
        background: 'linear-gradient(45deg, #006994 0, #00a8cc 25%, #005f73 60%)',
        backgroundColor1: '#006994',
        backgroundColor2: '#00a8cc',
        backgroundColor3: '#005f73',
        particleColor: 0x00ffff,
        particleShape: 'diamond',
        animationSpeed: 0.12,
        rotationSpeed: 0.0025,
        particleOpacity: 0.2,
        particleScale: 5,
        explosionColor: 0x00ccff
    },
    fire: {
        name: '火焰',
        background: 'linear-gradient(45deg, #1a0a0a 0, #3a0a0a 25%, #2a0a0a 60%)',
        backgroundColor1: '#1a0a0a',
        backgroundColor2: '#3a0a0a',
        backgroundColor3: '#2a0a0a',
        particleColor: 0xff6600,
        particleShape: 'star',
        animationSpeed: 0.15,
        rotationSpeed: 0.003,
        particleOpacity: 0.25,
        particleScale: 6,
        explosionColor: 0xff3300
    },
    aurora: {
        name: '极光',
        background: 'linear-gradient(45deg, #0a1a0a 0, #1a3a1a 25%, #0a2a0a 60%)',
        backgroundColor1: '#0a1a0a',
        backgroundColor2: '#1a3a1a',
        backgroundColor3: '#0a2a0a',
        particleColor: 0x00ff88,
        particleShape: 'triangle',
        animationSpeed: 0.1,
        rotationSpeed: 0.002,
        particleOpacity: 0.18,
        particleScale: 5,
        explosionColor: 0x88ff00
    }
};

var previousThemeData = null;

function webglWave(action, target){

    if( $_body.hasClass('ismobile') || $_html.hasClass('ie9'))
        return false;
    /* Logic Control to call the animation */
    if(action == 'init'){

        if(target == 'page404'){
            initGlobeError(target);
            addRemoveListeners(true);
            animateGlobeError();
        }
        else{
            /* Randomize the animation that is generated */
            //animation_type = Math.floor( (Math.random() * 2) + 0 );
			animation_type = 1;
            if(animation_type == 0){
                initWave(target);
                addRemoveListeners(true);
                animateWave();
            }
            else if(animation_type == 1){
                initGlobe(target);
                addRemoveListeners(true);
                animateGlobe();
            }
        }
    }
    else if(action == 'kill'){

        if(target == 'page404'){
            stopAnimationGlobeError(animation_id);
            killAnimationGlobeError();
            addRemoveListeners(false);
        }
        else{
            if(animation_type == 0 ){
                stopAnimationWave(animation_id);
                killAnimationWave();
                addRemoveListeners(false);
            }
            else if(animation_type == 1){
                stopAnimationGlobe(animation_id);
                killAnimationGlobe();
                addRemoveListeners(false);
            }
        }
    }
    else if(action == 'play'){

        if(target == 'page404'){
            addRemoveListeners(true);
            animateGlobeError();
        }
        else{
            if(animation_type == 0){
                addRemoveListeners(true);
                animateWave();
            }
            else if(animation_type == 1){
                addRemoveListeners(true);
                animateGlobe();
            }
        }
    }
    else if(action == 'stop'){
        if(target == 'page404'){
            addRemoveListeners(false);
            stopAnimationGlobeError(animation_id);
        }
        else{
            if(animation_type == 0){
                addRemoveListeners(false);
                stopAnimationWave(animation_id);
            }

            else if(animation_type == 1){
                addRemoveListeners(false);
                stopAnimationGlobe(animation_id);
            }
        }
    }
}

/* WAVE */
function initWave(target) {

     /* Creation of the canvas element in the "target" div */
    objTo = document.getElementById(target);
    container = document.getElementById('webgl-canvas');
    objTo.appendChild( container );

    /* Camera and scene creation */
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 1000;
    camera.position.y = 100;
    camera.position.y = 1000;
    scene = new THREE.Scene();

    /* Particles Creation */
    particles = new Array();

    var PI2 = Math.PI * 2;
    var i = 0;
    for ( var ix = 0; ix < AMOUNTX; ix ++ ) {

        for ( var iy = 0; iy < AMOUNTY; iy ++ ) {

            var material = new THREE.SpriteCanvasMaterial( {
                color: 0xffffff,
                transparent : true,
                program: function ( context ) {

                    context.beginPath();
                    context.arc( 0, 0, 0.5, 0, PI2, true );
                    context.fill();
                }
            } );

            particle = particles[ i ++ ] = new THREE.Sprite( material );
            particle.position.x = ix * SEPARATION - ( ( AMOUNTX * SEPARATION ) / 2 );
            particle.position.z = iy * SEPARATION - ( ( AMOUNTY * SEPARATION ) / 2 );
            scene.add( particle );
            particle.material.opacity = 0.4;
        }
    }

    /* Renderer Creation */
    renderer = new THREE.CanvasRenderer({ alpha: true });
    renderer.setClearColor( 0x0000, 0);
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    // stats = new Stats();
    // stats.domElement.style.position = 'absolute';
    // stats.domElement.style.top = '0px';
    // container.appendChild( stats.domElement );

}

/* User interaction */
function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

/* Wave animation start */
function animateWave() {

    animation_id = requestAnimationFrame( animateWave );

    renderWave();
    //stats.update();
}

/* Wave Animation */
function renderWave() {

    camera.position.x += ( mouseX - camera.position.x ) * .01;
    camera.position.y += ( mouseY - camera.position.y ) * .005;
    camera.lookAt( scene.position );

    var i = 0;
    for ( var ix = 0; ix < AMOUNTX; ix ++ ) {

        for ( var iy = 0; iy < AMOUNTY; iy ++ ) {

            particle = particles[ i++ ];
            particle.position.y = ( Math.sin( ( ix + count ) * 0.3 ) * 50 ) + ( Math.sin( ( iy + count ) * 0.5 ) * 50 );
            particle.scale.x = particle.scale.y = ( Math.sin( ( ix + count ) * 0.3 ) + 1 ) * 4 + ( Math.sin( ( iy + count ) * 0.5 ) + 1 ) * 4;

            opacity = (Math.abs(particle.position.y) /100);

            if(opacity < 0.5)
                opacity = 0.5;

            if (opacity > 1)
                opacity = 1;
            particle.material.opacity = opacity;
        }
    }

    renderer.render( scene, camera );

    count += 0.03;
}

/* Clear the scene and kill all objects */
function killAnimationWave(){

    if (scene) {
        while (scene.children.length > 0) {
            scene.remove(scene.children[scene.children.length - 1]);
       }
    }
    $('#webgl-canvas > canvas').remove();
}

/* Pause the animation*/
function stopAnimationWave(animation_id){

    cancelAnimationFrame(animation_id);
}

/* GLOBE */
function initGlobe(target) {

    /* Creation of the canvas element in the "target" div */
    objTo = document.getElementById(target);
    container = document.getElementById('webgl-canvas');
    objTo.appendChild( container );

    /* Camera and scene creation */
    camera = new THREE.PerspectiveCamera( 75,  window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 500;
    scene = new THREE.Scene();


    /* Particles Creation */
    var PI2 = Math.PI * 2;
    var program = function ( context ) {
        context.beginPath();
        context.arc( 0, 0, 25, 0, PI2, true );
        context.fill();
    }

    var PI2 = Math.PI * 2;
    for ( var i = 0; i < 500; i ++ ) {

        var material = new THREE.SpriteCanvasMaterial( {

            color: 0xffffff,
            transparent : true,
            program: function ( context ) {
                context.beginPath();
                context.arc( 0, 0, 0.5, 0, PI2, true );
                context.fill();
            }
        } );

        particle = new THREE.Sprite( material );
        particle.position.x = Math.random() * 2 - 1;
        particle.position.y = Math.random() * 2 - 1;
        particle.position.z = Math.random() * 2 - 1;
        particle.position.normalize();
        particle.position.multiplyScalar( Math.random() * 10 + 450 );
        particle.scale.multiplyScalar( 4 + Math.random()*2 );
        particle.material.opacity = 0.1;
        scene.add( particle );

        particles_globe.push(particle);
    }


    /* Particles Creation */
    for (var i = 0; i < 500; i++) {

        var geometry = new THREE.Geometry();
        var vertex = new THREE.Vector3( Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1 );

        vertex.normalize();
        vertex.multiplyScalar( 450 );

        geometry.vertices.push( vertex );

        var vertex2 = vertex.clone();
        vertex2.multiplyScalar( Math.random() * 0.3 + 1 );

        geometry.vertices.push( vertex2 );

        var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0xffffff, opacity: 0.3 } ) );
        scene.add( line );

    }

    /* Renderer Creation */
    renderer = new THREE.CanvasRenderer({ alpha: true });
    renderer.setClearColor( 0x0000, 0);
    renderer.setSize(  window.innerWidth , window.innerHeight );
    container.appendChild( renderer.domElement );
}

/* Globe animation start */
function animateGlobe() {

    animation_id = requestAnimationFrame( animateGlobe );

    renderGlobe();
}

/* Globe Animation */
function renderGlobe() {
    var $webglCanvas = $('body:hover');

    var x = camera.position.x, y = camera.position.y, z = camera.position.z;

    if ($webglCanvas.length != 0 && timeout != null) {
        camera.position.x += (( mouseX - camera.position.x ) * .05) ;
    }
    else{
        camera.position.x = x * Math.cos(rotation_speed) - z * Math.sin(rotation_speed);
        camera.position.z = z * Math.cos(rotation_speed) + x * Math.sin(rotation_speed);
    }

    camera.position.y += ( - mouseY + 200 - camera.position.y ) * .05 ;

    $viewPort.on('mousemove', function() {
        if (timeout !== null) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(function() {
            timeout = null;
        }, 600);
    });

    camera.lookAt( scene.position );

     var i = 0;

    for ( var i = 0; i < particles_globe.length ; i ++ ) {

        particle = particles_globe[ i++ ];
        temp = ( Math.sin( ( i + count ) * 0.3 ) * 50 ) + ( Math.sin( ( i + count ) * 0.5 ) * 0.50 );

        opacity = (Math.abs(temp) /50) + 0.1

        if (opacity > 1)
            opacity = 1;
        particle.material.opacity = opacity;
    }

    renderer.render( scene, camera );

    count += 0.1;

    renderer.render( scene, camera );
}

/* Clear the scene and kill all objects */
function killAnimationGlobe(){

    if (scene) {
        while (scene.children.length > 0) {
            scene.remove(scene.children[scene.children.length - 1]);
       }
    }
    $('#webgl-canvas > canvas').remove();
}

/* Pause the animation*/
function stopAnimationGlobe(animation_id){
    cancelAnimationFrame(animation_id);
}


/* GLOBE ERROR*/
function initGlobeError(target) {

    /* Creation of the canvas element in the "target" div */
    objTo = document.getElementById(target);
    container = document.getElementById('webgl-canvas');
    objTo.appendChild( container );

    /* Camera and scene creation */
    camera = new THREE.PerspectiveCamera( 75,  window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 500;
    scene = new THREE.Scene();

    /* Particles Creation */
    var PI2 = Math.PI * 2;
    var program = function ( context ) {
        context.beginPath();
        context.arc( 0, 0, 25, 0, PI2, true );
        context.fill();
    }

    var PI2 = Math.PI * 2;
    for ( var i = 0; i < 250; i ++ ) {

        var material = new THREE.SpriteCanvasMaterial( {

            color: 0xffffff,
            transparent : true,
            program: function ( context ) {
                context.beginPath();
                context.arc( 0, 0, 0.5, 0, PI2, true );
                context.fill();
            }
        } );

        particle = new THREE.Sprite( material );
        particle.position.x = Math.random() * 2 - 1;
        particle.position.y = Math.random() * 2 - 1;
        particle.position.z = Math.random() * 2 - 1;
        particle.position.normalize();
        particle.position.multiplyScalar( Math.random() * 10 + 450 );
        particle.scale.multiplyScalar( 4 + Math.random()*2 );
        particle.material.opacity = 0.1;
        scene.add( particle );

        particles_globe.push(particle);
    }




    /* Renderer Creation */
    renderer = new THREE.CanvasRenderer({ alpha: true });
    renderer.setClearColor( 0x0000, 0);
    renderer.setSize(  window.innerWidth , window.innerHeight );
    container.appendChild( renderer.domElement );
}

/* Globe animation start */
function animateGlobeError() {

    animation_id = requestAnimationFrame( animateGlobeError );

    renderGlobeError();
}

/* Globe Animation */
function renderGlobeError() {

    var rotation_speed = 0.002;
    var x = camera.position.x, y = camera.position.y, z = camera.position.z;


    camera.position.x = x * Math.cos(rotation_speed) + z * Math.sin(rotation_speed);
    camera.position.z = z * Math.cos(rotation_speed) - x * Math.sin(rotation_speed);


    camera.lookAt( scene.position );


    renderer.render( scene, camera );

    count += 0.1;

    renderer.render( scene, camera );
}

/* Clear the scene and kill all objects */
function killAnimationGlobeError(){

    if (scene) {
        while (scene.children.length > 0) {
            scene.remove(scene.children[scene.children.length - 1]);
       }
    }
    $('#webgl-canvas > canvas').remove();
}

/* Pause the animation*/
function stopAnimationGlobeError(animation_id){
    cancelAnimationFrame(animation_id);
}


/* GLOBAL FUNCTIONS */

/* User Listeners - takes an argument (true or false) to turn on and off as needed */
function addRemoveListeners(action){

    if(action){
        document.addEventListener( 'mousemove', onDocumentMouseMove, false );
        document.addEventListener( 'touchstart', onDocumentTouchStart, false );
        document.addEventListener( 'touchmove', onDocumentTouchMove, false );
        window.addEventListener( 'resize', onWindowResize, false );
    }
    else{
        document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
        document.removeEventListener( 'touchstart', onDocumentTouchStart, false );
        document.removeEventListener( 'touchmove', onDocumentTouchMove, false );
        window.removeEventListener( 'resize', onWindowResize, false );
    }
}

/* User interaction */
function onDocumentMouseMove( event ) {

    mouseX = event.clientX - windowHalfX;
    /*mouseY = event.clientY - windowHalfY;*/
    mouseY = event.clientY + 150;
}

/* User interaction */
function onDocumentTouchStart( event ) {

    if ( event.touches.length === 1 ) {
        event.preventDefault();

        mouseX = event.touches[ 0 ].pageX - windowHalfX;
        /*mouseY = event.touches[ 0 ].pageY - windowHalfY;*/
        mouseY = - event.touches[ 0 ].pageY;
    }
}

/* User interaction */
function onDocumentTouchMove( event ) {

    if ( event.touches.length === 1 ) {
        event.preventDefault();

        mouseX = event.touches[ 0 ].pageX - windowHalfX;
        /* mouseY = event.touches[ 0 ].pageY - windowHalfY;*/
        mouseY = - event.touches[ 0 ].pageY;
    }
}

/* ==================== 新功能 ==================== */

// 粒子形状绘制函数
function createParticleProgram(shape) {
    var PI2 = Math.PI * 2;

    switch(shape) {
        case 'circle':
            return function(context) {
                context.beginPath();
                context.arc(0, 0, 0.5, 0, PI2, true);
                context.fill();
            };

        case 'diamond':
            return function(context) {
                context.beginPath();
                context.moveTo(0, -0.7);
                context.lineTo(0.5, 0);
                context.lineTo(0, 0.7);
                context.lineTo(-0.5, 0);
                context.closePath();
                context.fill();
            };

        case 'star':
            return function(context) {
                context.beginPath();
                for (var i = 0; i < 5; i++) {
                    var angle = (i * 4 * Math.PI / 5) - Math.PI / 2;
                    var x = Math.cos(angle) * 0.6;
                    var y = Math.sin(angle) * 0.6;
                    if (i === 0) {
                        context.moveTo(x, y);
                    } else {
                        context.lineTo(x, y);
                    }
                }
                context.closePath();
                context.fill();
            };

        case 'triangle':
            return function(context) {
                context.beginPath();
                context.moveTo(0, -0.7);
                context.lineTo(0.6, 0.5);
                context.lineTo(-0.6, 0.5);
                context.closePath();
                context.fill();
            };

        default:
            return function(context) {
                context.beginPath();
                context.arc(0, 0, 0.5, 0, PI2, true);
                context.fill();
            };
    }
}

// 爆炸效果函数
function createExplosion(x, y) {
    var theme = themes[currentTheme];
    var explosion = {
        particles: [],
        startTime: Date.now(),
        centerX: x,
        centerY: y
    };

    // 将屏幕坐标转换为3D世界坐标
    var vector = new THREE.Vector3(
        (x / window.innerWidth) * 2 - 1,
        -(y / window.innerHeight) * 2 + 1,
        0.5
    );

    // 兼容旧版 Three.js 的坐标转换
    var projector = new THREE.Projector();
    vector = projector.unprojectVector(vector, camera);
    var dir = vector.sub(camera.position).normalize();
    var distance = -camera.position.z / dir.z;
    var pos = camera.position.clone().add(dir.multiplyScalar(distance));

    for (var i = 0; i < EXPLOSION_PARTICLE_COUNT; i++) {
        var angle = Math.random() * Math.PI * 2;
        var speed = 2 + Math.random() * 6;
        var velocity = new THREE.Vector3(
            Math.cos(angle) * speed,
            (Math.random() - 0.5) * speed,
            Math.sin(angle) * speed
        );

        var material = new THREE.SpriteCanvasMaterial({
            color: theme.explosionColor,
            transparent: true,
            program: createParticleProgram(theme.particleShape)
        });

        var explosionParticle = new THREE.Sprite(material);
        explosionParticle.position.copy(pos);
        explosionParticle.scale.multiplyScalar(3 + Math.random() * 3);
        explosionParticle.material.opacity = 1;
        explosionParticle.userData = {
            velocity: velocity,
            life: 1
        };

        scene.add(explosionParticle);
        explosion.particles.push(explosionParticle);
    }

    explosions.push(explosion);
}

// 更新爆炸效果
function updateExplosions() {
    var currentTime = Date.now();

    for (var i = explosions.length - 1; i >= 0; i--) {
        var explosion = explosions[i];
        var elapsed = currentTime - explosion.startTime;
        var progress = elapsed / EXPLOSION_DURATION;

        if (progress >= 1) {
            // 移除爆炸粒子
            for (var j = 0; j < explosion.particles.length; j++) {
                scene.remove(explosion.particles[j]);
            }
            explosions.splice(i, 1);
            continue;
        }

        // 更新每个粒子
        for (var j = 0; j < explosion.particles.length; j++) {
            var particle = explosion.particles[j];

            // 移动粒子
            particle.position.add(particle.userData.velocity);

            // 减速
            particle.userData.velocity.multiplyScalar(0.98);

            // 重力效果
            particle.userData.velocity.y -= 0.05;

            // 淡出效果
            var life = 1 - progress;
            particle.material.opacity = life * 0.8;

            // 缩放变化
            var scale = 1 + progress * 1.5;
            particle.scale.set(scale * 3, scale * 3, scale * 3);
        }
    }
}

// 鼠标点击事件
function onDocumentClick(event) {
    event.preventDefault();
    createExplosion(event.clientX, event.clientY);
}

// 触摸点击事件
function onDocumentTouchClick(event) {
    if (event.touches.length === 1) {
        event.preventDefault();
        createExplosion(event.touches[0].pageX, event.touches[0].pageY);
    }
}

// 主题切换函数
function switchTheme(themeName) {
    if (!themes[themeName] || themeName === currentTheme) {
        return;
    }

    // 保存当前主题数据用于过渡
    previousThemeData = {
        theme: themes[currentTheme],
        particleColors: []
    };

    for (var i = 0; i < particles_globe.length; i++) {
        previousThemeData.particleColors.push(particles_globe[i].material.color.getHex());
    }

    currentTheme = themeName;
    themeTransitionProgress = 0;
    isTransitioning = true;

    // 更新背景
    updateBackgroundGradient();

    // 更新主题按钮状态
    updateThemeButtons();
}

// 更新背景渐变
function updateBackgroundGradient() {
    var $canvas = $('#webgl-canvas');
    var theme = themes[currentTheme];

    if (theme.background) {
        $canvas.css('background', theme.background);
    }
}

// 颜色插值函数
function lerpColor(color1Hex, color2Hex, t) {
    var r1 = (color1Hex >> 16) & 0xff;
    var g1 = (color1Hex >> 8) & 0xff;
    var b1 = color1Hex & 0xff;

    var r2 = (color2Hex >> 16) & 0xff;
    var g2 = (color2Hex >> 8) & 0xff;
    var b2 = color2Hex & 0xff;

    var r = Math.round(r1 + (r2 - r1) * t);
    var g = Math.round(g1 + (g2 - g1) * t);
    var b = Math.round(b1 + (b2 - b1) * t);

    return (r << 16) | (g << 8) | b;
}

// 更新主题过渡效果
function updateThemeTransition() {
    if (!isTransitioning) return;

    themeTransitionProgress += 0.02;

    if (themeTransitionProgress >= 1) {
        themeTransitionProgress = 1;
        isTransitioning = false;
        previousThemeData = null;
    }

    var theme = themes[currentTheme];
    var t = easeInOutCubic(themeTransitionProgress);

    // 更新旋转速度
    rotation_speed = theme.rotationSpeed;

    // 更新粒子
    for (var i = 0; i < particles_globe.length; i++) {
        var particle = particles_globe[i];

        // 颜色过渡
        if (previousThemeData && previousThemeData.particleColors[i]) {
            var newColor = lerpColor(
                previousThemeData.particleColors[i],
                theme.particleColor,
                t
            );
            particle.material.color.setHex(newColor);
        } else {
            particle.material.color.setHex(theme.particleColor);
        }

        // 透明度过渡
        particle.material.opacity = theme.particleOpacity * 0.5 + (Math.sin((i + count) * 0.3) * 50) / 100;
        if (particle.material.opacity > 1) particle.material.opacity = 1;
        if (particle.material.opacity < 0.1) particle.material.opacity = 0.1;

        // 缩放过渡
        var targetScale = theme.particleScale + Math.random() * 2;
        var currentScale = particle.scale.x;
        particle.scale.multiplyScalar(0.98);
        particle.scale.addScalar(targetScale * 0.02);
    }
}

// 缓动函数
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// 创建主题切换按钮
function createThemeButtons() {
    // 移除已存在的按钮容器
    $('#theme-switcher').remove();

    var $container = $('<div id="theme-switcher" style="position: fixed; top: 20px; right: 20px; z-index: 1000; display: flex; gap: 10px;"></div>');

    var themeKeys = Object.keys(themes);
    for (var i = 0; i < themeKeys.length; i++) {
        var key = themeKeys[i];
        var theme = themes[key];

        var $btn = $('<button class="theme-btn" data-theme="' + key + '"></button>');
        $btn.css({
            padding: '10px 16px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            background: key === currentTheme ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)'
        });
        $btn.text(theme.name);

        $btn.hover(function() {
            $(this).css({
                background: 'rgba(255,255,255,0.15)',
                borderColor: 'rgba(255,255,255,0.5)'
            });
        }, function() {
            if ($(this).data('theme') === currentTheme) {
                $(this).css({
                    background: 'rgba(255,255,255,0.2)',
                    borderColor: 'rgba(255,255,255,0.3)'
                });
            } else {
                $(this).css({
                    background: 'rgba(0,0,0,0.3)',
                    borderColor: 'rgba(255,255,255,0.3)'
                });
            }
        });

        $btn.click(function() {
            var themeName = $(this).data('theme');
            switchTheme(themeName);
        });

        $container.append($btn);
    }

    $('body').append($container);
}

// 更新主题按钮状态
function updateThemeButtons() {
    $('.theme-btn').each(function() {
        var $btn = $(this);
        if ($btn.data('theme') === currentTheme) {
            $btn.css({
                background: 'rgba(255,255,255,0.2)',
                borderColor: 'rgba(255,255,255,0.5)'
            });
        } else {
            $btn.css({
                background: 'rgba(0,0,0,0.3)',
                borderColor: 'rgba(255,255,255,0.3)'
            });
        }
    });
}

// 重写 initGlobe 以支持主题
function initGlobe(target) {
    objTo = document.getElementById(target);
    container = document.getElementById('webgl-canvas');
    objTo.appendChild(container);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 500;
    scene = new THREE.Scene();

    var theme = themes[currentTheme];
    rotation_speed = theme.rotationSpeed;

    for (var i = 0; i < 500; i++) {
        var material = new THREE.SpriteCanvasMaterial({
            color: theme.particleColor,
            transparent: true,
            program: createParticleProgram(theme.particleShape)
        });

        particle = new THREE.Sprite(material);
        particle.position.x = Math.random() * 2 - 1;
        particle.position.y = Math.random() * 2 - 1;
        particle.position.z = Math.random() * 2 - 1;
        particle.position.normalize();
        particle.position.multiplyScalar(Math.random() * 10 + 450);
        particle.scale.multiplyScalar(theme.particleScale + Math.random() * 2);
        particle.material.opacity = theme.particleOpacity;
        scene.add(particle);

        particles_globe.push(particle);
    }

    for (var i = 0; i < 500; i++) {
        var geometry = new THREE.Geometry();
        var vertex = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);

        vertex.normalize();
        vertex.multiplyScalar(450);

        geometry.vertices.push(vertex);

        var vertex2 = vertex.clone();
        vertex2.multiplyScalar(Math.random() * 0.3 + 1);

        geometry.vertices.push(vertex2);

        var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: theme.particleColor, opacity: 0.3 }));
        scene.add(line);
    }

    renderer = new THREE.CanvasRenderer({ alpha: true });
    renderer.setClearColor(0x0000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    updateBackgroundGradient();
}

// 重写 renderGlobe 以支持新功能
function renderGlobe() {
    var $webglCanvas = $('body:hover');
    var theme = themes[currentTheme];

    var x = camera.position.x, y = camera.position.y, z = camera.position.z;

    if ($webglCanvas.length != 0 && timeout != null) {
        camera.position.x += ((mouseX - camera.position.x) * .05);
    }
    else {
        camera.position.x = x * Math.cos(rotation_speed) - z * Math.sin(rotation_speed);
        camera.position.z = z * Math.cos(rotation_speed) + x * Math.sin(rotation_speed);
    }

    camera.position.y += (-mouseY + 200 - camera.position.y) * .05;

    $viewPort.on('mousemove', function() {
        if (timeout !== null) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(function() {
            timeout = null;
        }, 600);
    });

    camera.lookAt(scene.position);

    // 更新主题过渡
    updateThemeTransition();

    // 更新粒子动画
    var i = 0;
    for (i = 0; i < particles_globe.length; i++) {
        particle = particles_globe[i];
        var temp = (Math.sin((i + count) * 0.3) * 50) + (Math.sin((i + count) * 0.5) * 0.50);

        opacity = (Math.abs(temp) / 50) + theme.particleOpacity;

        if (opacity > 1)
            opacity = 1;
        particle.material.opacity = opacity;
    }

    // 更新爆炸效果
    updateExplosions();

    renderer.render(scene, camera);

    count += theme.animationSpeed;
}

// 重写 addRemoveListeners 以添加点击事件
function addRemoveListeners(action) {
    if (action) {
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('touchstart', onDocumentTouchStart, false);
        document.addEventListener('touchmove', onDocumentTouchMove, false);
        window.addEventListener('resize', onWindowResize, false);
        document.addEventListener('click', onDocumentClick, false);
        document.addEventListener('touchstart', onDocumentTouchClick, false);
    }
    else {
        document.removeEventListener('mousemove', onDocumentMouseMove, false);
        document.removeEventListener('touchstart', onDocumentTouchStart, false);
        document.removeEventListener('touchmove', onDocumentTouchMove, false);
        window.removeEventListener('resize', onWindowResize, false);
        document.removeEventListener('click', onDocumentClick, false);
        document.removeEventListener('touchstart', onDocumentTouchClick, false);
    }
}
