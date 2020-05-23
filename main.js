//initialize variables 

var scene,
    camera, fieldOfView, aspectRatio, nearPlane, farPlane,
    gobalLight, shadowLight, backLight,
    renderer,
    container,
    controls,
    clock;
var delta = 0;
var moonRadius = 200;
var speed = 6;
var distance = 0;
var level = 1;
var levelInterval;
var levelUpdateFreq = 3000;
var initSpeed = 5;
var maxSpeed = 48;
var gatorPos = .65;
var gatorPosTarget = .65;
var moonRotation = 0;
var collisionObstacle = 10;
var collisionBonus = 20;
var gameStatus = "play";
var cameraPosGame = 140;
var cameraPosGameOver = 260;
var gatorAcceleration = 0.004;
var malusClearColor = 0xab4c3c;
var malusClearAlpha = 0;

var fieldGameOver, fieldDistance;


var HEIGHT, WIDTH, windowHalfX, windowHalfY,
    mousePos = {
        x: 0,
        y: 0
    };

//define object 

var frog;


// define materials
var blackMat = new THREE.MeshPhongMaterial({
    color: 0x0a0a0a,
    shading: THREE.FlatShading,
});

var frogMat = new THREE.MeshPhongMaterial({
    color: 0x3f461a,
    shininess: 0,
    shading: THREE.FlatShading,
});

var greenMat = new THREE.MeshPhongMaterial({
    color: 0x95cca5,
    shininess: 0,
    shading: THREE.FlatShading,
});

var pinkMat = new THREE.MeshPhongMaterial({
    color: 0xe0715a,
    shading: THREE.FlatShading,
});

var lightGreenMat = new THREE.MeshPhongMaterial({
    color: 0x75714e,
    shading: THREE.FlatShading,
});

var whiteMat = new THREE.MeshPhongMaterial({
    color: 0xfcfcfc,
    shading: THREE.FlatShading,
});

var gatorMat = new THREE.MeshPhongMaterial({
    color: 0x2e321a,
    shininess: 0,
    shading: THREE.FlatShading,
});

var starMat = new THREE.MeshPhongMaterial({
    color: 0xebba34,
    shading: THREE.FlatShading
});

//init math

var PI = Math.PI;

//set three.js scene, lighing and events

function initScreenAnd3D() {

    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    windowHalfX = WIDTH / 2;
    windowHalfY = HEIGHT / 2;

    scene = new THREE.Scene();

    scene.fog = new THREE.Fog(0xd4ddda, 160, 350);

    aspectRatio = WIDTH / HEIGHT;
    fieldOfView = 50;
    nearPlane = 1;
    farPlane = 2000;
    camera = new THREE.PerspectiveCamera(
        fieldOfView,
        aspectRatio,
        nearPlane,
        farPlane
    );
    camera.position.x = 0;
    camera.position.z = cameraPosGame;
    camera.position.y = 30;
    camera.lookAt(new THREE.Vector3(0, 30, 0));

    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(malusClearColor, malusClearAlpha);

    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMap.enabled = true;

    container = document.getElementById('moon');
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', handleWindowResize, false);
    document.addEventListener('mousedown', handleMouseDown, false);
    document.addEventListener('touchend', handleMouseDown, false);


    clock = new THREE.Clock();

}

function handleWindowResize() {
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    windowHalfX = WIDTH / 2;
    windowHalfY = HEIGHT / 2;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
}


function handleMouseDown(event) {
    if (gameStatus == "play") frog.jump();
    else if (gameStatus == "readyToReplay") {
        replay();
    }
}

function createLights() {
    globalLight = new THREE.AmbientLight(0xffffff, .9);

    shadowLight = new THREE.DirectionalLight(0xffffff, 1);
    shadowLight.position.set(-30, 40, 20);
    shadowLight.castShadow = true;
    shadowLight.shadow.camera.left = -400;
    shadowLight.shadow.camera.right = 400;
    shadowLight.shadow.camera.top = 400;
    shadowLight.shadow.camera.bottom = -400;
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 2000;
    shadowLight.shadow.mapSize.width = shadowLight.shadow.mapSize.height = 2048;

    scene.add(globalLight);
    scene.add(shadowLight);

}


//creating surface 

function createMoon() {

    moonSurface = new THREE.Mesh(new THREE.SphereGeometry(moonRadius -.1, 50, 50), new THREE.MeshPhongMaterial({
        map: THREE.ImageUtils.loadTexture('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/moon_1024.jpg'),

    })
    );

    moonSurface.receiveShadow = true;
    moon = new THREE.Group();
    moon.position.y = -moonRadius;
    moon.add(moonSurface);
    scene.add(moon);
}


//create frog character

