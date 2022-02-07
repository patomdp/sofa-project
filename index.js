import { texturesAndColors } from "./constants/constants.js";
import { selectSwatch } from "./utils/materialHelper.js";

const LOADER = document.getElementById("js-loader");

// Create the Scene
const scene = new THREE.Scene();


// Background Color for the Scene
scene.background = new THREE.Color(0xf1f1f1);
scene.fog = new THREE.Fog(0xf1f1f1, 20, 100);

//add the canvas element so that it can hold the objects.
const canvas = document.querySelector("#sofa-canvas");

// Let’s add the camera.
let camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
camera.position.x = 0;

// Three.js provides two types of the camera PerspectiveCamera and OrthographicCamera.
// We are using PerspectiveCamera in our example.

//Having the Scene and the Camera-ready let’s add the renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

//add some controls for our object.
let controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI;
controls.minPolarAngle = 0;
controls.enableDamping = true;
controls.enablePan = false;
controls.dampingFactor = 0.1;
controls.autoRotate = false;
controls.autoRotateSpeed = 0.2;

//If we set autoRotate as true and autoRotateSpeed then our sofa object will rotate automatically.
//To animate our model following methods will help us.

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let canvasPixelWidth = canvas.width / window.devicePixelRatio;
    let canvasPixelHeight = canvas.height / window.devicePixelRatio;
  
    const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }
  
  function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
  }
  
  animate();

  //SOFA AND PILLOW TEXTURES

  const DEFAULT_SOFA_TEXTURE = {
    texture: './textures/denim_.jpg',
    size: [3, 3, 3],
    shininess: 0
    };
    const DEFAULT_PILLOW_TEXTURE = {
    texture: './textures/cloth.jpeg',
    size: [6, 6, 6],
    shininess: 0
    }
    function setInitialSofaMaterial() {
    const sofaMaterial = getTextureMaterial(DEFAULT_SOFA_TEXTURE);
    setMaterial(theModel, sofaMaterial, "sofa");
    const pillowMaterial = getTextureMaterial(DEFAULT_PILLOW_TEXTURE);
    setMaterial(theModel, pillowMaterial, "pillows");
    }

/*
For better segregation let’s create a utils folder. 
Then create materialHelper.js file and add getTextureMaterial and setMaterial methods in it.
*/

/*
Now, we need something that will load our 3D object. GLTFLoader will help us to load the 3D object inside our scene. 
For that, we will need the modal. You can find it here.
*/

let loader = new THREE.GLTFLoader();
let theModel;

loader.load(
  './models/sofa.glb',
  function (gltf) {
    theModel = gltf.scene;

    theModel.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });

    // Set the initial scale of model
    theModel.scale.set(1, 1, 1);
    theModel.rotation.x = Math.PI / 15;

    // Set the position of the model
    theModel.position.x = 3.5;
    theModel.position.y = -1;
    theModel.position.z = 0;

    scene.add(theModel);

    // Setting initial material
    setInitialSofaMaterial();

  },
  undefined,
  // To be used for error handling 
  function (error) {
    console.error(error);
  }
);

/*
So far we have added the object into our scene but you will see it in black color.
 To enlight it we will have to add the lights.

*/

let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
hemiLight.position.set(0, 50, 0);
scene.add(hemiLight);

//To see our object more clearly, we will have to add directional light.
let dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
dirLight.position.set(-8, 12, 8);
dirLight.castShadow = true;
dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
scene.add(dirLight);

//Let’s add the floor with the help of the following code.

let floorGeometry = new THREE.PlaneGeometry(8, 4, 1, 1);

let floorTexture = new THREE.TextureLoader().load("textures/wooden_floor.jpg");
floorTexture.repeat.set(1, 1, 1);
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;

let floorMaterial = new THREE.MeshPhongMaterial({
  side: THREE.DoubleSide,
  map: floorTexture,
});

let floor = new THREE.Mesh(floorGeometry, floorMaterial);

floor.rotation.x = -0.43 * Math.PI;
floor.receiveShadow = true;
floor.position.y = -0.61;
scene.add(floor);

//Let’s add some methods to set up all the colors and textures for our palette.

const TRAY = document.getElementById("js-tray-slide");
let activeOption = "sofa";

function buildColors(colors) {
  for (let [i, color] of colors.entries()) {
    let swatch = document.createElement("div");
    swatch.classList.add("tray__swatch");

    if (color.texture) {
      swatch.style.backgroundImage = "url(" + color.texture + ")";
    } else {
      swatch.style.background = "#" + color.color;
    }

    swatch.setAttribute("data-key", i);
    TRAY.append(swatch);
  }
}

buildColors(texturesAndColors);

//change any color or texture pattern of the sofa
const swatches = document.querySelectorAll(".tray__swatch");

for (const swatch of swatches) {
  swatch.addEventListener("click", (event) =>
    selectSwatch(event, theModel, texturesAndColors, activeOption)
  );
}

//interacting with the pillows with the help of the same color and texture tray

const options = document.querySelectorAll(".option");

for (const option of options) {
  option.addEventListener("click", selectOption);
}

function selectOption(e) {
  let option = e.target;
  activeOption = e.target.dataset.option;
  for (const otherOption of options) {
    otherOption.classList.remove("--is-active");
  }
  option.classList.add("--is-active");
}