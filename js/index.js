const speed = 0.05;
const worldSide = 5;
const worldDepth = worldSide / 5;
const playerSide = 0.5;
const playerHeight = 0.75;
const keyMap = [];

const staticBlocks = [];
const physicBlocks = [];
let shift = false;

// Create map for keys
document.addEventListener("keydown", onDocumentKeyDown, true);
document.addEventListener("keyup", onDocumentKeyUp, true);
function onDocumentKeyDown(event) {
  const keyCode = event.keyCode;
  keyMap[keyCode] = true;
}
function onDocumentKeyUp(event) {
  const keyCode = event.keyCode;
  keyMap[keyCode] = false;
}

// Renderer
const renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x22223c);
renderer.shadowMap.enabled = true;

// Set up scene and camera
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(
  window.innerWidth / 100 / -2,
  window.innerWidth / 100 / 2,
  window.innerHeight / 100 / 2,
  window.innerHeight / 100 / -2,
  0.0000000001,
  100000
);
camera.position.z = worldSide * 1000;
camera.position.y = (3 / 5) * worldSide * 1000;
camera.position.x = (3 / 5) * worldSide * 1000;
camera.lookAt(new THREE.Vector3(0, 0, 0));

// Directional Lighting
const light = new THREE.DirectionalLight(0xdddddd, 1, 100);
light.position.set(
  (4 / 5) * worldSide,
  (9 / 10) * worldSide,
  (3 / 5) * worldSide
);
light.castShadow = true;
scene.add(light);

// Ambient Lighting
const aLight = new THREE.AmbientLight(0x666666);
scene.add(aLight);

// Create World
const worldGeometry = new THREE.BoxGeometry(worldSide, worldDepth, worldSide);
const shiftTextTexture = new THREE.TextureLoader().load(
  "../assets/New Project (3).png"
);
const wasdTextTexture = new THREE.TextureLoader().load(
  "../assets/New Project (2).png"
);
const worldMaterials = [
  new THREE.MeshLambertMaterial({
    map: wasdTextTexture,
  }),
  new THREE.MeshLambertMaterial({
    color: 0xffffff,
  }),
  new THREE.MeshLambertMaterial({
    color: 0xffffff,
  }),
  new THREE.MeshLambertMaterial({
    color: 0xffffff,
  }),
  new THREE.MeshLambertMaterial({
    map: shiftTextTexture,
  }),
  new THREE.MeshLambertMaterial({
    color: 0xffffff,
  }),
];

const worldMaterial = new THREE.MeshLambertMaterial({
  color: 0xffffff,
});
const world = new THREE.Mesh(worldGeometry, worldMaterials);
world.receiveShadow = true;
staticBlocks.push(world);
scene.add(world);
world.position.y = -worldDepth / 2;

// Create the player object
const playerGeometry = new THREE.BoxGeometry(
  playerSide,
  playerHeight,
  playerSide
);
const playerMaterial = new THREE.MeshLambertMaterial({ color: 0xff7777 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.castShadow = true;
scene.add(player);
player.position.y = playerHeight / 2;

player.blocked = {
  zp: null,
  zn: null,
  xp: null,
  xn: null,
  yp: null,
  yn: null,
};
player.vel = 0;

// Create a rock
const rockGeometry = new THREE.BoxGeometry(
  playerSide,
  playerSide * 3,
  playerSide * 2
);
const rockGeometry2 = new THREE.BoxGeometry(
  playerSide,
  playerSide,
  playerSide * 2
);
const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x777777 });
const rock = new THREE.Mesh(rockGeometry, rockMaterial);
const rock2 = new THREE.Mesh(rockGeometry2, rockMaterial);
staticBlocks.push(rock2);
staticBlocks.push(rock);
scene.add(rock2);
scene.add(rock);
rock.receiveShadow = true;
rock.castShadow = true;
rock.position.y = (playerSide * 3) / 2;
rock.position.z = -1;
rock.position.x = -1.5;
rock2.receiveShadow = true;
rock2.castShadow = true;
rock2.position.y = playerSide / 2;
rock2.position.z = -1;
rock2.position.x = -1;

const texture = new THREE.TextureLoader().load("../assets/New Project (1).png");

const blockMaterials = [
  new THREE.MeshLambertMaterial({ color: 0xd2c280 }),
  new THREE.MeshLambertMaterial({ color: 0xd2c280 }),
  new THREE.MeshLambertMaterial({ color: 0xd2c280 }),
  new THREE.MeshLambertMaterial({ color: 0xd2c280 }),
  new THREE.MeshLambertMaterial({ map: texture }),
  new THREE.MeshLambertMaterial({ color: 0xd2c280 }),
];