Frog = function () {
    this.status = "running";
    this.runningCycle = 0;
    this.mesh = new THREE.Group();
    this.body = new THREE.Group();
    this.mesh.add(this.body);

    var torsoGeom = new THREE.SphereGeometry(8, 12, 4, 0, 6.3, 0, 2.1); 
    this.torso = new THREE.Mesh(torsoGeom, frogMat);
    this.torso.position.z = -4;
    this.torso.position.y = 7;
    this.torso.castShadow = true;
    this.body.add(this.torso);

    this.torso.rotation.x = -Math.PI / 8;

    var headGeom = new THREE.CubeGeometry(10, 10, 13, 1);

    headGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, 7.5));
    this.head = new THREE.Mesh(headGeom, frogMat);
    this.head.position.z = 2;
    this.head.position.y = 11;
    this.head.castShadow = true;
    this.body.add(this.head);

    var noseGeom = new THREE.CubeGeometry(6, 6, 3, 1);
    this.nose = new THREE.Mesh(noseGeom, lightGreenMat);
    this.nose.position.z = 13.5;
    this.nose.position.y = 2.6;
    this.nose.castShadow = true;
    this.head.add(this.nose);

    var mouthGeom = new THREE.CubeGeometry(4, 2, 4, 1);
    mouthGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, 3));
    mouthGeom.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 12));
    this.mouth = new THREE.Mesh(mouthGeom, frogMat);
    this.mouth.position.z = 8;
    this.mouth.position.y = -4;
    this.mouth.castShadow = true;
    this.head.add(this.mouth);


    var pawFGeom = new THREE.CubeGeometry(3, 10, 3);
    this.pawFR = new THREE.Mesh(pawFGeom, lightGreenMat);
    this.pawFR.position.x = 6;
    this.pawFR.position.z = -6;
    this.pawFR.position.y = .5;
    this.pawFR.castShadow = true;
    this.body.add(this.pawFR);

    this.pawFL = this.pawFR.clone();
    this.pawFL.position.x = - this.pawFR.position.x;
    this.pawFL.castShadow = true;
    this.body.add(this.pawFL);

    var pawBGeom = new THREE.CubeGeometry(3, 10, 3, 1);
    this.pawBL = new THREE.Mesh(pawBGeom, lightGreenMat);
    this.pawBL.position.y = 1.5;
    this.pawBL.position.z = 7;
    this.pawBL.position.x = 8;
    this.pawBL.castShadow = true;
    this.body.add(this.pawBL);

    this.pawBR = this.pawBL.clone();
    this.pawBR.position.x = - this.pawBL.position.x;
    this.pawBR.castShadow = true;
    this.body.add(this.pawBR);

    var eyeGeom = new THREE.SphereGeometry(2, 32, 32);

    this.eyeL = new THREE.Mesh(eyeGeom, whiteMat);
    this.eyeL.position.x = 5;
    this.eyeL.position.z = 11;
    this.eyeL.position.y = 2.9;
    this.eyeL.castShadow = true;
    this.head.add(this.eyeL);

    var irisGeom = new THREE.SphereGeometry(1, 32, 32);

    this.iris = new THREE.Mesh(irisGeom, blackMat);
    this.iris.position.x = 1.2;
    this.iris.position.y = 1;
    this.iris.position.z = 1;
    this.eyeL.add(this.iris);

    this.eyeR = this.eyeL.clone();
    this.eyeR.children[0].position.x = -this.iris.position.x;


    this.eyeR.position.x = -this.eyeL.position.x;
    this.head.add(this.eyeR);

    this.body.traverse(function (object) {
        if (object instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
        }
    });
}

//frog movement

Frog.prototype.run = function () {
    this.status = "running";

    var s = Math.min(speed, maxSpeed);

    this.runningCycle += delta * s * .7;
    this.runningCycle = this.runningCycle % (Math.PI * 2);
    var t = this.runningCycle;

    var amp = 4;
    var disp = .2;

    this.body.position.y = 6 + Math.sin(t - Math.PI / 2) * amp;
    this.body.rotation.x = .2 + Math.sin(t - Math.PI / 2) * amp * .1;

    this.torso.rotation.x = Math.sin(t - Math.PI / 2) * amp * .1;
    this.torso.position.y = 7 + Math.sin(t - Math.PI / 2) * amp * .5;

    this.mouth.rotation.x = Math.PI / 16 + Math.cos(t) * amp * .05;

    this.head.position.z = 2 + Math.sin(t - Math.PI / 2) * amp * .5;
    this.head.position.y = 8 + Math.cos(t - Math.PI / 2) * amp * .7;
    this.head.rotation.x = -.2 + Math.sin(t + Math.PI) * amp * .1;

    this.eyeR.scale.y = this.eyeL.scale.y = .7 + Math.abs(Math.cos(-Math.PI / 4 + t * .5)) * .6;

    this.pawFR.position.y = 1.5 + Math.sin(t) * amp;
    this.pawFR.rotation.x = Math.cos(t) * Math.PI / 4;
    this.pawFR.position.z = 6 - Math.cos(t) * amp * 2;

    this.pawFL.position.y = 1.5 + Math.sin(disp + t) * amp;
    this.pawFL.rotation.x = Math.cos(t) * Math.PI / 4;
    this.pawFL.position.z = 6 - Math.cos(disp + t) * amp * 2;

    this.pawBR.position.y = 1.5 + Math.sin(Math.PI + t) * amp;
    this.pawBR.rotation.x = Math.cos(t + Math.PI * 1.5) * Math.PI / 3;
    this.pawBR.position.z = - Math.cos(Math.PI + t) * amp;

    this.pawBL.position.y = 1.5 + Math.sin(Math.PI + t) * amp;
    this.pawBL.rotation.x = Math.cos(t + Math.PI * 1.5) * Math.PI / 3;
    this.pawBL.position.z = - Math.cos(Math.PI + t) * amp;
}

