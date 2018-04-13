let NSBundle = $objc('NSBundle');
NSBundle.invoke('bundleWithPath:', '/System/Library/Frameworks/ARKit.framework').invoke('load');
NSBundle.invoke('bundleWithPath:', '/System/Library/Frameworks/SpriteKit.framework').invoke('load');
let rootViewController = $objc("UIApplication").invoke("sharedApplication").invoke("keyWindow").invoke("rootViewController");
let topNavigationController = () => rootViewController.invoke("topViewController.navigationController");

const w = $device.info.screen.width;
const h = $device.info.screen.height;
const ARWorldAlignmentGravity = 0;
const ARWorldAlignmentGravityAndHeading = 1;
const ARWorldAlignmentCamera = 2;
const ARPlaneDetectionNone = 0;
const ARPlaneDetectionHorizontal = 1 << 0;
const ARPlaneDetectionVertical = 1 << 1;
const ARSCNDebugOptionNone = 0;
const ARSCNDebugOptionShowWorldOrigin = 1 << 0;
const ARSCNDebugOptionShowFeaturePoints = 1 << 1;

let UIViewController = $objc('UIViewController');

// let SKView = $objc('SKView');
// let SKScene = $objc('SKScene');
// let SKShapeNode = $objc('SKShapeNode');
// let SKPhysicsBody = $objc('SKPhysicsBody');
// let ARSKView = $objc("ARSKView");

let SCNScene = $objc('SCNScene');
let SCNBox = $objc("SCNBox");
let SCNNode = $objc("SCNNode");
let ARSCNView = $objc('ARSCNView');
let ARWorldTrackingConfiguration = $objc('ARWorldTrackingConfiguration');
let ARSession = $objc('ARSession');
let ARPlaneAnchor = $objc('ARPlaneAnchor');
let scene = SCNScene.invoke('scene');
let node = createCubeNode(0.1, 0.1, 0.1, 0);
scene.invoke('rootNode').invoke('addChildNode:', node);

function createCubeNode(parm) {
    let cube = SCNBox.invoke('boxWithWidth:height:length:chamferRadius:', ...arguments);
    let node = SCNNode.invoke('nodeWithGeometry:', cube);
    return node;
}

function createARSceneView(x, y, w, h) {
    let v = ARSCNView.invoke('alloc').invoke('initWithFrame:', $rect(x, y, w, h));
    v.invoke('setShowsStatistics:', true);
    v.invoke('setDebugOptions:', ARSCNDebugOptionShowWorldOrigin | ARSCNDebugOptionShowFeaturePoints);
    return v;
}

let sceneview = createARSceneView(0, 0, w, h);
sceneview.invoke('setScene', scene);
// $ui.alert(sceneview.invoke('debugOptions'));

let btn = {
    type: "button",
    props: {
        bgcolor: $rgba(255, 255, 255, 0)
    },
    layout: make => {
        make.top.left.inset(0);
        make.size.equalTo($size(100, 55));
    },
    events: {
        tapped: () => myVC.invoke("dismissViewControllerAnimated:completion:", 'YES', null)
    }
};


let myVC = UIViewController.invoke("alloc.init");
myVC.invoke("view").invoke("addSubview", sceneview);
sceneview.rawValue().add(btn);
topNavigationController().invoke("presentViewController:animated:completion:", myVC, 'NO', null);
let configuration = ARWorldTrackingConfiguration.invoke('alloc.init');
configuration.invoke('setPlaneDetection:', ARPlaneDetectionHorizontal);
configuration.invoke('setWorldAlignment:', ARWorldAlignmentGravityAndHeading);
let session = sceneview.invoke('session');
session.invoke('runWithConfiguration:', configuration);