// Create a falling block
const blockGeometry = new THREE.BoxGeometry(playerSide, playerSide, playerSide);
const blockMaterial = new THREE.MeshLambertMaterial({ color: 0xd2c280 });
const block = new THREE.Mesh(blockGeometry, blockMaterials);
scene.add(block);
block.receiveShadow = true;
block.castShadow = true;
block.position.y = playerSide / 2 + 2;
block.position.x = 1.5;
block.position.z = -1;

block.blocked = {
  zp: null,
  zn: null,
  xp: null,
  xn: null,
  yp: null,
  yn: null,
};
block.vel = 0;

const finishGeometry = new THREE.BoxGeometry(
  playerSide,
  playerSide,
  playerSide
);
const finishMaterial = new THREE.MeshLambertMaterial({ color: 0x2ed2e8 });
const finish = new THREE.Mesh(finishGeometry, finishMaterial);
scene.add(finish);
finish.material.transparent = true;
finish.material.opacity = 0.5;
finish.position.x = -1.5;
finish.position.y = (playerSide * 7) / 2;
finish.position.z = -1.25;

// Detect all keys being pressed
function move() {
  if (
    keyMap[16] &&
    (player.blocked.zp == "block" ||
      player.blocked.xp == "block" ||
      player.blocked.xn == "block" ||
      player.blocked.zn == "block")
  ) {
    console.log("what");
    block.position.y = player.position.y + 0.5;
    block.blocked.yn = true;
    shift = true;
  }

  let keysPressedCount = 0;
  if (keyMap[37] || keyMap[65]) {
    keysPressedCount++;
  }
  if (keyMap[38] || keyMap[87]) {
    keysPressedCount++;
  }
  if (keyMap[39] || keyMap[68]) {
    keysPressedCount++;
  }
  if (keyMap[40] || keyMap[83]) {
    keysPressedCount++;
  }

  directiveSpeed = keysPressedCount == 2 ? Math.sqrt(2) : 1;

  if (keyMap[37] || keyMap[65]) {
    if (!player.blocked.xn) {
      player.position.x -= speed / directiveSpeed;
      camera.position.x -= speed / directiveSpeed;
      if (shift) {
        block.position.x -= speed / directiveSpeed;
      }
    }
    if (player.blocked.xn == "block" && !block.blocked.xn) {
      player.position.x -= speed / directiveSpeed;
      camera.position.x -= speed / directiveSpeed;
      block.position.x -= speed / directiveSpeed;
    }
  }
  if (keyMap[38] || keyMap[87]) {
    if (!player.blocked.zn) {
      player.position.z -= speed / directiveSpeed;
      camera.position.z -= speed / directiveSpeed;
      if (shift) {
        block.position.z -= speed / directiveSpeed;
      }
    }
    if (player.blocked.zn == "block" && !block.blocked.zn) {
      player.position.z -= speed / directiveSpeed;
      camera.position.z -= speed / directiveSpeed;
      block.position.z -= speed / directiveSpeed;
    }
  }
  if (keyMap[39] || keyMap[68]) {
    if (!player.blocked.xp) {
      player.position.x += speed / directiveSpeed;
      camera.position.x += speed / directiveSpeed;
      if (shift) {
        block.position.x += speed / directiveSpeed;
      }
    }
    if (player.blocked.xp == "block" && !block.blocked.xp) {
      player.position.x += speed / directiveSpeed;
      camera.position.x += speed / directiveSpeed;
      block.position.x += speed / directiveSpeed;
    }
  }
  if (keyMap[40] || keyMap[83]) {
    if (!player.blocked.zp) {
      player.position.z += speed / directiveSpeed;
      camera.position.z += speed / directiveSpeed;
      if (shift) {
        block.position.z += speed / directiveSpeed;
      }
    }
    if (player.blocked.zp == "block" && !block.blocked.zp) {
      player.position.z += speed / directiveSpeed;
      camera.position.z += speed / directiveSpeed;
      block.position.z += speed / directiveSpeed;
    }
  }
}

document.addEventListener("keydown", onSpaceDown, true);

function onSpaceDown(event) {
  const keyCode = event.keyCode;
  if (
    keyCode == 32 &&
    player.blocked.yn &&
    !(player.blocked.yp == "block" && block.blocked.yp)
  ) {
    player.position.y += 0.00163;
    camera.position.y += 0.00163;
    player.vel = -0.05;
    if (player.blocked.yp == "block") {
      block.position.y += 0.00163 * 2;
      block.vel = -0.051;
    }
  }
}

