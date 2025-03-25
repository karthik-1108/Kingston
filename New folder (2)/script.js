var express =require('express');
var cors = ('cors');
var app =express();

app.use(cors({origin:true, credentials: true}))

import * as THREE from 'three';
import { PointerLockControls } from 'https://cdn.jsdelivr.net/npm/three@0.142/examples/jsm/controls/PointerLockControls.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

// Ground
const groundGeometry = new THREE.PlaneGeometry(50, 50);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Test object to verify rendering
const testCube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
);
testCube.position.set(0, 1, 0);
scene.add(testCube);

// Player controls
const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => controls.lock());
scene.add(controls.getObject());

// Player movement
const moveSpeed = 0.1;
const keys = {};
let playerHealth = 100;
const healthDisplay = document.createElement('div');
healthDisplay.style.position = 'absolute';
healthDisplay.style.top = '10px';
healthDisplay.style.left = '10px';
healthDisplay.style.color = 'white';
healthDisplay.style.fontSize = '20px';
healthDisplay.innerHTML = `Health: ${playerHealth}`;
document.body.appendChild(healthDisplay);

window.addEventListener('keydown', (event) => { keys[event.key] = true; });
window.addEventListener('keyup', (event) => { keys[event.key] = false; });

function movePlayer() {
    if (keys['w']) controls.moveForward(moveSpeed);
    if (keys['s']) controls.moveForward(-moveSpeed);
    if (keys['a']) controls.moveRight(-moveSpeed);
    if (keys['d']) controls.moveRight(moveSpeed);
}

// Shooting mechanics
const bullets = [];
document.addEventListener('mousedown', () => {
    const bullet = new THREE.Mesh(
        new THREE.SphereGeometry(0.1),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    bullet.position.copy(camera.position);
    bullet.velocity = new THREE.Vector3();
    bullet.velocity.copy(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(0.5));
    bullets.push(bullet);
    scene.add(bullet);
});

// Enemy AI
const enemyGeometry = new THREE.BoxGeometry(1, 2, 1);
const enemyMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
enemy.position.set(5, 1, -5);
scene.add(enemy);
let enemyHealth = 50;

function moveEnemy() {
    if (enemyHealth > 0) {
        const direction = new THREE.Vector3();
        direction.subVectors(camera.position, enemy.position).normalize().multiplyScalar(0.02);
        enemy.position.add(direction);
        
        if (enemy.position.distanceTo(camera.position) < 1.5) {
            playerHealth -= 1;
            healthDisplay.innerHTML = `Health: ${playerHealth}`;
            if (playerHealth <= 0) {
                alert('Game Over!');
                window.location.reload();
            }
        }
    }
}

function checkBulletCollision() {
    bullets.forEach((bullet, index) => {
        bullet.position.add(bullet.velocity);
        if (bullet.position.distanceTo(enemy.position) < 1) { 
            enemyHealth -= 10;
            scene.remove(bullet);
            bullets.splice(index, 1);
            if (enemyHealth <= 0) {
                scene.remove(enemy);
            }
        }
        if (bullet.position.distanceTo(camera.position) > 50) {
            scene.remove(bullet);
            bullets.splice(index, 1);
        }
    });
}

// Game loop
function animate() {
    requestAnimationFrame(animate);
    movePlayer();
    moveEnemy();
    checkBulletCollision();
    renderer.render(scene, camera);
}
animate();
