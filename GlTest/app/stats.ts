﻿
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
var camLocations = [new BABYLON.Vector3(0, 20, -200)];

var camLocation = 0;

window.addEventListener("DOMContentLoaded", () => {
    var canvas = <HTMLCanvasElement>document.getElementById("renderCanvas");
    var engine = new BABYLON.Engine(canvas, true);

    engine.setSize(600, 600);
    var createScene = () => {
        // create a basic BJS Scene object
        var scene = new BABYLON.Scene(engine);

        // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
        var camera = new BABYLON.FreeCamera("camera1", camLocations[camLocation], scene);
        
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
        ground.rotation.z = 90;
        //ground.renderingGroupId = 1;
        ground.position.y = -1;
        ground.material = groundMaterial;


        //ground.material = new BABYLON.Material("material1",scene).
        var gravityVector = scene.gravity = new BABYLON.Vector3(0, -9.81, 0);

        var physicsPlugin = new BABYLON.CannonJSPlugin();

        scene.enablePhysics(gravityVector, physicsPlugin);

        ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9, friction: 0.05 }, scene);

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

        //skybox.renderingGroupId = 0;
        

        
        /*
         * before render, actions occur here
         */
        var fired = false;
        scene.registerBeforeRender(() => {
            if (!fired) {
                fired = true;
                party();
            }
        });





        //The next three javascript lines are very important, as they register a render loop to repeatedly render the scene on the canvas:

        engine.runRenderLoop(() => {
            scene.render();
        });
        


        // return the created scene
        return scene;

    }


    var scene = createScene();


    window.addEventListener("resize", () => {
    });


});