Frog.prototype.jump = function () {
    if (this.status == "jumping") return;
    this.status = "jumping";
    var _this = this;
    var totalSpeed = 10 / speed;
    var jumpHeight = 45;

    TweenMax.to(this.pawFL.rotation, totalSpeed, { x: "+=.7", ease: Back.easeOut });
    TweenMax.to(this.pawFR.rotation, totalSpeed, { x: "-=.7", ease: Back.easeOut });
    TweenMax.to(this.pawBL.rotation, totalSpeed, { x: "+=.7", ease: Back.easeOut });
    TweenMax.to(this.pawBR.rotation, totalSpeed, { x: "-=.7", ease: Back.easeOut });

    TweenMax.to(this.mouth.rotation, totalSpeed, { x: .5, ease: Back.easeOut });

    TweenMax.to(this.mesh.position, totalSpeed / 2, { y: jumpHeight, ease: Power2.easeOut });
    TweenMax.to(this.mesh.position, totalSpeed / 2, {
        y: 0, ease: Power4.easeIn, delay: totalSpeed / 2, onComplete: function () {
            _this.status = "running";
        }
    });
}

//create alligator character

Gator = function () {

    this.runningCycle = 0;

    this.mesh = new THREE.Group();
    this.body = new THREE.Group();

    var torsoGeom = new THREE.CubeGeometry(8, 10, 30, 1);
    this.torso = new THREE.Mesh(torsoGeom, gatorMat);


    var headGeom = new THREE.BoxGeometry(10, 4, 30, 1);
    headGeom.vertices[1].x -= 1;
    headGeom.vertices[4].x += 7;
    headGeom.vertices[5].x += 1;
    headGeom.vertices[0].x -= 5;
    headGeom.vertices[3].y += 2;
    headGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, 20));
    this.head = new THREE.Mesh(headGeom, gatorMat);
    this.head.position.z = 10;
    this.head.position.y = 5;

    var mouthGeom = new THREE.BoxGeometry(7, 3, 25, 1);
    mouthGeom.vertices[4].x += 4;
    mouthGeom.vertices[5].x += 1;
    mouthGeom.vertices[0].x += 1;
    mouthGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, -2, 10));
    this.mouth = new THREE.Mesh(mouthGeom, gatorMat);
    this.mouth.position.y = -4;
    this.mouth.rotation.x = .4;
    this.mouth.position.z = 4;

    this.frogHolder = new THREE.Group();
    this.frogHolder.position.z = 20;
    this.mouth.add(this.frogHolder);

    var toothGeom = new THREE.CubeGeometry(2, 2, 1, 1);

    toothGeom.vertices[1].x -= 1;
    toothGeom.vertices[4].x += 1;
    toothGeom.vertices[5].x += 1;
    toothGeom.vertices[0].x -= 1;

    for (var i = 0; i < 3; i++) {
        var toothf = new THREE.Mesh(toothGeom, whiteMat);
        toothf.position.x = -2.8 + i * 2.5;
        toothf.position.y = 1;
        toothf.position.z = 19;

        var toothl = new THREE.Mesh(toothGeom, whiteMat);
        toothl.rotation.y = Math.PI / 2;
        toothl.position.z = 12 + i * 2.5;
        toothl.position.y = 1;
        toothl.position.x = 4;

        var toothr = toothl.clone();
        toothl.position.x = -4;

        this.mouth.add(toothf);
        this.mouth.add(toothl);
        this.mouth.add(toothr);

    }


    var tongueGeometry = new THREE.CubeGeometry(6, 1, 14);
    tongueGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, 7));

    this.tongue = new THREE.Mesh(tongueGeometry, pinkMat);
    this.tongue.position.z = 2;
    this.tongue.rotation.x = -.2;
    this.mouth.add(this.tongue);

    this.head.add(this.mouth);

    var eyeGeom = new THREE.SphereGeometry(2, 32, 32);

    this.eyeL = new THREE.Mesh(eyeGeom, whiteMat);
    this.eyeL.position.x = 10;
    this.eyeL.position.z = 20;
    this.eyeL.position.y = 0;
    this.eyeL.castShadow = true;
    this.head.add(this.eyeL);

    var irisGeom = new THREE.SphereGeometry(1, 32, 32);

    this.iris = new THREE.Mesh(irisGeom, blackMat);
    this.iris.position.x = 1.2;
    this.iris.position.y = -1;
    this.iris.position.z = 1;
    this.eyeL.add(this.iris);

    this.eyeR = this.eyeL.clone();
    this.eyeR.children[0].position.x = -this.iris.position.x;
    this.eyeR.position.x = -this.eyeL.position.x;
    this.head.add(this.eyeR);

    var eyeGeom = new THREE.CubeGeometry(2, 4, 4);

    var tailGeom = new THREE.CylinderGeometry(3, 5, 15, 4, 1);
    tailGeom.vertices[8].y += 5;
    tailGeom.vertices[9].y -= 5;
    tailGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 10, 0));
    tailGeom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    tailGeom.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI / 4));

    this.tail = new THREE.Mesh(tailGeom, gatorMat);
    this.tail.position.z = -15;
    this.tail.position.y = 1;
    this.torso.add(this.tail);


    var pawGeom = new THREE.CylinderGeometry(1, 2, 9, 64);
    pawGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, -1, 0));
    this.pawFL = new THREE.Mesh(pawGeom, gatorMat);
    this.pawFL.position.y = -7.5;
    this.pawFL.position.z = 8.5;
    this.pawFL.position.x = 5.5;
    this.torso.add(this.pawFL);

    this.pawFR = this.pawFL.clone();
    this.pawFR.position.x = - this.pawFL.position.x;
    this.torso.add(this.pawFR);

    this.pawBR = this.pawFR.clone();
    this.pawBR.position.z = - this.pawFL.position.z;
    this.torso.add(this.pawBR);

    this.pawBL = this.pawBR.clone();
    this.pawBL.position.x = this.pawFL.position.x;
    this.torso.add(this.pawBL);

    this.mesh.add(this.body);
    this.torso.add(this.head);
    this.body.add(this.torso);

    this.torso.castShadow = true;
    this.head.castShadow = true;
    this.pawFL.castShadow = true;
    this.pawFR.castShadow = true;
    this.pawBL.castShadow = true;
    this.pawBR.castShadow = true;

    this.body.rotation.y = Math.PI / 2;
}

