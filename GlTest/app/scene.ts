﻿/// <reference path="../node_modules/babylonjs/babylon.d.ts" />
"use strict";
class ActiveSphere {
    fireSphere: any;
    scored: boolean;
    launchTime: number;
}

var fire = false, moveCamera = false;
var spherePhysicsOptions = { mass: 1, restitution: 0.9, friction: 0.05 };

var netLocation = new BABYLON.Vector3(0, 15, 70);
var camLocations = [new BABYLON.Vector3(0, 200, 0), new BABYLON.Vector3(30, 30, -40)];
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
        camera.lockedTarget = new BABYLON.Vector3(0, 0, 40);

        // attach the camera to the canvas
        camera.attachControl(canvas, false);

        // create a basic light, aiming 0,1,0 - meaning, to the sky
        var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(10, 6, 0), scene);

        // create a built-in "sphere" shape; its constructor takes 5 params: name, width, depth, subdivisions, scene
        
        // create a built-in "ground" shape; its constructor takes the same 5 params as the sphere's one
        var ground = BABYLON.Mesh.CreateGround("ground1", 20, 20, 2, scene);
        ground.renderingGroupId = 1;

        //ground.material = new BABYLON.Material("material1",scene).
        var gravityVector = scene.gravity = new BABYLON.Vector3(0, -9.81, 0);

        var physicsPlugin = new BABYLON.CannonJSPlugin();

        scene.enablePhysics(gravityVector, physicsPlugin);

        ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9, friction: 0.05 }, scene);

        var torus = BABYLON.MeshBuilder.CreateTorus("torus", {diameter: 6, thickness: 1, tessellation: 16}, scene);
        torus.position = netLocation;
        torus.renderingGroupId = 1;
        //box.rotation.y=90;

        torus.physicsImpostor = new BABYLON.PhysicsImpostor(torus, BABYLON.PhysicsImpostor.MeshImpostor, {
            friction: 0.05,
            restitution: 0.9,
            mass: 0
        }, scene);



        //makes a bunch of spheres appear
        var party = () => {
            for (var i = 0; i < 20; i++) {
                var sphere = BABYLON.Mesh.CreateSphere('sphere' + i, 16, 2, scene);
                sphere.renderingGroupId = 1;
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
        material.reflectionTexture = new BABYLON.CubeTexture("skybox/TropicalSunnyDay", scene);
        material.reflectionTexture.level = 0.5;
        material.specularPower = 64;
        material.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2); 

        // Fresnel
        material.emissiveFresnelParameters = new BABYLON.FresnelParameters();
        material.emissiveFresnelParameters.bias = 0.4;
        material.emissiveFresnelParameters.power = 2;
        material.emissiveFresnelParameters.leftColor = BABYLON.Color3.Black();
        material.emissiveFresnelParameters.rightColor = BABYLON.Color3.White();

        var fireSpheres: ActiveSphere[] = [];
        

        /*
         * before render, actions occur here
         */

        scene.registerBeforeRender(() => {

            if (moveCamera) {
                moveCamera = false;
                var position = new BABYLON.Animation("camPos", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                camLocation = camLocation === 0 ? 1 : 0;
                var keys = [{ frame: 0, value: camera.position }, { frame: 50, value: camLocations[camLocation] }];
                position.setKeys(keys);
                camera.animations.push(position);
                scene.beginAnimation(camera, 0, 50, false, 1);
            }

            //looks at our existing fire spheres and check if they've gone through the hoop
            if (fireSpheres.length > 0) {
                for (var i = 0; i < fireSpheres.length; i++) {
                    if (!fireSpheres[i].scored) {
                        if (Math.pow(fireSpheres[i].fireSphere.position.x - netLocation.x,2) < 1 && 
                            Math.pow(fireSpheres[i].fireSphere.position.y - netLocation.y,2) < 1 && 
                            Math.pow(fireSpheres[i].fireSphere.position.z - netLocation.z,2) < 1) {
                            fireSpheres[i].scored = true;
                            party();
                        }
                    }
                }
            }


            //if we've hit the fire button, fire the ball!
            if (fire) {
                var angle = parseFloat((<HTMLInputElement>document.getElementById("angle")).value);
                var force = parseFloat((<HTMLInputElement>document.getElementById("force")).value);

                if (isNaN(angle) || angle > 90 || angle < 0 || isNaN(force) || force > 100 || force < 1) {
                    fire = false;
                    return;
                }

                var adj = Math.cos(toRadians(angle)) * force;
                var opp = Math.sin(toRadians(angle)) * force;

                var fireSphere = BABYLON.Mesh.CreateSphere("sphere" + new Date().toISOString(), 16, 2, scene);
                fireSphere.material = material;
                fireSphere.renderingGroupId = 1;
                fireSphere.position.y = 2;
                fireSphere.physicsImpostor = new BABYLON.PhysicsImpostor(fireSphere, BABYLON.PhysicsImpostor.SphereImpostor, spherePhysicsOptions, scene);
                fireSphere.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, opp, adj));
                fireSpheres.push({ fireSphere: fireSphere, scored: false, launchTime:new Date().getMilliseconds() });
                fire = false;
            }
        });

        // Skybox
        var skybox = BABYLON.Mesh.CreateBox("skyBox", 10.0, scene);
        skybox.infiniteDistance = true;
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/skybox/TropicalSunnyDay", scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;

        skybox.renderingGroupId = 0;

        // return the created scene
        return scene;
    }


    var scene = createScene();

    //The next three javascript lines are very important, as they register a render loop to repeatedly render the scene on the canvas:
    engine.runRenderLoop(() => {
        scene.render();
    });

    window.addEventListener("resize", () => {
    });

    document.getElementById("fire").addEventListener("click", e => {
        fire = true;
    });

    document.getElementById("moveCamera").addEventListener("click", e => {
        moveCamera = true;
    });

    var toRadians = angle => angle * (Math.PI / 180);

});