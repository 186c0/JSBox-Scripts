let NSBundle = $objc('NSBundle');
let ARKit = NSBundle.invoke('bundleWithPath:', '/System/Library/Frameworks/ARKit.framework');
let SpriteKit = NSBundle.invoke('bundleWithPath:', '/System/Library/Frameworks/SpriteKit.framework');
ARKit.invoke('load');
SpriteKit.invoke('load');

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

let SKView = $objc('SKView');
let SKScene = $objc('SKScene');
let SKShapeNode = $objc('SKShapeNode');
let SKPhysicsBody = $objc('SKPhysicsBody');
let ARSKView = $objc("ARSKView");

let SCNScene = $objc('SCNScene');
let ARSCNView = $objc('ARSCNView');
let ARWorldTrackingConfiguration = $objc('ARWorldTrackingConfiguration');
let ARSession = $objc('ARSession');
let UIViewController = $objc('UIViewController');
let ARPlaneAnchor = $objc('ARPlaneAnchor');

let scene = SCNScene.invoke('scene');

function createARSceneView(x, y, w, h) {
    let v = ARSCNView.invoke('alloc').invoke('initWithFrame:', $rect(x, y, w, h));
    v.invoke('setShowsStatistics:', true);
    v.invoke('setDebugOptions:', ARSCNDebugOptionShowWorldOrigin | ARSCNDebugOptionShowFeaturePoints);
    return v;
}

let sceneview = createARSceneView(0, 0, w, h - 77);
sceneview.invoke('setScene', scene);
// $ui.alert(sceneview.invoke('debugOptions'));
let rootVC = $objc("UIApplication").invoke("sharedApplication").invoke("keyWindow").invoke("rootViewController");
let navVC = rootVC.invoke("topViewController.navigationController");
let myVC = UIViewController.invoke("alloc.init");
myVC.invoke("view").invoke("addSubview", sceneview);
navVC.invoke("pushViewController:animated", myVC, false);
let configuration = ARWorldTrackingConfiguration.invoke('alloc.init');
configuration.invoke('setPlaneDetection:', ARPlaneDetectionHorizontal);
configuration.invoke('setWorldAlignment:', ARWorldAlignmentGravityAndHeading);
let session = sceneview.invoke('session');
session.invoke('runWithConfiguration:', configuration);