//alligator movement 

Gator.prototype.run = function () {
    var s = Math.min(speed, maxSpeed);
    this.runningCycle += delta * s * .7;
    this.runningCycle = this.runningCycle % (Math.PI * 2);
    var t = this.runningCycle;

    this.pawFR.rotation.x = Math.sin(t) * Math.PI / 4;
    this.pawFR.position.y = -5.5 - Math.sin(t);
    this.pawFR.position.z = 7.5 + Math.cos(t);

    this.pawFL.rotation.x = Math.sin(t + .4) * Math.PI / 4;
    this.pawFL.position.y = -5.5 - Math.sin(t + .4);
    this.pawFL.position.z = 7.5 + Math.cos(t + .4);

    this.pawBL.rotation.x = Math.sin(t + 2) * Math.PI / 4;
    this.pawBL.position.y = -5.5 - Math.sin(t + 3.8);
    this.pawBL.position.z = -7.5 + Math.cos(t + 3.8);

    this.pawBR.rotation.x = Math.sin(t + 2.4) * Math.PI / 4;
    this.pawBR.position.y = -5.5 - Math.sin(t + 3.4);
    this.pawBR.position.z = -7.5 + Math.cos(t + 3.4);

    this.torso.rotation.x = Math.sin(t) * Math.PI / 8;
    this.torso.position.y = 3 - Math.sin(t + Math.PI / 2) * 3;

    this.head.rotation.x = .2 + Math.sin(-t - 1) * .2;
    this.mouth.rotation.x = .3 + Math.sin(t + Math.PI + .3) * .4;

    this.tail.rotation.x = .2 + Math.sin(t - Math.PI / 2);

    this.eyeR.scale.y = .5 + Math.sin(t + Math.PI) * .5;
}

//game over animation-frog

