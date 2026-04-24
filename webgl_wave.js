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

// 主题配置系统
var themes = {
    star: {
        name: '星空',
        backgroundColor: '#0c0d13',
        backgroundGradient: 'linear-gradient(135deg, #0c0d13 0%, #1a1b2e 50%, #2d2f4a 100%)',
        particleColors: [0xffffff, 0xffffd7, 0x87ceeb, 0xe6e6fa],
        particleShape: 'circle',
        animationSpeed: 0.1,
        rotationSpeed: 0.002,
        particleOpacity: 0.1,
        particleSize: 4,
        connectionLineColor: 0xffffff,
        connectionLineOpacity: 0.3,
        explosionColors: [0xffffff, 0xffff00, 0xff6600, 0xff00ff]
    },
    ocean: {
        name: '海洋',
        backgroundColor: '#000428',
        backgroundGradient: 'linear-gradient(135deg, #000428 0%, #004e92 100%)',
        particleColors: [0x00bfff, 0x1e90ff, 0x4169e1, 0x00ffff],
        particleShape: 'circle',
        animationSpeed: 0.08,
        rotationSpeed: 0.001,
        particleOpacity: 0.15,
        particleSize: 5,
        connectionLineColor: 0x00bfff,
        connectionLineOpacity: 0.4,
        explosionColors: [0x00bfff, 0x00ffff, 0x4169e1, 0x1e90ff]
    },
    fire: {
        name: '火焰',
        backgroundColor: '#4a0000',
        backgroundGradient: 'linear-gradient(135deg, #4a0000 0%, #c70000 50%, #ff4d00 100%)',
        particleColors: [0xff4500, 0xff6347, 0xff8c00, 0xffd700],
        particleShape: 'circle',
        animationSpeed: 0.15,
        rotationSpeed: 0.003,
        particleOpacity: 0.2,
        particleSize: 6,
        connectionLineColor: 0xff4500,
        connectionLineOpacity: 0.5,
        explosionColors: [0xff4500, 0xff0000, 0xffd700, 0xff8c00]
    },
    aurora: {
        name: '极光',
        backgroundColor: '#0a2a3f',
        backgroundGradient: 'linear-gradient(135deg, #0a2a3f 0%, #1e6f5c 50%, #33cc8c 100%)',
        particleColors: [0x33cc8c, 0x00ff7f, 0x7cfc00, 0x00fa9a],
        particleShape: 'circle',
        animationSpeed: 0.06,
        rotationSpeed: 0.0015,
        particleOpacity: 0.12,
        particleSize: 5,
        connectionLineColor: 0x33cc8c,
        connectionLineOpacity: 0.35,
        explosionColors: [0x33cc8c, 0x00ff7f, 0x7cfc00, 0x00fa9a]
    }
};

// 当前主题
var currentTheme = 'star';

// 粒子连线效果相关变量
var connectionLines = [];
var connectionThreshold = 100; // 粒子连接阈值
var mousePosition = new THREE.Vector3();
var mouseRaycaster = new THREE.Raycaster();
var connectionLineMaterial;

// 爆炸效果相关变量
var explosionParticles = [];
var explosionActive = false;

// 过渡效果相关变量
var isTransitioning = false;
var transitionProgress = 0;
var previousTheme = null;

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

// 主题切换函数
function changeTheme(themeName) {
    if (themeName === currentTheme || isTransitioning) return;
    
    // 开始过渡效果
    isTransitioning = true;
    transitionProgress = 0;
    previousTheme = currentTheme;
    currentTheme = themeName;
    
    // 更新背景渐变
    updateBackgroundGradient();
    
    // 更新动画参数
    var theme = themes[themeName];
    rotation_speed = theme.rotationSpeed;
    
    // 更新粒子颜色
    updateParticleColors();
    
    // 更新连线材质
    if (connectionLineMaterial) {
        connectionLineMaterial.color.setHex(theme.connectionLineColor);
        connectionLineMaterial.opacity = theme.connectionLineOpacity;
    }
}

// 更新背景渐变
function updateBackgroundGradient() {
    var theme = themes[currentTheme];
    var canvas = document.getElementById('webgl-canvas');
    if (canvas) {
        canvas.style.background = theme.backgroundGradient;
    }
}

