
/// <reference path="../Babylon.js-master/dist/babylon.2.4.d.ts" />
"use strict";
class ActiveSphere {
    fireSphere: any;
    scored: boolean;
    launchTime: number;
}

var fired = false;
var toRadians = angle => angle * (Math.PI / 180);
var spherePhysicsOptions = { mass: 1, restitution: 0.8, friction: 0.2 };
var pegPhysicsOptions = { mass: 0, restitution: 0.8, friction: 0.05 };

var netLocation = new BABYLON.Vector3(0, 15, 70);
var camLocations = [new BABYLON.Vector3(10, 20, -40), new BABYLON.Vector3(30, 30, -40)];
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

        camera.setTarget(new BABYLON.Vector3(0, 15, 25));
        // attach the camera to the canvas
        camera.attachControl(canvas, false);

        // create a basic light, aiming 0,1,0 - meaning, to the sky
        var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(10, 6, 0), scene);

        // create a built-in "sphere" shape; its constructor takes 5 params: name, width, depth, subdivisions, scene

        // create a built-in "ground" shape; its constructor takes the same 5 params as the sphere's one
        //var ground = BABYLON.Mesh.CreateGround("ground1", 512, 512, 2, scene);
        //ground.renderingGroupId = 1;

        //ground.material = new BABYLON.Material("material1",scene).
        var gravityVector = scene.gravity = new BABYLON.Vector3(0, -9.81, 0);

        var physicsPlugin = new BABYLON.CannonJSPlugin();

        scene.enablePhysics(gravityVector, physicsPlugin);

        //ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9, friction: 0.05 }, scene);
//
//        var torus = BABYLON.MeshBuilder.CreateTorus("torus", { diameter: 6, thickness: 1, tessellation: 16 }, scene);
//        torus.position = netLocation;
//        torus.renderingGroupId = 1;
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
        var pegmaterial = new BABYLON.StandardMaterial("pegmaterial", scene);
        pegmaterial.emissiveColor = pegmaterial.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.2);

        var pegs = [];
        var createPegRow = (startPoint: BABYLON.Vector3, horOffset: number, num: number) =>
        {
            for (var i = 0; i < num; i++) {
                var peg = BABYLON.Mesh.CreateCylinder("peg" + startPoint.y + num, 5, 1, 1, 16, 1, scene);
                pegs.push(peg);
                peg.material = pegmaterial;
                peg.renderingGroupId = 1;
                peg.rotation.x = toRadians(90);
                peg.position = new BABYLON.Vector3(startPoint.x + (horOffset * i), startPoint.y, startPoint.z);

                peg.physicsImpostor = new BABYLON.PhysicsImpostor(peg, BABYLON.PhysicsImpostor.CylinderImpostor, pegPhysicsOptions, scene);
            }
        }
        var createPegs = (startPoint: BABYLON.Vector3, horOffset: number, vertOffset: number) => {
            for (var i = 0; i < 4; i++) {
                var point = new BABYLON.Vector3(startPoint.x + ((horOffset / 2) * i), startPoint.y + (vertOffset * i), startPoint.z);
                createPegRow(point, horOffset, 4-i);
            }
        }
        
        createPegs(<BABYLON.Vector3>{ x: -15.22, y: 5, z: 20 }, 10, 5);
        

//        pegs.every((x, i) => {
//            x.physicsImpostor = new BABYLON.PhysicsImpostor(x, BABYLON.PhysicsImpostor.CylinderImpostor, pegPhysicsOptions, scene);
//            return true;
//        });

        //transparent material
        var trans = new BABYLON.StandardMaterial("trans", scene);
        trans.alpha = 0;

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


        var fireSpheres: ActiveSphere[] = [];

        /*
         * before render, actions occur here
         */

        setInterval(() => {
            var sphere = BABYLON.Mesh.CreateSphere('sphere' + new Date().toISOString(), 16, 2, scene);
            sphere.renderingGroupId = 1;
            sphere.position.z = 20;
            sphere.position.y = 25;
            sphere.material = material;
            sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, spherePhysicsOptions, scene);
            sphere.physicsImpostor.setLinearVelocity(new BABYLON.Vector3((Math.random() - 0.5)*0.2, 0, 0));
        }, 1000);


        var bounding1 = BABYLON.Mesh.CreateBox("bbox1", 50, scene);
        bounding1.scaling = new BABYLON.Vector3(1, 1, 0.01);
        bounding1.position = new BABYLON.Vector3(0, 25, 17);
        bounding1.material = trans;

        var bounding2 = BABYLON.Mesh.CreateBox("bbox2", 50, scene);
        bounding2.scaling = new BABYLON.Vector3(1, 1, 0.01);
        bounding2.position = new BABYLON.Vector3(0, 25, 23);
        bounding2.material = trans;


        var bounding3 = BABYLON.Mesh.CreateGround("ground1", 50, 50, 2, scene);
        bounding3.position = new BABYLON.Vector3(0, -5, 0);
        bounding3.renderingGroupId = 1;

        for (var x = 0; x < 6; x++) {
            var bounding = BABYLON.Mesh.CreateBox("bboxx"+x, 10, scene);
            bounding.scaling = new BABYLON.Vector3(0.1, 1, 1);
            bounding.position = new BABYLON.Vector3(-25 + (10*x), 0, 20);
            bounding.material = trans;
            bounding.physicsImpostor = new BABYLON.PhysicsImpostor(bounding, BABYLON.PhysicsImpostor.BoxImpostor, pegPhysicsOptions, scene);
        }

        bounding1.physicsImpostor = new BABYLON.PhysicsImpostor(bounding1, BABYLON.PhysicsImpostor.BoxImpostor, pegPhysicsOptions, scene);
        bounding2.physicsImpostor = new BABYLON.PhysicsImpostor(bounding2, BABYLON.PhysicsImpostor.BoxImpostor, pegPhysicsOptions, scene);
        bounding3.physicsImpostor = new BABYLON.PhysicsImpostor(bounding3, BABYLON.PhysicsImpostor.BoxImpostor, pegPhysicsOptions, scene);


        scene.registerBeforeRender(() => {
//            if (!fired) { party();
//                fired = true;
//            }
            if (fireSpheres.length > 0) {
                for (var i = 0; i < fireSpheres.length; i++) {
                    if (!fireSpheres[i].scored) {
                        if (Math.pow(fireSpheres[i].fireSphere.position.x - netLocation.x, 2) < 1 &&
                            Math.pow(fireSpheres[i].fireSphere.position.y - netLocation.y, 2) < 1 &&
                            Math.pow(fireSpheres[i].fireSphere.position.z - netLocation.z, 2) < 1) {
                            fireSpheres[i].scored = true;
                            party();
                        }
                    }
                }
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