Frog.prototype.nod = function () {
    var _this = this;
    var sp = .5 + Math.random();

    var tHeadRotY = -Math.PI / 6 + Math.random() * Math.PI / 3;
    TweenMax.to(this.head.rotation, sp, { y: tHeadRotY, ease: Power4.easeInOut, onComplete: function () { _this.nod() } });

    var tPawBLRot = Math.random() * Math.PI / 2;
    var tPawBLY = -4 + Math.random() * 8;

    TweenMax.to(this.pawBL.rotation, sp / 2, { x: tPawBLRot, ease: Power1.easeInOut, yoyo: true, repeat: 2 });
    TweenMax.to(this.pawBL.position, sp / 2, { y: tPawBLY, ease: Power1.easeInOut, yoyo: true, repeat: 2 });

    var tPawBRRot = Math.random() * Math.PI / 2;
    var tPawBRY = -4 + Math.random() * 8;
    TweenMax.to(this.pawBR.rotation, sp / 2, { x: tPawBRRot, ease: Power1.easeInOut, yoyo: true, repeat: 2 });
    TweenMax.to(this.pawBR.position, sp / 2, { y: tPawBRY, ease: Power1.easeInOut, yoyo: true, repeat: 2 });

    var tPawFLRot = Math.random() * Math.PI / 2;
    var tPawFLY = -4 + Math.random() * 8;

    TweenMax.to(this.pawFL.rotation, sp / 2, { x: tPawFLRot, ease: Power1.easeInOut, yoyo: true, repeat: 2 });

    TweenMax.to(this.pawFL.position, sp / 2, { y: tPawFLY, ease: Power1.easeInOut, yoyo: true, repeat: 2 });


    var tPawFRRot = Math.random() * Math.PI / 2;
    var tPawFRY = -4 + Math.random() * 8;

    TweenMax.to(this.pawFR.rotation, sp / 2, { x: tPawFRRot, ease: Power1.easeInOut, yoyo: true, repeat: 2 });

    TweenMax.to(this.pawFR.position, sp / 2, { y: tPawFRY, ease: Power1.easeInOut, yoyo: true, repeat: 2 });

    var tMouthRot = Math.random() * Math.PI / 8;
    TweenMax.to(this.mouth.rotation, sp, { x: tMouthRot, ease: Power1.easeInOut });

    var tIrisY = -1 + Math.random() * 2;
    var tIrisZ = -1 + Math.random() * 2;
    var iris1 = this.iris;
    var iris2 = this.eyeR.children[0];
    TweenMax.to([iris1.position, iris2.position], sp, { y: tIrisY, z: tIrisZ, ease: Power1.easeInOut });

    if (Math.random() > .2) TweenMax.to([this.eyeR.scale, this.eyeL.scale], sp / 8, { y: 0, ease: Power1.easeInOut, yoyo: true, repeat: 1 });

}


Frog.prototype.hang = function () {
    var _this = this;
    var sp = 1;
    var ease = Power4.easeOut;

    this.body.rotation.x = 0;
    this.torso.rotation.x = 0;
    this.body.position.y = 0;
    this.torso.position.y = 7;

    TweenMax.to(this.mesh.rotation, sp, { y: 0, ease: ease });
    TweenMax.to(this.mesh.position, sp, { y: -7, z: 6, ease: ease });
    TweenMax.to(this.head.rotation, sp, { x: Math.PI / 10, ease: ease, onComplete: function () { _this.nod(); } });

    TweenMax.to(this.pawFL.position, sp, { y: -1, z: 3, ease: ease });
    TweenMax.to(this.pawFR.position, sp, { y: -1, z: 3, ease: ease });
    TweenMax.to(this.pawBL.position, sp, { y: -2, z: -3, ease: ease });
    TweenMax.to(this.pawBR.position, sp, { y: -2, z: -3, ease: ease });

    TweenMax.to(this.eyeL.scale, sp, { y: 1, ease: ease });
    TweenMax.to(this.eyeR.scale, sp, { y: 1, ease: ease });
}

//game over animation-alligator

Gator.prototype.nod = function () {
    var _this = this;
    var sp = 1 + Math.random() * 2;

    var tHeadRotY = -Math.PI / 3 + Math.random() * .5;
    var tHeadRotX = Math.PI / 3 - .2 + Math.random() * .4;
    TweenMax.to(this.head.rotation, sp, { x: tHeadRotX, y: tHeadRotY, ease: Power4.easeInOut, onComplete: function () { _this.nod() } });

    var tTailRotY = -Math.PI / 4;
    TweenMax.to(this.tail.rotation, sp / 8, { y: tTailRotY, ease: Power1.easeInOut, yoyo: true, repeat: 8 });

    TweenMax.to([this.eyeR.scale, this.eyeL.scale], sp / 20, { y: 0, ease: Power1.easeInOut, yoyo: true, repeat: 1 });
}

Gator.prototype.sit = function () {
    var sp = 1.2;
    var ease = Power4.easeOut;
    var _this = this;
    TweenMax.to(this.torso.rotation, sp, { x: -1.3, ease: ease });
    TweenMax.to(this.torso.position, sp, {
        y: 5, ease: ease, onComplete: function () {
            _this.nod();
            gameStatus = "readyToReplay";
        }
    });

    TweenMax.to(this.head.rotation, sp, { x: Math.PI / 3, y: -Math.PI / 3, ease: ease });
    TweenMax.to(this.tail.rotation, sp, { x: 1, y: Math.PI / 4, ease: ease });
    TweenMax.to(this.pawBL.rotation, sp, { x: -.1, ease: ease });
    TweenMax.to(this.pawBR.rotation, sp, { x: -.1, ease: ease });
    TweenMax.to(this.pawFL.rotation, sp, { x: 1, ease: ease });
    TweenMax.to(this.pawFR.rotation, sp, { x: 1, ease: ease });
    TweenMax.to(this.mouth.rotation, sp, { x: .3, ease: ease });
    TweenMax.to(this.eyeL.scale, sp, { y: 1, ease: ease });
    TweenMax.to(this.eyeR.scale, sp, { y: 1, ease: ease });

}