// 更新粒子颜色
function updateParticleColors() {
    var theme = themes[currentTheme];
    var colorIndex = 0;
    
    for (var i = 0; i < particles_globe.length; i++) {
        var particle = particles_globe[i];
        if (particle.material && particle.material.color) {
            var color = theme.particleColors[colorIndex % theme.particleColors.length];
            particle.material.color.setHex(color);
            colorIndex++;
        }
    }
}

// 创建连线材质
function createConnectionLineMaterial() {
    var theme = themes[currentTheme];
    return new THREE.LineBasicMaterial({
        color: theme.connectionLineColor,
        opacity: theme.connectionLineOpacity,
        transparent: true
    });
}

// 更新粒子连线
function updateParticleConnections() {
    // 移除旧的连线
    for (var i = 0; i < connectionLines.length; i++) {
        scene.remove(connectionLines[i]);
    }
    connectionLines = [];
    
    // 如果没有鼠标位置，不创建连线
    if (mousePosition.x === 0 && mousePosition.y === 0) return;
    
    var theme = themes[currentTheme];
    
    // 找到鼠标附近的粒子
    var nearbyParticles = [];
    var mouseThreshold = 200; // 鼠标影响范围
    
    for (var i = 0; i < particles_globe.length; i++) {
        var particle = particles_globe[i];
        var distance = particle.position.distanceTo(mousePosition);
        
        if (distance < mouseThreshold) {
            nearbyParticles.push(particle);
        }
    }
    
    // 在附近粒子之间创建连线
    for (var i = 0; i < nearbyParticles.length; i++) {
        for (var j = i + 1; j < nearbyParticles.length; j++) {
            var p1 = nearbyParticles[i];
            var p2 = nearbyParticles[j];
            var distance = p1.position.distanceTo(p2.position);
            
            if (distance < connectionThreshold) {
                // 创建连线
                var geometry = new THREE.Geometry();
                geometry.vertices.push(p1.position.clone());
                geometry.vertices.push(p2.position.clone());
                
                var line = new THREE.Line(geometry, connectionLineMaterial);
                scene.add(line);
                connectionLines.push(line);
            }
        }
    }
}

// 创建爆炸效果
function createExplosion(x, y) {
    var theme = themes[currentTheme];
    var explosionCount = 50; // 爆炸粒子数量
    
    // 将屏幕坐标转换为3D空间坐标
    var vector = new THREE.Vector3(
        (x / window.innerWidth) * 2 - 1,
        -(y / window.innerHeight) * 2 + 1,
        0.5
    );
    vector.unproject(camera);
    var dir = vector.sub(camera.position).normalize();
    var distance = -camera.position.z / dir.z;
    var explosionPosition = camera.position.clone().add(dir.multiplyScalar(distance));
    
    // 创建爆炸粒子
    for (var i = 0; i < explosionCount; i++) {
        var material = new THREE.SpriteCanvasMaterial({
            color: theme.explosionColors[Math.floor(Math.random() * theme.explosionColors.length)],
            transparent: true,
            program: function(context) {
                context.beginPath();
                context.arc(0, 0, 0.5, 0, Math.PI * 2, true);
                context.fill();
            }
        });
        
        var particle = new THREE.Sprite(material);
        particle.position.copy(explosionPosition);
        particle.scale.multiplyScalar(2 + Math.random() * 3);
        particle.material.opacity = 1;
        
        // 爆炸速度和方向
        particle.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20
        );
        
        // 生命周期
        particle.life = 1;
        particle.decay = 0.02 + Math.random() * 0.02;
        
        scene.add(particle);
        explosionParticles.push(particle);
    }
    
    explosionActive = true;
}

// 更新爆炸粒子
function updateExplosionParticles() {
    if (!explosionActive || explosionParticles.length === 0) return;
    
    var particlesToRemove = [];
    
    for (var i = 0; i < explosionParticles.length; i++) {
        var particle = explosionParticles[i];
        
        // 更新位置
        particle.position.add(particle.velocity);
        
        // 应用重力
        particle.velocity.y -= 0.5;
        
        // 减小生命周期
        particle.life -= particle.decay;
        particle.material.opacity = particle.life;
        
        // 减小尺寸
        particle.scale.multiplyScalar(0.98);
        
        // 标记需要移除的粒子
        if (particle.life <= 0) {
            particlesToRemove.push(i);
        }
    }
    
    // 移除已消失的粒子
    for (var i = particlesToRemove.length - 1; i >= 0; i--) {
        var index = particlesToRemove[i];
        scene.remove(explosionParticles[index]);
        explosionParticles.splice(index, 1);
    }
    
    if (explosionParticles.length === 0) {
        explosionActive = false;
    }
}

