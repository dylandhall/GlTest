
/// <reference path="../Babylon.js-master/dist/babylon.2.4.d.ts" />
/// <reference path="../Babylon.js-master/materialslibrary/dist/dts/babylon.watermaterial.d.ts" />

"use strict";
//class ActiveSphere {
//    fireSphere: any;
//    scored: boolean;
//    launchTime: number;
//}

var fire = false, moveCamera = false;
var spherePhysicsOptions = { mass: 0, restitution: 0.9, friction: 0.0 };

var toRadians = angle => angle * (Math.PI / 180);
var subOffset = new BABYLON.Vector3(60, -6, 200);
var camLocations = [new BABYLON.Vector3(0, 200, -100), new BABYLON.Vector3(0, 15, -50)];
var camViews = [new BABYLON.Vector3(0, 0, 100), subOffset];



var camLocation = 0;

window.addEventListener("DOMContentLoaded", () => {
    var canvas = <HTMLCanvasElement>document.getElementById("renderCanvas");
    var engine = new BABYLON.Engine(canvas, true);

    document.getElementById("metersOut").innerHTML = subOffset.z.toString();
    document.getElementById("metersStarboard").innerHTML = subOffset.x.toString();

    engine.setSize(600, 600);
    var createScene = () => {
        // create a basic BJS Scene object
        var scene = new BABYLON.Scene(engine);

        // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
        var camera = new BABYLON.FreeCamera("camera1",camLocations[camLocation], scene);

        // target the camera to scene origin
        camera.lockedTarget = camViews[camLocation];

        // attach the camera to the canvas
        camera.attachControl(canvas, false);

        // create a basic light, aiming 0,1,0 - meaning, to the sky
        var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(10, 6, 0), scene);

        // create a built-in "sphere" shape; its constructor takes 5 params: name, width, depth, subdivisions, scene
        
        // create a built-in "ground" shape; its constructor takes the same 5 params as the sphere's one

        var ground = BABYLON.Mesh.CreateGround("ground1", 1024, 1024, 2, scene);
        // Ground
        var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("assets/ground.jpg", scene);
        //ground.renderingGroupId = 1;
        ground.position.y = -20;
        ground.material = groundMaterial;

        // Sphere5 material
        var material = new BABYLON.StandardMaterial("kosh5", scene);
        material.diffuseColor = new BABYLON.Color3(0, 0, 0);
        material.reflectionTexture = new BABYLON.CubeTexture("assets/skybox/TropicalSunnyDay", scene);
        material.reflectionTexture.level = 0.5;
        material.specularPower = 64;
        material.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2); 


        // Explosion material -just grey plus new one so we can fuck with the opacity
        var explosionMaterial = new BABYLON.StandardMaterial("kosh6", scene);
        
        // Fresnel
        material.emissiveFresnelParameters = new BABYLON.FresnelParameters();
        material.emissiveFresnelParameters.bias = 0.4;
        material.emissiveFresnelParameters.power = 2;
        material.emissiveFresnelParameters.leftColor = BABYLON.Color3.Black();
        material.emissiveFresnelParameters.rightColor = BABYLON.Color3.White();

        // end scene loop function

        // Skybox
        var skybox = BABYLON.Mesh.CreateBox("skyBox", 1024.0, scene);
        skybox.infiniteDistance = true;
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/skybox/TropicalSunnyDay", scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;

        //skybox.renderingGroupId = 0;

        // Water		
        var waterMesh = BABYLON.Mesh.CreateGround("waterMesh", 1024, 1024, 32, scene, false);
        var water = new BABYLON.WaterMaterial("water", scene);
        water.alpha = 0.78;
        water.backFaceCulling = false;
        water.bumpTexture = new BABYLON.Texture("assets/waterbump.png", scene);
        water.windForce = -10;
        water.waveHeight = 0.2;
        water.addToRenderList(skybox);
        water.addToRenderList(ground);
        

        waterMesh.material = water;
        //var fireSpheres: ActiveSphere[] = [];

        var loader = new BABYLON.AssetsManager(scene);
        var sub = loader.addMeshTask("submarine", "", "/assets/", "Shuka-B.obj");
        var sub2 = loader.addMeshTask("submarine", "", "/assets/", "Shuka-B.obj");
        
        var subMeshes;
        sub.onSuccess = (t: BABYLON.MeshAssetTask) => {

            subMeshes = t.loadedMeshes;
            t.loadedMeshes.every((m) => {
                m.scaling.x += 20;
                m.scaling.y += 20;
                m.scaling.z += 20;
                m.position = subOffset;
                m.rotation.y += 5;
                //m.renderingGroupId = 1;
                water.addToRenderList(m);
                m.material = material;
                return true;
            });

        };

        sub2.onSuccess = (t: BABYLON.MeshAssetTask) => {
            var home = new BABYLON.Vector3(0, -5, 0);
            t.loadedMeshes.every((m) => {
                m.scaling.x += 20;
                m.scaling.y += 20;
                m.scaling.z += 20;
                m.position = new BABYLON.Vector3(home.x-5,home.y,home.z);
                m.rotation.y = + toRadians(90);
                //m.renderingGroupId = 1;
                water.addToRenderList(m);
                m.material = material;
                return true;
            });
        };


        var moveCamera = () => {
            var position = new BABYLON.Animation("camPos", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            var lockedTarget = new BABYLON.Animation("camView", "lockedTarget", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            camLocation = camLocation === 0 ? 1 : 0;
            var keys1 = [{ frame: 0, value: camera.position }, { frame: 20, value: camLocations[camLocation] }];
            var keys2 = [{ frame: 0, value: camera.lockedTarget }, { frame: 20, value: camViews[camLocation] }];
            position.setKeys(keys1);
            lockedTarget.setKeys(keys2);
            camera.animations.push(position);
            camera.animations.push(lockedTarget);
            scene.beginAnimation(camera, 0, 50, false, 1);
        }

        /*
         * before render, actions occur here
         */

        scene.registerBeforeRender(() => {

            if (fire) {
                //fire a torpedo
                fire = false;
                (<HTMLButtonElement>document.getElementById("fire")).disabled = true;

                var angle = parseFloat((<HTMLInputElement>document.getElementById("angle")).value);
                var distance = parseFloat((<HTMLInputElement>document.getElementById("force")).value);
                
                var adj = Math.cos(toRadians((360-angle)+180)) * distance;
                var opp = Math.sin(toRadians((360-angle)+180)) * distance;

                var fireTo = new BABYLON.Vector3(opp, -3, -adj);

                camViews[1] = fireTo;
                moveCamera();

                var hit = Math.pow(subOffset.x - fireTo.x, 2) < 4 && Math.pow(subOffset.z - fireTo.z, 2) < 4;

                var frames = 60 * (distance / 50);

                var torpedo = BABYLON.Mesh.CreateSphere("sphere" + new Date().toISOString(), 16, 4, scene);
                torpedo.material = material;

                var fireAnimation = new BABYLON.Animation("fireAnimation", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, false);
                var fireAnimationKeys = [{ frame: 0, value: <BABYLON.Vector3>{ x: 0, y: 0, z: 0 } }, { frame: frames, value: fireTo }];

                water.addToRenderList(torpedo);
                fireAnimation.setKeys(fireAnimationKeys);
                //fireAnimation.addEvent(new BABYLON.AnimationEvent(frames, () => { torpedo = null; }, true));
                torpedo.animations.push(fireAnimation);

                torpedo.position = <BABYLON.Vector3>{ x: 0, y: 0, z: 0 };
                scene.beginAnimation(torpedo, 0, frames, false, 1, () => {
                    scene.removeMesh(torpedo);
                    var explosion = BABYLON.Mesh.CreateSphere("explosion" + new Date().toISOString(), 16, 0.1, scene);
                    explosionMaterial.alpha = 1;
                    explosion.material = explosionMaterial;
                    explosion.position = new BABYLON.Vector3(fireTo.x, fireTo.y + 4, fireTo.z);

                    water.addToRenderList(explosion);
                    var explosionAnimationSize = new BABYLON.Animation("explosionAnimation", "scaling", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, false);
                    var explosionAnimationOpacity = new BABYLON.Animation("explosionOpactiyAnimation", "material.alpha", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, false);

                    var explosionAnimationKeys = [{ frame: 0, value: <BABYLON.Vector3>{ x: 1, y: 1, z: 1 } }, { frame: 40, value: <BABYLON.Vector3>{ x: 400, y: 600, z: 400 }}];

                    var explosionAnimationOpacityKeys = [{ frame: 0, value: 1 }, { frame: 25, value: 1 }, { frame: 40, value: 0.2 }];

                    explosionAnimationSize.setKeys(explosionAnimationKeys);
                    explosionAnimationOpacity.setKeys(explosionAnimationOpacityKeys);

                    explosion.animations.push(explosionAnimationSize);
                    explosion.animations.push(explosionAnimationOpacity);

                    scene.beginAnimation(explosion, 0, 40, false, 1, () => { scene.removeMesh(explosion);
                        moveCamera();
                        (<HTMLButtonElement>document.getElementById("fire")).disabled = false;
                        if (hit) {
                            document.getElementById("message").innerHTML = "Direct hit!";
                            subMeshes.every((m, i) => {

                                var sinkAni = new BABYLON.Animation("sinkani" + i, "position.y", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, false);
                                var sinkAniKeys = [{ frame: 0, value: subOffset.y }, { frame: 120, value: -40 }];

                                sinkAni.setKeys(sinkAniKeys);
                                m.animations.push(sinkAni);
                                scene.beginAnimation(m, 0, 120, false, 1, () => { scene.removeMesh(m); });

                                return true;
                            });
                        } else {
                            document.getElementById("message").innerHTML = "Close!";
                            window.setTimeout(() => { document.getElementById("message").innerHTML = ""; }, 1000);
                        }
                    });
                });
                
            }

            
        });





        //The next three javascript lines are very important, as they register a render loop to repeatedly render the scene on the canvas:
        loader.onFinish = function () {
            engine.runRenderLoop(() => {
                scene.render();
            });
        };

        loader.load();


        // return the created scene
        return scene;
        
    }


    var scene = createScene();

     
    window.addEventListener("resize", () => {
    });

    document.getElementById("fire").addEventListener("click", e => {
        fire = true;
    });
//
//    document.getElementById("moveCamera").addEventListener("click", e => {
//        moveCamera = true;
//    });


});