//create stars

Stars = function () {
    this.angle = 0;
    this.mesh = new THREE.Group();

    var bodyGeom = new THREE.SphereGeometry(5, 3, 4, 0, 6.3, 0, 6.3);

    this.body = new THREE.Mesh(bodyGeom, starMat);

    this.mesh.add(this.body);

    this.body.traverse(function (object) {
        if (object instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
        }
    });
}

Moonrock = function () {
    this.angle = 0;
    this.status = "ready";
    this.mesh = new THREE.Group();
    var bodyGeom = new THREE.SphereGeometry(6, 6, 6, 1);
    this.body = new THREE.Mesh(bodyGeom, whiteMat);

    var headGeom = new THREE.CubeGeometry(5, 5, 7, 1);
    this.head = new THREE.Mesh(headGeom, lightGreenMat);
    this.head.position.z = 6;
    this.head.position.y = -.5;

   this.mesh.add(this.body);

    this.mesh.traverse(function (object) {
        if (object instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
        }
    });
}

Moonrock.prototype.nod = function () {
    var _this = this;
    var speed = .1 + Math.random() * .5;
    var angle = -Math.PI / 4 + Math.random() * Math.PI / 2;
    TweenMax.to(this.head.rotation, speed, {
        y: angle, onComplete: function () {
            _this.nod();
        }
    });
}

BonusParticles = function () {
    this.mesh = new THREE.Group();
    var bigGeom = new THREE.SphereGeometry(5, 6, 4, 0, 6.3, 0, 6.3);
    var smallGeom = new THREE.SphereGeometry(3, 6, 4, 0, 6.3, 0, 6.3);
    this.parts = [];
    for (var i = 0; i < 10; i++) {
        var partYellow = new THREE.Mesh(bigGeom, starMat);
        var partGreen = new THREE.Mesh(smallGeom, greenMat);
        partGreen.scale.set(.5, .5, .5);
        this.parts.push(partYellow);
        this.parts.push(partGreen);
        this.mesh.add(partYellow);
        this.mesh.add(partGreen);
    }
}

BonusParticles.prototype.explose = function () {
    var _this = this;
    var explosionSpeed = .5;
    for (var i = 0; i < this.parts.length; i++) {
        var tx = -50 + Math.random() * 100;
        var ty = -50 + Math.random() * 100;
        var tz = -50 + Math.random() * 100;
        var p = this.parts[i];
        p.position.set(0, 0, 0);
        p.scale.set(1, 1, 1);
        p.visible = true;
        var s = explosionSpeed + Math.random() * .5;
        TweenMax.to(p.position, s, { x: tx, y: ty, z: tz, ease: Power4.easeOut });
        TweenMax.to(p.scale, s, { x: .01, y: .01, z: .01, ease: Power4.easeOut, onComplete: removeParticle, onCompleteParams: [p] });
    }
}

function removeParticle(p) {
    p.visible = false;
}

function createFrog() {
    frog = new Frog();
    frog.mesh.rotation.y = Math.PI / 2;
    scene.add(frog.mesh);
    frog.nod();
}

function createGator() {

    gator = new Gator();
    gator.mesh.position.z = 20;
    scene.add(gator.mesh);
    updateGatorPosition();

}

function updateGatorPosition() {
    gator.run();
    gatorPosTarget -= delta * gatorAcceleration;
    gatorPos += (gatorPosTarget - gatorPos) * delta;
    if (gatorPos < .56) {
        gameOver();
    }

    var angle = Math.PI * gatorPos;
    gator.mesh.position.y = - moonRadius + Math.sin(angle) * (moonRadius + 12);
    gator.mesh.position.x = Math.cos(angle) * (moonRadius + 15);
    gator.mesh.rotation.z = -Math.PI / 2 + angle;
}

function gameOver() {
    fieldGameOver.className = "show";
    gameStatus = "gameOver";
    gator.sit();
    frog.hang();
    gator.frogHolder.add(frog.mesh);
    TweenMax.to(this, 1, { speed: 0 });
    TweenMax.to(camera.position, 3, { z: cameraPosGameOver, y: 60, x: -30 });
    stars.mesh.visible = false;
    obstacle.mesh.visible = false;
    clearInterval(levelInterval);
}

