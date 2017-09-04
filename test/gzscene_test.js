jasmine.getFixtures().fixturesPath = 'base/test/fixture';

describe('Sdf Parser tests', function() {

      beforeEach(function(){
          module('gzangular');
          loadFixtures('myfixture.html');               
          originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
          jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;              
        });
      
      afterEach(function() {
          jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
      });

      var $controller;
     
      beforeEach(inject(function(_$controller_){
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $controller = _$controller_;
      }));

      // Initializing object used in the test.
      scene = new GZ3D.Scene();
      gui = new GZ3D.Gui(scene);
      iface = new GZ3D.GZIface(scene, gui);
      sdfparser = new GZ3D.SdfParser(scene, gui, iface);


      describe('Test gzscene Initialize', function() {
        it('Intial values should match', function() {

            var bbox, indices, positions, boxGeometry, 
            bbox_rotation, jointTypes, jointAxis, jointAxisMeshes,
            jointMainAxisMeshes, mesh, rot, pos, mainAxisLen, 
            jointRotMeshes, jointTransMeshes, jointScrewMeshes;
            var vec3 = new THREE.Vector3(0,0,0);

            expect(scene.manipulationMode).toEqual('view');
            expect(scene.name).toEqual('default');
  
            // Grid initialize
            expect(scene.grid.position.z).toEqual(0.05);
            expect(scene.grid.rotation.x).toEqual(Math.PI * 0.5);
            expect(scene.grid.name).toEqual('grid');
            expect(scene.grid.material.transparent).toEqual(true);
            expect(scene.grid.material.opacity).toEqual(0.5);
            expect(scene.grid.visible).toEqual(false);

            expect(scene.showCollisions).toEqual(false);
            expect(scene.spawnedShapeMaterial.opacity).toEqual(0.5);            
            expect(scene.spawnedShapeMaterial.transparent).toEqual(true);

            // TODO test event listeners
            // TODO test things that involve the DOM
            // expect(scene.radialMenu).toEqual(new GZ3D.RadialMenu(scene.getDomElement()));

            expect(scene.emitter).toEqual(new EventEmitter2({ verbose: true }));

            expect(scene.timeDown).toEqual(null);

            // Bounding Box
            indices = new Uint16Array(
              [ 0, 1, 1, 2, 2, 3, 3, 0,
                4, 5, 5, 6, 6, 7, 7, 4,
                0, 4, 1, 5, 2, 6, 3, 7 ] );

            positions = new Float32Array(8 * 3);
            boxGeometry = new THREE.BufferGeometry();
            boxGeometry.setIndex(new THREE.BufferAttribute( indices, 1 ));
            boxGeometry.addAttribute( 'position',
                  new THREE.BufferAttribute(positions, 3));

            bbox = scene.boundingBox;
            bbox_rotation = bbox.rotation;
            expect(bbox.geometry.index.array).toEqual(indices);
            expect(bbox.geometry.attributes.position.array).toEqual(positions);
            expect(bbox_rotation._x).toEqual(0);
            expect(bbox_rotation._y).toEqual(0);
            expect(bbox_rotation._z).toEqual(0);
            expect(bbox.visible).toEqual(false);
            
            // Joint visuals
            jointTypes =
            {
              REVOLUTE: 1,
              REVOLUTE2: 2,
              PRISMATIC: 3,
              UNIVERSAL: 4,
              BALL: 5,
              SCREW: 6,
              GEARBOX: 7,
              FIXED: 8
            };

            jointAxis = scene.jointAxis;
            expect(scene.jointTypes).toEqual(jointTypes);            
            expect(jointAxis.name).toEqual('JOINT_VISUAL');
            
            // Joint Axes XYZ
            jointAxisMeshes = jointAxis['XYZaxes'].children;
            
            mesh = jointAxisMeshes[0];
            pos = mesh.position;
            rot = mesh.rotation;
            vec3.x = 0.15;
            vec3.y = 0;
            vec3.z = 0;
            expect(mesh.name).toEqual('JOINT_VISUAL');
            expect(mesh.material.color).toEqual(new THREE.Color(0xff0000));
            expect(pos).toEqual(vec3);
            expect(rot.x).toEqual(0);
            expect(rot.y).toEqual(0);            
            expect(rot.z).toEqual(-Math.PI/2);

            mesh = jointAxisMeshes[1];
            pos = mesh.position;
            rot = mesh.rotation;
            vec3.x = 0;
            vec3.y = 0.15;
            vec3.z = 0;
            expect(mesh.name).toEqual('JOINT_VISUAL');
            expect(mesh.material.color).toEqual(new THREE.Color(0x00ff00));
            expect(pos).toEqual(vec3);
            expect(rot.x).toEqual(0);
            expect(rot.y).toEqual(0);
            expect(rot.z).toEqual(0);
            

            mesh = jointAxisMeshes[2];
            pos = mesh.position;
            rot = mesh.rotation;
            vec3.x = 0;
            vec3.y = 0;
            vec3.z = 0.15;
            expect(mesh.name).toEqual('JOINT_VISUAL');
            expect(mesh.material.color).toEqual(new THREE.Color(0x0000ff));
            expect(pos).toEqual(vec3);
            expect(rot.x).toEqual(Math.PI/2);
            expect(rot.y).toEqual(0);
            expect(rot.z).toEqual(0);
            

            mesh = jointAxisMeshes[3];
            pos = mesh.position;
            rot = mesh.rotation;
            vec3.x = 0.3;
            vec3.y = 0;
            vec3.z = 0;
            expect(mesh.name).toEqual('JOINT_VISUAL');
            expect(mesh.material.color).toEqual(new THREE.Color(0xff0000));
            expect(pos).toEqual(vec3);            
            expect(rot.x).toEqual(0);
            expect(rot.y).toEqual(0);
            expect(rot.z).toEqual(-Math.PI/2);
            
            mesh = jointAxisMeshes[4];
            pos = mesh.position;
            rot = mesh.rotation;
            vec3.x = 0.;
            vec3.y = 0.3;
            vec3.z = 0;
            expect(mesh.name).toEqual('JOINT_VISUAL');
            expect(mesh.material.color).toEqual(new THREE.Color(0x00ff00));
            expect(pos).toEqual(vec3);
            expect(rot.x).toEqual(0);
            expect(rot.y).toEqual(0);
            expect(rot.z).toEqual(0);
            
            
            mesh = jointAxisMeshes[5];
            pos = mesh.position;
            rot = mesh.rotation;
            vec3.x = 0;
            vec3.y = 0;
            vec3.z = 0.3;
            expect(mesh.name).toEqual('JOINT_VISUAL');
            expect(mesh.material.color).toEqual(new THREE.Color(0x0000ff));
            expect(pos).toEqual(vec3);
            expect(rot.x).toEqual(Math.PI/2);
            expect(rot.y).toEqual(0);
            expect(rot.z).toEqual(0);
            
            
            // Joint MainAxis
            jointMainAxisMeshes = jointAxis['mainAxis'].children;
            mainAxisLen = 0.3;            

            mesh = jointMainAxisMeshes[0];
            pos = mesh.position;
            rot = mesh.rotation;
            vec3.x = 0;
            vec3.y = 0;
            vec3.z = mainAxisLen * 0.5;
            expect(mesh.name).toEqual('JOINT_VISUAL');
            expect(mesh.material.color).toEqual(new THREE.Color(0xffff00));
            expect(pos).toEqual(vec3);
            expect(rot.x).toEqual(Math.PI/2);
            expect(rot.y).toEqual(0);            
            expect(rot.z).toEqual(0);

            mesh = jointMainAxisMeshes[1];
            pos = mesh.position;
            rot = mesh.rotation;
            vec3.x = 0;
            vec3.y = 0;
            vec3.z = mainAxisLen;
            expect(mesh.name).toEqual('JOINT_VISUAL');
            expect(mesh.material.color).toEqual(new THREE.Color(0xffff00));
            expect(pos).toEqual(vec3);
            expect(rot.x).toEqual(Math.PI/2);
            expect(rot.y).toEqual(0);
            expect(rot.z).toEqual(0);
            
            
            // Joint RotAxis
            jointRotMeshes = jointAxis['rotAxis'].children;

            mesh = jointRotMeshes[0];
            pos = mesh.position;
            rot = mesh.rotation;
            vec3.x = 0;
            vec3.y = 0;
            vec3.z = mainAxisLen;
            expect(mesh.name).toEqual('JOINT_VISUAL');
            expect(mesh.material.color).toEqual(new THREE.Color(0xffff00));
            expect(pos).toEqual(vec3);
            expect(rot.x).toEqual(0);
            expect(rot.y).toEqual(0);            
            expect(rot.z).toEqual(0);

            mesh = jointRotMeshes[1];
            pos = mesh.position;
            rot = mesh.rotation;
            vec3.x = 0;
            vec3.y = -0.04;
            vec3.z = mainAxisLen;
            expect(mesh.name).toEqual('JOINT_VISUAL');
            expect(mesh.material.color).toEqual(new THREE.Color(0xffff00));
            expect(pos).toEqual(vec3);
            expect(rot.x).toEqual(0);
            expect(rot.y).toEqual(0);
            expect(rot.z).toEqual(Math.PI/2);

            // Joint TransAxis
            jointTransMeshes = jointAxis['transAxis'].children;
            
            mesh = jointTransMeshes[0];
            pos = mesh.position;
            rot = mesh.rotation;
            vec3.x = 0.03;
            vec3.y = 0.03;
            vec3.z = mainAxisLen * 0.5;
            expect(mesh.name).toEqual('JOINT_VISUAL');
            expect(pos).toEqual(vec3);
            expect(rot.x).toEqual(Math.PI/2);
            expect(rot.y).toEqual(0);            
            expect(rot.z).toEqual(0);

            mesh = jointTransMeshes[1];
            pos = mesh.position;
            rot = mesh.rotation;
            vec3.x = 0.03;
            vec3.y = 0.03;
            vec3.z = mainAxisLen * 0.5 + 0.05;
            expect(mesh.name).toEqual('JOINT_VISUAL');
            expect(pos).toEqual(vec3);
            expect(rot.x).toEqual(-Math.PI/2);
            expect(rot.y).toEqual(0);
            expect(rot.z).toEqual(0);
            

            mesh = jointTransMeshes[2];
            pos = mesh.position;
            rot = mesh.rotation;
            vec3.x = 0.03;
            vec3.y = 0.03;
            vec3.z = mainAxisLen * 0.5 - 0.05;
            expect(mesh.name).toEqual('JOINT_VISUAL');
            expect(pos).toEqual(vec3);
            expect(rot.x).toEqual(Math.PI/2);
            expect(rot.y).toEqual(0);
            expect(rot.z).toEqual(0);
            
            // Joint ScrewAxis
            jointScrewMeshes = jointAxis['screwAxis'].children;

            mesh = jointScrewMeshes[0];
            pos = mesh.position;
            rot = mesh.rotation;
            vec3.x = -0.04;
            vec3.y = 0;
            vec3.z = mainAxisLen - 0.11;
            expect(mesh.name).toEqual('JOINT_VISUAL');
            expect(mesh.material.color).toEqual(new THREE.Color(0xffff00));
            expect(pos).toEqual(vec3);
            expect(rot.x).toEqual(-Math.PI/10);
            expect(rot.y).toEqual(0);            
            expect(rot.z).toEqual(-Math.PI/4);

            mesh = jointScrewMeshes[1];
            pos = mesh.position;
            rot = mesh.rotation;
            vec3.x = 0;
            vec3.y = 0;
            vec3.z = mainAxisLen - 0.23;
            expect(mesh.name).toEqual('JOINT_VISUAL');
            expect(mesh.material.color).toEqual(new THREE.Color(0xffff00));
            expect(pos).toEqual(vec3);
            expect(rot.x).toEqual(0);
            expect(rot.y).toEqual(0);
            expect(rot.z).toEqual(0);            
               
        });
      });

      describe('Test gzscene Set Pose', function() {
        it('Position and orientation of the returned model should match', function() {
          
          var model, pos, ori, quaternion;
          pos = new THREE.Vector3(-1,0.5,3);
          ori = new THREE.Quaternion(0.1,-0.3,2,0);
          model = new THREE.Object3D();
          scene.setPose(model, pos, ori);
          expect(model.position).toEqual(pos);

          quaternion = model.quaternion;
          expect(quaternion.x).toEqual(ori.x);
          expect(quaternion.y).toEqual(ori.y);
          expect(quaternion.z).toEqual(ori.z);
          expect(quaternion.w).toEqual(ori.w);

          // var evt = document.createEvent("MouseEvents");
          // evt.initMouseEvent("click", true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
          // document.body.dispatchEvent(evt);
        });
      });

      describe('Test gzscene Set SDFParser', function() {
        it('Should return scene\'s SdfParser ', function() {

          scene.setSDFParser(sdfparser);
          expect(scene.spawnModel.sdfParser).toEqual(sdfparser);
        });
      });


      // Test manipulation_mode
      describe('Test manipulation mode', function() {
        // For some reasone that I yet to discover, 
        // I've to do this for the eventEmiiter to work!
        // else we get "Error: cannot call methods on popup prior \
        // to initialization; attempted to call method 'close'"
        describe('Reintialize', function() {
          // Initializing object used in the test.
          scene = new GZ3D.Scene();
          gui = new GZ3D.Gui(scene);
          iface = new GZ3D.GZIface(scene, gui);
          sdfparser = new GZ3D.SdfParser(scene, gui, iface);
        });

        it('Should change manipulation mode to translate', function() {
          guiEvents.emit('manipulation_mode', 'translate');
            
          expect(scene.manipulationMode).not.toEqual('view');  
          expect(scene.manipulationMode).toEqual('translate');
        });              
      });

      // Test Model spawning
      describe('Test manipulation mode', function() {
        it('Spwan model', function() {
   
          var $scope = {};
          var controller = $controller('insertControl', { $scope: $scope });
          // console.log($scope);
          // $scope.spawnEntity('box');
          // console.log(modelStats);
        });              
      });


});
    
 
 