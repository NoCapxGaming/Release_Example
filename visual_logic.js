/**
 * Generated by Verge3D Puzzles v.4.1.1
 * Mon, 28 Nov 2022 04:09:05 GMT
 * Prefer not editing this file as your changes may get overridden once Puzzles are saved.
 * Check out https://www.soft8soft.com/docs/manual/en/introduction/Using-JavaScript.html
 * for the information on how to add your own JavaScript to Verge3D apps.
 */

'use strict';

(function() {

// global variables/constants used by puzzles' functions

var LIST_NONE = '<none>';

var _pGlob = {};

_pGlob.objCache = {};
_pGlob.fadeAnnotations = true;
_pGlob.pickedObject = '';
_pGlob.hoveredObject = '';
_pGlob.mediaElements = {};
_pGlob.loadedFile = '';
_pGlob.states = [];
_pGlob.percentage = 0;
_pGlob.openedFile = '';
_pGlob.openedFileMeta = {};
_pGlob.xrSessionAcquired = false;
_pGlob.xrSessionCallbacks = [];
_pGlob.screenCoords = new v3d.Vector2();
_pGlob.intervalTimers = {};
_pGlob.customEvents = new v3d.EventDispatcher();

_pGlob.AXIS_X = new v3d.Vector3(1, 0, 0);
_pGlob.AXIS_Y = new v3d.Vector3(0, 1, 0);
_pGlob.AXIS_Z = new v3d.Vector3(0, 0, 1);
_pGlob.MIN_DRAG_SCALE = 10e-4;
_pGlob.SET_OBJ_ROT_EPS = 1e-8;

_pGlob.vec2Tmp = new v3d.Vector2();
_pGlob.vec2Tmp2 = new v3d.Vector2();
_pGlob.vec3Tmp = new v3d.Vector3();
_pGlob.vec3Tmp2 = new v3d.Vector3();
_pGlob.vec3Tmp3 = new v3d.Vector3();
_pGlob.vec3Tmp4 = new v3d.Vector3();
_pGlob.eulerTmp = new v3d.Euler();
_pGlob.eulerTmp2 = new v3d.Euler();
_pGlob.quatTmp = new v3d.Quaternion();
_pGlob.quatTmp2 = new v3d.Quaternion();
_pGlob.colorTmp = new v3d.Color();
_pGlob.mat4Tmp = new v3d.Matrix4();
_pGlob.planeTmp = new v3d.Plane();
_pGlob.raycasterTmp = new v3d.Raycaster();

var PL = v3d.PL = v3d.PL || {};

// a more readable alias for PL (stands for "Puzzle Logic")
v3d.puzzles = PL;

PL.procedures = PL.procedures || {};




PL.execInitPuzzles = function(options) {
    // always null, should not be available in "init" puzzles
    var appInstance = null;
    // app is more conventional than appInstance (used in exec script and app templates)
    var app = null;

    var _initGlob = {};
    _initGlob.percentage = 0;
    _initGlob.output = {
        initOptions: {
            fadeAnnotations: true,
            useBkgTransp: false,
            preserveDrawBuf: false,
            useCompAssets: false,
            useFullscreen: true,
            useCustomPreloader: false,
            preloaderStartCb: function() {},
            preloaderProgressCb: function() {},
            preloaderEndCb: function() {},
        }
    }

    // provide the container's id to puzzles that need access to the container
    _initGlob.container = options !== undefined && 'container' in options
            ? options.container : "";

    

    
    return _initGlob.output;
}

PL.init = function(appInstance, initOptions) {

// app is more conventional than appInstance (used in exec script and app templates)
var app = appInstance;

initOptions = initOptions || {};

if ('fadeAnnotations' in initOptions) {
    _pGlob.fadeAnnotations = initOptions.fadeAnnotations;
}



// utility function envoked by almost all V3D-specific puzzles
// filter off some non-mesh types
function notIgnoredObj(obj) {
    return obj.type !== 'AmbientLight' &&
           obj.name !== '' &&
           !(obj.isMesh && obj.isMaterialGeneratedMesh) &&
           !obj.isAuxClippingMesh;
}


// utility function envoked by almost all V3D-specific puzzles
// find first occurence of the object by its name
function getObjectByName(objName) {
    var objFound;
    var runTime = _pGlob !== undefined;
    objFound = runTime ? _pGlob.objCache[objName] : null;

    if (objFound && objFound.name === objName)
        return objFound;

    if (appInstance.scene) {
        appInstance.scene.traverse(function(obj) {
            if (!objFound && notIgnoredObj(obj) && (obj.name == objName)) {
                objFound = obj;
                if (runTime) {
                    _pGlob.objCache[objName] = objFound;
                }
            }
        });
    }
    return objFound;
}


// utility function envoked by almost all V3D-specific puzzles
// retrieve all objects on the scene
function getAllObjectNames() {
    var objNameList = [];
    appInstance.scene.traverse(function(obj) {
        if (notIgnoredObj(obj))
            objNameList.push(obj.name)
    });
    return objNameList;
}


// utility function envoked by almost all V3D-specific puzzles
// retrieve all objects which belong to the group
function getObjectNamesByGroupName(targetGroupName) {
    var objNameList = [];
    appInstance.scene.traverse(function(obj){
        if (notIgnoredObj(obj)) {
            var groupNames = obj.groupNames;
            if (!groupNames)
                return;
            for (var i = 0; i < groupNames.length; i++) {
                var groupName = groupNames[i];
                if (groupName == targetGroupName) {
                    objNameList.push(obj.name);
                }
            }
        }
    });
    return objNameList;
}


// utility function envoked by almost all V3D-specific puzzles
// process object input, which can be either single obj or array of objects, or a group
function retrieveObjectNames(objNames) {
    var acc = [];
    retrieveObjectNamesAcc(objNames, acc);
    return acc.filter(function(name) {
        return name;
    });
}

function retrieveObjectNamesAcc(currObjNames, acc) {
    if (typeof currObjNames == "string") {
        acc.push(currObjNames);
    } else if (Array.isArray(currObjNames) && currObjNames[0] == "GROUP") {
        var newObj = getObjectNamesByGroupName(currObjNames[1]);
        for (var i = 0; i < newObj.length; i++)
            acc.push(newObj[i]);
    } else if (Array.isArray(currObjNames) && currObjNames[0] == "ALL_OBJECTS") {
        var newObj = getAllObjectNames();
        for (var i = 0; i < newObj.length; i++)
            acc.push(newObj[i]);
    } else if (Array.isArray(currObjNames)) {
        for (var i = 0; i < currObjNames.length; i++)
            retrieveObjectNamesAcc(currObjNames[i], acc);
    }
}

// isObjectVisible puzzle
function isObjectVisible(objSelector) {
    var objNames = retrieveObjectNames(objSelector);

    for (var i = 0; i < objNames.length; i++) {
        var objName = objNames[i]
        if (!objName)
            continue;
        var obj = getObjectByName(objName);
        if (!obj)
            continue;
        if (obj.visible)
            return true;
    }
    return false;
}

// autoRotateCamera puzzle
function autoRotateCamera(enabled, speed) {

    if (appInstance.controls && appInstance.controls instanceof v3d.OrbitControls) {
        appInstance.controls.autoRotate = enabled;
        appInstance.controls.autoRotateSpeed = speed;
    } else {
        console.error('autorotate camera: Wrong controls type');
    }
}

// setCameraParam puzzle
function setCameraParam(type, objSelector, param) {

    var objNames = retrieveObjectNames(objSelector);

    objNames.forEach(function(objName) {
        if (!objName)
            return;

        var obj = getObjectByName(objName);
        if (!obj || !obj.isCamera) return;

        if (!(obj.isPerspectiveCamera || obj.isOrthographicCamera)) {
            console.error('setCameraParam: Incompatible camera type, have to be perspective or orthographic');
            return;
        }

        let isSetOrbitParam = false;
        switch (type) {
            case 'ORBIT_MIN_DISTANCE_PERSP':
            case 'ORBIT_MAX_DISTANCE_PERSP':
            case 'ORBIT_MIN_ZOOM_ORTHO':
            case 'ORBIT_MAX_ZOOM_ORTHO':
            case 'ORBIT_MIN_VERTICAL_ANGLE':
            case 'ORBIT_MAX_VERTICAL_ANGLE':
            case 'ORBIT_MIN_HORIZONTAL_ANGLE':
            case 'ORBIT_MAX_HORIZONTAL_ANGLE':
            case 'ORBIT_ALLOW_TURNOVER':
                isSetOrbitParam = true;
                break;
        }
        let isSetControlsParam = (['ROTATION_SPEED', 'MOVEMENT_SPEED', 'ALLOW_PANNING', 'ALLOW_ZOOM', 'KEYBOARD_CONTROLS'].includes(type) || isSetOrbitParam);
        if (isSetControlsParam) {
            if (!obj.controls) {
                console.error('setCameraParam: The "' + objName +'" camera has no controller');
                return;
            } else if (isSetOrbitParam && obj.controls.type != 'ORBIT') {
                console.error('setCameraParam: Incompatible camera controller');
                return;
            }
        }

        switch (type) {
            case 'FIELD_OF_VIEW':
                if (obj.isPerspectiveCamera) {
                    obj.fov = param;
                    obj.updateProjectionMatrix();
                } else {
                    console.error('setCameraParam: Incompatible camera type, have to be perspective');
                    return;
                }
                break;
            case 'ORTHO_SCALE':
                if (obj.isOrthographicCamera) {
                    obj.zoom = param;
                    obj.updateProjectionMatrix();
                } else {
                    console.error('setCameraParam: Incompatible camera type, have to be orthographic');
                    return;
                }
                break;
            case 'ROTATION_SPEED':
                obj.controls.rotateSpeed = param;
                break;
            case 'MOVEMENT_SPEED':
                obj.controls.moveSpeed = param;
                break;
            case 'ALLOW_PANNING':
                obj.controls.enablePan = param;
                break;
            case 'ALLOW_ZOOM':
                obj.controls.enableZoom = param;
                break;
            case 'KEYBOARD_CONTROLS':
                obj.controls.enableKeys = param;
                break;
            case 'ORBIT_MIN_DISTANCE_PERSP':
                if (obj.isPerspectiveCamera) {
                    obj.controls.orbitMinDistance = param;
                } else {
                    console.error('setCameraParam: Incompatible camera type, have to be perspective');
                    return;
                }
                break;
            case 'ORBIT_MAX_DISTANCE_PERSP':
                if (obj.isPerspectiveCamera) {
                    obj.controls.orbitMaxDistance = param;
                } else {
                    console.error('setCameraParam: Incompatible camera type, have to be perspective');
                    return;
                }
                break;
            case 'ORBIT_MIN_ZOOM_ORTHO':
                if (obj.isOrthographicCamera) {
                    obj.controls.orbitMinZoom = param;
                } else {
                    console.error('setCameraParam: Incompatible camera type, have to be orthographic');
                    return;
                }
                break;
            case 'ORBIT_MAX_ZOOM_ORTHO':
                if (obj.isOrthographicCamera) {
                    obj.controls.orbitMaxZoom = param;
                } else {
                    console.error('setCameraParam: Incompatible camera type, have to be orthographic');
                    return;
                }
                break;
            case 'ORBIT_MIN_VERTICAL_ANGLE':
                obj.controls.orbitMinPolarAngle = v3d.MathUtils.degToRad(param);
                break;
            case 'ORBIT_MAX_VERTICAL_ANGLE':
                obj.controls.orbitMaxPolarAngle = v3d.MathUtils.degToRad(param);
                break;
            case 'ORBIT_MIN_HORIZONTAL_ANGLE':
                obj.controls.orbitMinAzimuthAngle = v3d.MathUtils.degToRad(param);
                break;
            case 'ORBIT_MAX_HORIZONTAL_ANGLE':
                obj.controls.orbitMaxAzimuthAngle = v3d.MathUtils.degToRad(param);
                break;
            case 'ORBIT_ALLOW_TURNOVER':
                obj.controls.orbitEnableTurnover = param;
                break;
            case 'CLIP_START':
                obj.near = param;
                obj.updateProjectionMatrix();
                break;
            case 'CLIP_END':
                obj.far = param;
                obj.updateProjectionMatrix();
                break;
        }

        if (isSetControlsParam)
            appInstance.enableControls();

    });
}

function matGetValues(matName) {

    var mat = v3d.SceneUtils.getMaterialByName(appInstance, matName);
    if (!mat)
        return [];

    if (mat.isMeshNodeMaterial)
        return Object.keys(mat.nodeValueMap);
    else if (mat.isMeshStandardMaterial)
        return ['metalness', 'roughness', 'bumpScale', 'emissiveIntensity', 'envMapIntensity'];
    else
        return [];
}

// setMaterialValue puzzle
function setMaterialValue(matName, valName, value) {

    var values = matGetValues(matName);
    if (values.indexOf(valName) < 0)
        return;

    var mats = v3d.SceneUtils.getMaterialsByName(appInstance, matName);

    for (var i = 0; i < mats.length; i++) {
        var mat = mats[i];

        if (mat.isMeshNodeMaterial) {
            var valIdx = mat.nodeValueMap[valName];
            mat.nodeValue[valIdx] = Number(value);
        } else
            mat[valName] = Number(value);

        if (appInstance.scene !== null) {
            if (mat === appInstance.scene.worldMaterial) {
                appInstance.updateEnvironment(mat);
            }
        }
    }
}

// setInterval puzzle
function registerInterval(timeout, callback) {
    var timerId = window.setInterval(function() { callback(timerId) }, 1000 * timeout);
}


if (isObjectVisible('Diamond')) {
  autoRotateCamera(true, 2);
  setCameraParam('FIELD_OF_VIEW', 'Camera', 50);
}

registerInterval(2, function() {
  setMaterialValue('Verge3D_Environment_World', 'Value', Math.min(Math.max(Math.random(), 0), 1));
});



} // end of PL.init function

})(); // end of closure

/* ================================ end of code ============================= */