function replay() {

    gameStatus = "preparingToReplay"

    fieldGameOver.className = "";

    TweenMax.killTweensOf(gator.pawFL.position);
    TweenMax.killTweensOf(gator.pawFR.position);
    TweenMax.killTweensOf(gator.pawBL.position);
    TweenMax.killTweensOf(gator.pawBR.position);

    TweenMax.killTweensOf(gator.pawFL.rotation);
    TweenMax.killTweensOf(gator.pawFR.rotation);
    TweenMax.killTweensOf(gator.pawBL.rotation);
    TweenMax.killTweensOf(gator.pawBR.rotation);

    TweenMax.killTweensOf(gator.tail.rotation);
    TweenMax.killTweensOf(gator.head.rotation);
    TweenMax.killTweensOf(gator.eyeL.scale);
    TweenMax.killTweensOf(gator.eyeR.scale);


    gator.tail.rotation.y = 0;

    TweenMax.to(camera.position, 3, { z: cameraPosGame, x: 0, y: 30, ease: Power4.easeInOut });
    TweenMax.to(gator.torso.rotation, 2, { x: 0, ease: Power4.easeInOut });
    TweenMax.to(gator.torso.position, 2, { y: 0, ease: Power4.easeInOut });
    TweenMax.to(gator.pawFL.rotation, 2, { x: 0, ease: Power4.easeInOut });
    TweenMax.to(gator.pawFR.rotation, 2, { x: 0, ease: Power4.easeInOut });
    TweenMax.to(gator.mouth.rotation, 2, { x: .5, ease: Power4.easeInOut });


    TweenMax.to(gator.head.rotation, 2, { y: 0, x: -.3, ease: Power4.easeInOut });

    TweenMax.to(frog.mesh.position, 2, { x: 20, ease: Power4.easeInOut });
    TweenMax.to(frog.head.rotation, 2, { x: 0, y: 0, ease: Power4.easeInOut });
    TweenMax.to(gator.mouth.rotation, 2, { x: .2, ease: Power4.easeInOut });
    TweenMax.to(gator.mouth.rotation, 1, {
        x: .4, ease: Power4.easeIn, delay: 1, onComplete: function () {

            resetGame();
        }
    });

}

//moon mountains

Moonmtn = function () {
    var height = 10;
    var truncGeom = new THREE.CylinderGeometry(2, 21, height, 6, 1);
    truncGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, height / 3, 0));
    this.mesh = new THREE.Mesh(truncGeom, greenMat);
    this.mesh.castShadow = true;
}

var moonmtns = new THREE.Group();

function createMoonmtns() {

    var nMtns = 20;
    for (var i = 0; i < nMtns; i++) {
        var phi = i * (Math.PI * 2) / nMtns;
        var theta = Math.PI / 2;
        //theta += .25 + Math.random()*.3; 
        theta += (Math.random() > .05) ? .25 + Math.random() * .3 : - .35 - Math.random() * .1;

        var moonmtn = new Mtn();
        moonmtn.mesh.position.x = Math.sin(theta) * Math.cos(phi) * moonRadius;
        moonmtn.mesh.position.y = Math.sin(theta) * Math.sin(phi) * (moonRadius - 10);
        moonmtn.mesh.position.z = Math.cos(theta) * moonRadius;

        var vec = moonmtn.mesh.position.clone();
        var axis = new THREE.Vector3(0, 1, 0);
        moonmtn.mesh.quaternion.setFromUnitVectors(axis, vec.clone().normalize());
        moon.add(moonmtn.mesh);
    }
}

Mtn = function () {
    this.mesh = new THREE.Object3D();
    this.trunc = new Trunc();
    this.mesh.add(this.trunc.mesh);
}

Trunc = function () {
    var truncHeight = 10 + Math.random() * 100;
    var topRadius = 15 + Math.random() * 5;
    var bottomRadius = 25 + Math.random() * 5;
    var mats = [blackMat, frogMat, pinkMat, whiteMat, greenMat, lightGreenMat, pinkMat];
    var matTrunc = blackMat;
    var nhSegments = 3;
    var nvSegments = 3;
    var geom = new THREE.CylinderGeometry(topRadius, bottomRadius, truncHeight, nhSegments, nvSegments);
    geom.applyMatrix(new THREE.Matrix4().makeTranslation(0, truncHeight / 2, 0));

    this.mesh = new THREE.Mesh(geom, matTrunc);

    for (var i = 0; i < geom.vertices.length; i++) {
        var noise = Math.random();
        var v = geom.vertices[i];
        v.x += -noise + Math.random() * noise * 2;
        v.y += -noise + Math.random() * noise * 2;
        v.z += -noise + Math.random() * noise * 2;

        geom.computeVertexNormals();

        if (Math.random() > .7) {
            var size = Math.random() * 3;
            var fruitGeometry = new THREE.CubeGeometry(size, size, size, 1);
            var matFruit = mats[Math.floor(Math.random() * mats.length)];
            var fruit = new THREE.Mesh(fruitGeometry, matFruit);
            fruit.position.x = v.x;
            fruit.position.y = v.y + 3;
            fruit.position.z = v.z;
            fruit.rotation.x = Math.random() * Math.PI;
            fruit.rotation.y = Math.random() * Math.PI;

            this.mesh.add(fruit);
        }
    }

    this.mesh.castShadow = true;
}



function createStars() {
    stars = new Stars();
    scene.add(stars.mesh);
}

function updateStarsPosition() {
    stars.mesh.rotation.y += delta * 6;
    stars.mesh.rotation.z = Math.PI / 2 - (moonRotation + stars.angle);
    stars.mesh.position.y = -moonRadius + Math.sin(moonRotation + stars.angle) * (moonRadius + 50);
    stars.mesh.position.x = Math.cos(moonRotation + stars.angle) * (moonRadius + 50);

}

