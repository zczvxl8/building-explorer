import { PointerEventTypes } from "@babylonjs/core/Events/pointerEvents";
import type { Scene } from "@babylonjs/core/scene";
import type { PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";

type PickCallback = (result: PickingInfo | null) => void;

export function enableRaycasting(
    scene: Scene,
    callback: PickCallback = defaultCallback
): void {
    scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.type !== PointerEventTypes.POINTERPICK) {
            return;
        }

        const pickResult = pointerInfo.pickInfo;

        if (!pickResult?.hit || !pickResult.pickedMesh) {
            console.log("Nothing clicked");
            callback(null);
            return;
        }

        callback(pickResult);
    });
}

function defaultCallback(pickResult: PickingInfo | null): void {
    const mesh = pickResult?.pickedMesh;

    if (!mesh) return;

    console.log("Clicked:", {
        object: mesh,
        name: mesh.name,
        id: mesh.id,
        position: mesh.position
    });
}