function detectCollisions() {
  player.blocked = {
    zp: null,
    zn: null,
    xp: null,
    xn: null,
    yp: null,
    yn: null,
  };

  const sizesB = new THREE.Box3().setFromObject(block);
  const dX = block.position.x - player.position.x;
  const dY = block.position.y - player.position.y;
  const dZ = block.position.z - player.position.z;

  const collisionDistanceX =
    playerSide / 2 + sizesB.max.x - (sizesB.max.x + sizesB.min.x) / 2;
  const collisionDistanceY =
    playerHeight / 2 + sizesB.max.y - (sizesB.max.y + sizesB.min.y) / 2;
  const collisionDistanceZ =
    playerSide / 2 + sizesB.max.z - (sizesB.max.z + sizesB.min.z) / 2;

  const paddingX = Math.abs(dX) - collisionDistanceX;
  const paddingY = Math.abs(dY) - collisionDistanceY;
  const paddingZ = Math.abs(dZ) - collisionDistanceZ;

  if (paddingX <= 0 && paddingY <= 0 && paddingZ <= 0) {
    const AHHHHHHHHHHHHHHX = Math.abs(paddingX);
    const AHHHHHHHHHHHHHHY = Math.abs(paddingY);
    const AHHHHHHHHHHHHHHZ = Math.abs(paddingZ);
    const sigPadding = Math.min(
      AHHHHHHHHHHHHHHX,
      AHHHHHHHHHHHHHHY,
      AHHHHHHHHHHHHHHZ
    );

    if (sigPadding == AHHHHHHHHHHHHHHX) {
      if (dX > 0) {
        player.blocked.xp = "block";
      } else {
        player.blocked.xn = "block";
      }
    } else if (sigPadding == AHHHHHHHHHHHHHHY && !shift) {
      if (dY > 0) {
        player.blocked.yp = "block";
        player.position.y += paddingY / 2;
        camera.position.y += paddingY / 2;
        block.vel = 0;
        block.position.y -= paddingY / 2;
      } else {
        player.blocked.yn = "block";
        player.position.y -= paddingY;
        camera.position.y -= paddingY;
      }
    } else if (sigPadding == AHHHHHHHHHHHHHHZ) {
      if (dZ > 0) {
        player.blocked.zp = "block";
      } else {
        player.blocked.zn = "block";
      }
    }
  }
  staticBlocks.forEach((blockB) => {
    const sizesB = new THREE.Box3().setFromObject(blockB);
    const dX = blockB.position.x - player.position.x;
    const dY = blockB.position.y - player.position.y;
    const dZ = blockB.position.z - player.position.z;

    const collisionDistanceX =
      playerSide / 2 + sizesB.max.x - (sizesB.max.x + sizesB.min.x) / 2;
    const collisionDistanceY =
      playerHeight / 2 + sizesB.max.y - (sizesB.max.y + sizesB.min.y) / 2;
    const collisionDistanceZ =
      playerSide / 2 + sizesB.max.z - (sizesB.max.z + sizesB.min.z) / 2;

    const paddingX = Math.abs(dX) - collisionDistanceX;
    const paddingY = Math.abs(dY) - collisionDistanceY;
    const paddingZ = Math.abs(dZ) - collisionDistanceZ;

    if (paddingX <= 0 && paddingY <= 0 && paddingZ <= 0) {
      const AHHHHHHHHHHHHHHX = Math.abs(paddingX);
      const AHHHHHHHHHHHHHHY = Math.abs(paddingY);
      const AHHHHHHHHHHHHHHZ = Math.abs(paddingZ);
      const sigPadding = Math.min(
        AHHHHHHHHHHHHHHX,
        AHHHHHHHHHHHHHHY,
        AHHHHHHHHHHHHHHZ
      );

      if (sigPadding == AHHHHHHHHHHHHHHX) {
        if (dX > 0) {
          player.blocked.xp = "static";
          player.position.x += paddingX;
          camera.position.x += paddingX;
        } else {
          player.blocked.xn = "static";
          player.position.x -= paddingX;
          camera.position.x -= paddingX;
        }
      } else if (sigPadding == AHHHHHHHHHHHHHHY) {
        if (dY > 0) {
          player.blocked.yp = "static";
          player.position.y += paddingY;
          camera.position.y += paddingY;
        } else {
          player.blocked.yn = "static";
          player.position.y -= paddingY;
          camera.position.y -= paddingY;
        }
      } else if (sigPadding == AHHHHHHHHHHHHHHZ) {
        if (dZ > 0) {
          player.blocked.zp = "static";
          player.position.z += paddingZ;
          camera.position.z += paddingZ;
        } else {
          player.blocked.zn = "static";
          player.position.z -= paddingZ;
          camera.position.z -= paddingZ;
        }
      }
    }
  });

  block.blocked = {
    zp: null,
    zn: null,
    xp: null,
    xn: null,
    yp: null,
    yn: null,
  };
  [...staticBlocks].forEach((blockB) => {
    const sizesA = new THREE.Box3().setFromObject(block);
    const sizesB = new THREE.Box3().setFromObject(blockB);
    const dX = blockB.position.x - block.position.x;
    const dY = blockB.position.y - block.position.y;
    const dZ = blockB.position.z - block.position.z;

    const collisionDistanceX =
      sizesA.max.x -
      (sizesA.max.x + sizesA.min.x) / 2 +
      sizesB.max.x -
      (sizesB.max.x + sizesB.min.x) / 2;
    const collisionDistanceY =
      sizesA.max.y -
      (sizesA.max.y + sizesA.min.y) / 2 +
      sizesB.max.y -
      (sizesB.max.y + sizesB.min.y) / 2;
    const collisionDistanceZ =
      sizesA.max.z -
      (sizesA.max.z + sizesA.min.z) / 2 +
      sizesB.max.z -
      (sizesB.max.z + sizesB.min.z) / 2;

    const paddingX = Math.abs(dX) - collisionDistanceX;
    const paddingY = Math.abs(dY) - collisionDistanceY;
    const paddingZ = Math.abs(dZ) - collisionDistanceZ;

    if (paddingX <= 0 && paddingY <= 0 && paddingZ <= 0) {
      const AHHHHHHHHHHHHHHX = Math.abs(paddingX);
      const AHHHHHHHHHHHHHHY = Math.abs(paddingY);
      const AHHHHHHHHHHHHHHZ = Math.abs(paddingZ);
      const sigPadding = Math.min(
        AHHHHHHHHHHHHHHX,
        AHHHHHHHHHHHHHHY,
        AHHHHHHHHHHHHHHZ
      );

      if (sigPadding == AHHHHHHHHHHHHHHX) {
        if (dX > 0) {
          block.blocked.xp = "static";
          block.position.x += paddingX;
        } else {
          block.blocked.xn = "static";
          block.position.x -= paddingX;
        }
      } else if (sigPadding == AHHHHHHHHHHHHHHY) {
        if (dY > 0) {
          block.blocked.yp = "static";
          block.position.y += paddingY;
        } else {
          block.blocked.yn = "static";
          block.position.y -= paddingY;
        }
      } else if (sigPadding == AHHHHHHHHHHHHHHZ) {
        if (dZ > 0) {
          block.blocked.zp = "static";
          block.position.z += paddingZ;
        } else {
          block.blocked.zn = "static";
          block.position.z -= paddingZ;
        }
      }
    }
  });
}

