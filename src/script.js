import GUI from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import firefliesVertexShader from './shaders/fireflies/vertex.glsl'
import firefliesFragmentShader from './shaders/fireflies/fragment.glsl'
import portalVertexShader from './shaders/portal/vertex.glsl'
import portalFragmentShader from './shaders/portal/fragment.glsl'


/**
 * Base
 */
// Debug
const debugObject = {}
const gui = new GUI({
    width: 400
})


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

/* 
 * Textures
 */
const bakedTexture = textureLoader.load('baked-mine.jpg')

bakedTexture.flipY = false // this is needed or else the texture will just look pasted on and it won't work

bakedTexture.colorSpace = THREE.SRGBColorSpace // needed to get the right colors

/**
 * Object
 */

/* 
 * Materials
 */

// Baked Material
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture})

// Polelight material & object
const poleLightMaterial = new THREE.MeshBasicMaterial( { color: 0xffffe5 })

const poleLightGeometry = new THREE.DodecahedronGeometry(0.5, 1)

const poleLight1Mesh = new THREE.Mesh(poleLightGeometry, poleLightMaterial)
poleLight1Mesh.position.set(-0.77, 0.85, 0.32)
poleLight1Mesh.scale.set(0.055, 0.09, 0.055)
scene.add(poleLight1Mesh)

const poleLight2Mesh = new THREE.Mesh(poleLightGeometry, poleLightMaterial)
poleLight2Mesh.position.set(0.945, 0.85, 0.32)
poleLight2Mesh.scale.set(0.055, 0.09, 0.055)
scene.add(poleLight2Mesh)


debugObject.portalColorStart = '#a8c41c'
debugObject.portalColorEnd = '#118d68'

// Portal material & object
const portalMaterial = new THREE.ShaderMaterial ( {
    vertexShader: portalVertexShader,
    fragmentShader: portalFragmentShader,
    uniforms: { 
        uTime: new THREE.Uniform(0),
        uColorStart: new THREE.Uniform(new THREE.Color(debugObject.portalColorStart)),
        uColorEnd: new THREE.Uniform(new THREE.Color(debugObject.portalColorEnd)),
    }
})
gui.addColor(debugObject, 'portalColorStart').onChange(() =>
{
    portalMaterial.uniforms.uColorStart.value.set(debugObject.portalColorStart)
})
gui.addColor(debugObject, 'portalColorEnd').onChange(() =>
{
    portalMaterial.uniforms.uColorEnd.value.set(debugObject.portalColorEnd)
})




const portalGeometry = new THREE.CircleGeometry(1, 10, 0)
const portalMesh = new THREE.Mesh(portalGeometry, portalMaterial)
portalMesh.position.set(0, 0.94, -1.62)
portalMesh.scale.set(0.777, 0.777, 0.777)
scene.add(portalMesh)


/*  
 * Model
 */

gltfLoader.load(
    'portal-starter-compressed.glb',
    (gltf) =>
    {
        gltf.scene.traverse((child) =>
        {
            child.material = bakedMaterial
        })
        scene.add(gltf.scene)
    }
)

/* 
 * Fireflies
 */

// Geometry
const firefliesGeometry = new THREE.BufferGeometry()
const firefliesCount = 30
const positionArray = new Float32Array(firefliesCount * 3)

for(let i = 0; i<firefliesCount; i++)
{
    positionArray[i * 3 + 0] = (Math.random() - 0.5) * 4  // x
    positionArray[i * 3 + 1] =  Math.random() * 1.5       // y
    positionArray[i * 3 + 2] = (Math.random() - 0.5) * 4  // z
}

firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3)) // the attribute HAS to be 'position' for it to work in three.js
const scaleArray = new Float32Array(firefliesCount)

for(let i = 0; i<firefliesCount; i++)
{
    scaleArray[i] = Math.random()
}
firefliesGeometry.setAttribute('aSize', new THREE.Float32BufferAttribute(scaleArray, 1))




// Material
const firefliesMaterial = new THREE.ShaderMaterial({
    blending: THREE.AdditiveBlending, // these two are needed to avoid clipping
    depthWrite: false,

    uniforms:
    {
        uPixelRatio: new THREE.Uniform(Math.min(window.devicePixelRatio, 2)),
        uSize: new THREE.Uniform(200),
        uTime: new THREE.Uniform(0),
    },

    vertexShader: firefliesVertexShader,
    fragmentShader: firefliesFragmentShader,
    transparent: true, //remember this!

})

// Points
const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial)
scene.add(fireflies)

gui.add(firefliesMaterial.uniforms.uSize, 'value').min(0).max(500).step(1).name('fireflie size')


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    // Update fireflies
    firefliesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 2
camera.position.z = 4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

debugObject.clearColor = '#201919'
renderer.setClearColor(debugObject.clearColor)
gui.addColor(debugObject, 'clearColor')
.onChange(() =>
{
    renderer.setClearColor(debugObject.clearColor)
})

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update materials
    firefliesMaterial.uniforms.uTime.value = elapsedTime
    portalMaterial.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()