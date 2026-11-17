
import { HighlightLayer } from "@babylonjs/core/Layers/highlightLayer";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Animation } from "@babylonjs/core/Animations/animation";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Mesh } from "@babylonjs/core/Meshes/mesh";

import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { Scene } from "@babylonjs/core/scene";

let highlightLayer: HighlightLayer | null = null;
let selectedMesh: Mesh | null = null;

// 初始化高亮系统
export function initFocusManager(scene: Scene): void {
    highlightLayer = new HighlightLayer("highlightLayer", scene);
}

// 高亮选中的物体
export function focusMesh(
    scene: Scene,
    mesh: AbstractMesh | null
): void {

    if (!highlightLayer) return;

    // 移除上一次选择的高亮
    if (selectedMesh) {
        highlightLayer.removeMesh(selectedMesh);
        selectedMesh = null;
    }

    if (!(mesh instanceof Mesh)) return;

    // 添加蓝色高亮
    selectedMesh = mesh;
    highlightLayer.addMesh(mesh, Color3.Blue());

    // 让相机聚焦到选中的物体
    zoomToMesh(scene, mesh);
}

// 平滑移动相机
function zoomToMesh(scene: Scene, mesh: Mesh): void {

    const camera = scene.activeCamera;

    if (!(camera instanceof ArcRotateCamera)) return;

    const box = mesh.getBoundingInfo().boundingBox;

    const center = box.centerWorld.clone();

    const size = box.maximumWorld
        .subtract(box.minimumWorld)
        .length();

    const targetRadius = Math.max(size * 2, 3);

    // 相机目标点动画
    Animation.CreateAndStartAnimation(
        "targetAnim",
        camera,
        "target",
        60,
        45,
        camera.target.clone(),
        center,
        Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    // 相机缩放动画
    Animation.CreateAndStartAnimation(
        "radiusAnim",
        camera,
        "radius",
        60,
        45,
        camera.radius,
        targetRadius,
        Animation.ANIMATIONLOOPMODE_CONSTANT
    );
}