function updateObstaclePosition() {
    if (obstacle.status == "flying") return;

    if (moonRotation + obstacle.angle > 2.5) {
        obstacle.angle = -moonRotation + Math.random() * .3;
        obstacle.body.rotation.y = Math.random() * Math.PI * 2;
    }

    obstacle.mesh.rotation.z = moonRotation + obstacle.angle - Math.PI / 2;
    obstacle.mesh.position.y = -moonRadius + Math.sin(moonRotation + obstacle.angle) * (moonRadius + 3);
    obstacle.mesh.position.x = Math.cos(moonRotation + obstacle.angle) * (moonRadius + 3);
}

function updateMoonRotation() {
    moonRotation += delta * .03 * speed;
    moonRotation = moonRotation % (Math.PI * 2);
    moon.rotation.z = moonRotation;
}

function createObstacle() {
    obstacle = new Moonrock();
    obstacle.body.rotation.y = -Math.PI / 2;
    obstacle.mesh.scale.set(1.1, 1.1, 1.1);
    obstacle.mesh.position.y = moonRadius + 4;
    obstacle.nod();
    scene.add(obstacle.mesh);
}

function createBonusParticles() {
    bonusParticles = new BonusParticles();
    bonusParticles.mesh.visible = false;
    scene.add(bonusParticles.mesh);
}

function checkCollision() {
    var db = frog.mesh.position.clone().sub(stars.mesh.position.clone());
    var dm = frog.mesh.position.clone().sub(obstacle.mesh.position.clone());

    if (db.length() < collisionBonus) {
        getBonus();
    }

    if (dm.length() < collisionObstacle && obstacle.status != "flying") {
        getMalus();
    }
}

function getBonus() {
    bonusParticles.mesh.position.copy(stars.mesh.position);
    bonusParticles.mesh.visible = true;
    bonusParticles.explose();
    stars.angle += Math.PI / 2;
    gatorPosTarget += .025;
}

function getMalus() {
    obstacle.status = "flying";
    var tx = (Math.random() > .5) ? -20 - Math.random() * 10 : 20 + Math.random() * 5;
    TweenMax.to(obstacle.mesh.position, 4, { x: tx, y: Math.random() * 50, z: 350, ease: Power4.easeOut });
    TweenMax.to(obstacle.mesh.rotation, 4, {
        x: Math.PI * 3, z: Math.PI * 3, y: Math.PI * 6, ease: Power4.easeOut, onComplete: function () {
            obstacle.status = "ready";
            obstacle.body.rotation.y = Math.random() * Math.PI * 2;
            obstacle.angle = -moonRotation - Math.random() * .4;

            obstacle.angle = obstacle.angle % (Math.PI * 2);
            obstacle.mesh.rotation.x = 0;
            obstacle.mesh.rotation.y = 0;
            obstacle.mesh.rotation.z = 0;
            obstacle.mesh.position.z = 0;
        }
    });
    
    gatorPosTarget -= .04;
    TweenMax.from(this, .5, {
        malusClearAlpha: .5, onUpdate: function () {
            renderer.setClearColor(malusClearColor, malusClearAlpha);
        }
    })
}

function updateDistance() {
    distance += delta * speed;
    var d = distance / 2;
    fieldDistance.innerHTML = Math.floor(d);
}

function updateLevel() {
    if (speed >= maxSpeed) return;
    level++;
    speed += 1;
}

function loop() {
    delta = clock.getDelta();
    updateMoonRotation();

    if (gameStatus == "play") {

        if (frog.status == "running") {
            frog.run();
        }
        updateDistance();
        updateGatorPosition();
        updateStarsPosition();
        updateObstaclePosition();
        checkCollision();
    }

    render();
    requestAnimationFrame(loop);
}

function render() {
    renderer.render(scene, camera);
}

window.addEventListener('load', init, false);

function init(event) {
    initScreenAnd3D();
    createLights();
    createMoon()
    createFrog();
    createGator();
    createMoonmtns();
    createStars();
    createBonusParticles();
    createObstacle();
    initUI();
    resetGame();
    loop();
}

function resetGame() {
    scene.add(frog.mesh);
    frog.mesh.rotation.y = Math.PI / 2;
    frog.mesh.position.y = 0;
    frog.mesh.position.z = 0;
    frog.mesh.position.x = 0;

    gatorPos = .56;
    gatorPosTarget = .65;
    speed = initSpeed;
    level = 0;
    distance = 0;
    stars.mesh.visible = true;
    obstacle.mesh.visible = true;
    gameStatus = "play";
    frog.status = "running";
    frog.nod();
    updateLevel();
    levelInterval = setInterval(updateLevel, levelUpdateFreq);
}

function initUI() {
    fieldDistance = document.getElementById("distValue");
    fieldGameOver = document.getElementById("gameoverInstructions");

}
