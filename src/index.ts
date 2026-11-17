import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { AppendSceneAsync } from "@babylonjs/core/Loading/sceneLoader";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { enableRaycasting } from "./utils/raycasManager";
import "./style.css";

import { initFocusManager, focusMesh } from "./utils/focusManager";

import type { PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";
import { registerSW } from "virtual:pwa-register";
registerSW({
    immediate: true
});
// Side-effect imports: these register plugins and augment prototypes at load time
import "@babylonjs/core/Loading/loadingScreen";
import "@babylonjs/core/Helpers/sceneHelpers";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Materials/PBR/pbrMaterial";
import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Culling/ray";

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const engine = new Engine(canvas, true);

function updateInfoPanel(pickResult: PickingInfo | null): void {

    const mesh = pickResult?.pickedMesh;

    const roomNameElement = document.getElementById("room-name");
    const roomTypeElement = document.getElementById("room-type");

    if (!roomNameElement || !roomTypeElement) return;

    if (!mesh) {
        roomNameElement.textContent = "Select a room";
        roomTypeElement.textContent = "-";
        return;
    }

    const extras = mesh.metadata?.gltf?.extras ?? {};

    roomNameElement.textContent =
        String(extras.roomName ?? mesh.name);

    roomTypeElement.textContent =
        String(extras.roomType ?? "Unknown");
}


    const createScene = async () => {
        const scene = new Scene(engine);

        try {
            // Load a glTF model
            await AppendSceneAsync(
                `${import.meta.env.BASE_URL}officeDRACO.glb`,
                scene
            );

            // Create a default camera, and event caught by the controls will call preventdefault(),
            // such as wheel event
            scene.createDefaultCamera(true, true, true);
            // Rotate the camera to face the front of the model
            (scene.activeCamera as ArcRotateCamera).alpha += Math.PI;
        } catch {
            // Fallback: when loading fails
            // Create a default box mesh
            CreateBox("box", {}, scene);

            scene.createDefaultCamera(true, true, true);
            const camera = scene.activeCamera as ArcRotateCamera;
            camera.setPosition(new Vector3(3, 3, 3));
            camera.setTarget(new Vector3(0, 0, 0));

            // Create a default light for the scene
            scene.createDefaultLight(true);
        }

        // Create a default environment (skybox + ground + environment lighting)
        scene.createDefaultEnvironment({
            createGround: true,
            createSkybox: true,
            enableGroundMirror: true,
            groundColor: new Color3(15 / 255, 23 / 255, 42 / 255),
            skyboxColor: new Color3(65 / 255, 105 / 255, 180 / 255),
        });

        return scene;
    };


createScene().then((scene) => {

    initFocusManager(scene);

    enableRaycasting(scene, (pickResult) => {

        const mesh = pickResult?.pickedMesh ?? null;

        console.log("PICKED MESH:", mesh?.name);
        console.log("METADATA:", mesh?.metadata);
        console.log("EXTRAS:", mesh?.metadata?.gltf?.extras);

        updateInfoPanel(pickResult);

        focusMesh(scene, mesh);
    });

    engine.runRenderLoop(() => {
        scene.render();
    });

});


window.addEventListener("resize", () => {
    engine.resize();
});