function gravity() {
  if (player.vel > 0 ? player.blocked.yn : player.blocked.yp) {
    player.vel = 0;
  } else {
    player.position.y -= player.vel;
    camera.position.y -= player.vel;
    player.vel += 0.00163;
  }

  if (block.blocked.yn) {
    block.vel = 0;
  } else {
    block.position.y -= block.vel;
    block.vel += 0.00163;
  }
}

function dead() {
  if (player.position.y < -playerHeight * 30) {
    player.position.x = 0;
    player.position.y = 15;
    player.position.z = 0;
    camera.position.x = (3 / 5) * worldSide * 1000;
    camera.position.y = 15 + (3 / 5) * worldSide * 1000 - playerHeight / 2;
    camera.position.z = worldSide * 1000;
  }
  if (block.position.y < -playerHeight * 30) {
    block.position.x = 0;
    block.position.y = 15;
    block.position.z = 0;
  }
}

function detectWin() {
  const sizesB = new THREE.Box3().setFromObject(finish);
  const dX = finish.position.x - player.position.x;
  const dY = finish.position.y - player.position.y;
  const dZ = finish.position.z - player.position.z;

  const collisionDistanceX =
    playerSide / 2 + sizesB.max.x - (sizesB.max.x + sizesB.min.x) / 2;
  const collisionDistanceY =
    playerHeight / 2 + sizesB.max.y - (sizesB.max.y + sizesB.min.y) / 2;
  const collisionDistanceZ =
    playerSide / 2 + sizesB.max.z - (sizesB.max.z + sizesB.min.z) / 2;

  const paddingX = Math.abs(dX) - collisionDistanceX;
  const paddingY = Math.abs(dY) - collisionDistanceY;
  const paddingZ = Math.abs(dZ) - collisionDistanceZ;

  if (paddingX < 0 && paddingY < 0 && paddingZ < 0) {
    alert("a winner is you");
  }
}

let i = 0;

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  block.vel = shift ? 0 : block.vel;
  shift = false;

  detectCollisions();
  detectWin();
  gravity();
  dead();
  move();
  i += 0.01;
}
animate();
