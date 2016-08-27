
/// <reference path="../Babylon.js-master/dist/babylon.2.4.d.ts" />
/// <reference path="../Babylon.js-master/materialslibrary/dist/dts/babylon.watermaterial.d.ts" />

"use strict";
class ActiveSphere {
    fireSphere: any;
    scored: boolean;
    launchTime: number;
}

var fire = false, moveCamera = false;
var spherePhysicsOptions = { mass: 0, restitution: 0.9, friction: 0.0 };

var toRadians = angle => angle * (Math.PI / 180);
var netLocation = new BABYLON.Vector3(0, 15, 70);
var subOffset = new BABYLON.Vector3(40, -6, 120);
var camLocations = [new BABYLON.Vector3(0, 400, 0), new BABYLON.Vector3(0, 30, -50)];
var camViews = [new BABYLON.Vector3(0, 0, 40), subOffset];

var camLocation = 1;

window.addEventListener("DOMContentLoaded", () => {
    var canvas = <HTMLCanvasElement>document.getElementById("renderCanvas");
    var engine = new BABYLON.Engine(canvas, true);

    engine.setSize(600, 600);
    var createScene = () => {
        // create a basic BJS Scene object
        var scene = new BABYLON.Scene(engine);

        // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
        var camera = new BABYLON.FreeCamera("camera1",camLocations[camLocation], scene);

        // target the camera to scene origin
        camera.lockedTarget = subOffset;

        // attach the camera to the canvas
        camera.attachControl(canvas, false);

        // create a basic light, aiming 0,1,0 - meaning, to the sky
        var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(10, 6, 0), scene);

        // create a built-in "sphere" shape; its constructor takes 5 params: name, width, depth, subdivisions, scene
        
        // create a built-in "ground" shape; its constructor takes the same 5 params as the sphere's one
        var ground = BABYLON.Mesh.CreateGround("ground1", 512, 512, 2, scene);
        // Ground
        var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("assets/ground.jpg", scene);
        //ground.renderingGroupId = 1;
        ground.position.y = -1;
        ground.material = groundMaterial;


        //ground.material = new BABYLON.Material("material1",scene).
        var gravityVector = scene.gravity = new BABYLON.Vector3(0, -9.81, 0);

        var physicsPlugin = new BABYLON.CannonJSPlugin();

        scene.enablePhysics(gravityVector, physicsPlugin);

        //ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9, friction: 0.05 }, scene);

//        var torus = BABYLON.MeshBuilder.CreateTorus("torus", {diameter: 6, thickness: 1, tessellation: 16}, scene);
//        torus.position = netLocation;
//        //torus.renderingGroupId = 1;
//        //box.rotation.y=90;
//
//        torus.physicsImpostor = new BABYLON.PhysicsImpostor(torus, BABYLON.PhysicsImpostor.MeshImpostor, {
//            friction: 0.05,
//            restitution: 0.9,
//            mass: 0
//        }, scene);



        //makes a bunch of spheres appear
        var party = () => {
            for (var i = 0; i < 20; i++) {
                var sphere = BABYLON.Mesh.CreateSphere('sphere' + i, 16, 2, scene);
                //sphere.renderingGroupId = 1;
                sphere.position.z = 80;
                // move the sphere upward 1/2 of its height
                sphere.position.y = (1 + i) * 6.2;
                //sphere.position.x = ((1 + i) * 0.2)-5;

                sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, spherePhysicsOptions, scene);

                sphere.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(((i % 2) * 1.2) - 0.6, (20 - i) * 0.5, ((i % 3) * 2) - 1));

                sphere.material = new BABYLON.StandardMaterial("mat" + i, scene);
                (<BABYLON.StandardMaterial>sphere.material).diffuseColor = new BABYLON.Color3(i * ((i % 3) * 0.22), i * 0.16, i * ((i % 4) * 0.42));

            }
        };

        // Sphere5 material
        var material = new BABYLON.StandardMaterial("kosh5", scene);
        material.diffuseColor = new BABYLON.Color3(0, 0, 0);
        material.reflectionTexture = new BABYLON.CubeTexture("assets/skybox/TropicalSunnyDay", scene);
        material.reflectionTexture.level = 0.5;
        material.specularPower = 64;
        material.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2); 

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
        var waterMesh = BABYLON.Mesh.CreateGround("waterMesh", 512, 512, 32, scene, false);
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
        
        sub.onSuccess = (t: BABYLON.MeshAssetTask) => {

            for (var i = 0; i < t.loadedMeshes.length; i++) {
                var m = t.loadedMeshes[i];
                m.scaling.x += 20;
                m.scaling.y += 20;
                m.scaling.z += 20;
                m.position = subOffset;
                m.rotation.y += 5;
                //m.renderingGroupId = 1;
                water.addToRenderList(m);
                m.material = material;
            }

        };
        sub2.onSuccess = (t: BABYLON.MeshAssetTask) => {
            var home = new BABYLON.Vector3(0, -5, 0);
            for (var i = 0; i < t.loadedMeshes.length; i++) {
                var m = t.loadedMeshes[i];
                m.scaling.x += 20;
                m.scaling.y += 20;
                m.scaling.z += 20;
                m.position = home;
                m.rotation.y = + toRadians(90);
                //m.renderingGroupId = 1;
                water.addToRenderList(m);
                m.material = material;
            }

        };


        /*
         * before render, actions occur here
         */

        scene.registerBeforeRender(() => {

            if (moveCamera) {
                moveCamera = false;
                var position = new BABYLON.Animation("camPos", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                var lockedTarget = new BABYLON.Animation("camView", "lockedTarget", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                camLocation = camLocation === 0 ? 1 : 0;
                var keys1 = [{ frame: 0, value: camera.position }, { frame: 50, value: camLocations[camLocation] }];
                var keys2 = [{ frame: 0, value: camera.lockedTarget }, { frame: 50, value: camViews[camLocation] }];
                position.setKeys(keys1);
                lockedTarget.setKeys(keys2);
                camera.animations.push(position);
                camera.animations.push(lockedTarget);
                scene.beginAnimation(camera, 0, 50, false, 1);
            }

            if (fire) {
                //fire a torpedo
                fire = false;
                var torpedo = BABYLON.Mesh.CreateSphere("sphere" + new Date().toISOString(), 16, 4, scene);
                var fireAnimation = new BABYLON.Animation("fireAnimation", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, false);
                var fireAnimationKeys = [{ frame: 0, value: <BABYLON.Vector3>{ x: 0, y: 0, z: 0 } }, { frame: (60*5), value: subOffset }];

                water.addToRenderList(torpedo);
                fireAnimation.setKeys(fireAnimationKeys);
                fireAnimation.addEvent(new BABYLON.AnimationEvent((60 * 5), () => { torpedo = null;party(); }, true));
                torpedo.animations.push(fireAnimation);

                torpedo.position = <BABYLON.Vector3>{ x: 0, y: 0, z: 0 };
                scene.beginAnimation(torpedo, 0, (60 * 5), false, 1);
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

    document.getElementById("moveCamera").addEventListener("click", e => {
        moveCamera = true;
    });


});