// 更新过渡效果
function updateTransition() {
    if (!isTransitioning) return;
    
    transitionProgress += 0.02;
    
    if (transitionProgress >= 1) {
        isTransitioning = false;
        transitionProgress = 1;
    }
    
    // 这里可以添加更复杂的过渡效果
    // 比如粒子大小变化、透明度变化等
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
    
    // 获取当前主题
    var theme = themes[currentTheme];
    
    // 创建连线材质
    connectionLineMaterial = createConnectionLineMaterial();

    var PI2 = Math.PI * 2;
    for ( var i = 0; i < 500; i ++ ) {
        
        // 从主题中随机选择颜色
        var colorIndex = i % theme.particleColors.length;
        var particleColor = theme.particleColors[colorIndex];

        var material = new THREE.SpriteCanvasMaterial( {

            color: particleColor,
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
        particle.scale.multiplyScalar( theme.particleSize + Math.random()*2 );
        particle.material.opacity = theme.particleOpacity;
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
    
    // 初始化背景
    updateBackgroundGradient();
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
     
     // 获取当前主题
     var theme = themes[currentTheme];

    for ( var i = 0; i < particles_globe.length ; i ++ ) {

        particle = particles_globe[ i++ ];
        temp = ( Math.sin( ( i + count ) * 0.3 ) * 50 ) + ( Math.sin( ( i + count ) * 0.5 ) * 0.50 );

        opacity = (Math.abs(temp) /50) + theme.particleOpacity

        if (opacity > 1)
            opacity = 1;
        particle.material.opacity = opacity;
    }
    
    // 更新粒子连线
    updateParticleConnections();
    
    // 更新爆炸粒子
    updateExplosionParticles();
    
    // 更新过渡效果
    updateTransition();

    renderer.render( scene, camera );

    count += theme.animationSpeed;

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
    
    // 清空粒子数组
    particles_globe = [];
    explosionParticles = [];
    connectionLines = [];
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
        document.addEventListener( 'click', onDocumentClick, false );
    }
    else{
        document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
        document.removeEventListener( 'touchstart', onDocumentTouchStart, false );
        document.removeEventListener( 'touchmove', onDocumentTouchMove, false );
        window.removeEventListener( 'resize', onWindowResize, false );
        document.removeEventListener( 'click', onDocumentClick, false );
    }
}

/* User interaction */
function onDocumentMouseMove( event ) {

    mouseX = event.clientX - windowHalfX;
    /*mouseY = event.clientY - windowHalfY;*/
    mouseY = event.clientY + 150;
    
    // 更新鼠标位置用于粒子连线
    updateMousePosition(event.clientX, event.clientY);
}

// 更新鼠标位置
function updateMousePosition(x, y) {
    // 将屏幕坐标转换为3D空间坐标
    var vector = new THREE.Vector3(
        (x / window.innerWidth) * 2 - 1,
        -(y / window.innerHeight) * 2 + 1,
        0.5
    );
    vector.unproject(camera);
    var dir = vector.sub(camera.position).normalize();
    var distance = -camera.position.z / dir.z;
    mousePosition = camera.position.clone().add(dir.multiplyScalar(distance));
}

/* User interaction */
function onDocumentTouchStart( event ) {

    if ( event.touches.length === 1 ) {
        event.preventDefault();

        mouseX = event.touches[ 0 ].pageX - windowHalfX;
        /*mouseY = event.touches[ 0 ].pageY - windowHalfY;*/
        mouseY = - event.touches[ 0 ].pageY;
        
        // 更新触摸位置
        updateMousePosition(event.touches[0].pageX, event.touches[0].pageY);
        
        // 触摸时也创建爆炸效果
        createExplosion(event.touches[0].pageX, event.touches[0].pageY);
    }
}

/* User interaction */
function onDocumentTouchMove( event ) {

    if ( event.touches.length === 1 ) {
        event.preventDefault();

        mouseX = event.touches[ 0 ].pageX - windowHalfX;
        /* mouseY = event.touches[ 0 ].pageY - windowHalfY;*/
        mouseY = - event.touches[ 0 ].pageY;
        
        // 更新触摸位置
        updateMousePosition(event.touches[0].pageX, event.touches[0].pageY);
    }
}

// 鼠标点击事件处理
function onDocumentClick(event) {
    // 创建爆炸效果
    createExplosion(event.clientX, event.clientY);
}
