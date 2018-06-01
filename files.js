const raw = v => v.rawValue()
const rtm = v => v.runtimeValue()

let mb = $objc("NSBundle").invoke('mainBundle')
let path = mb.invoke('bundlePath')
let NSFileManager = $objc("NSFileManager").invoke('defaultManager')
let NSDirectoryEnumerator = $objc("NSDirectoryEnumerator")
let dir = NSFileManager.invoke('enumeratorAtPath:', path)

while (dir.invoke('nextObject')) {
    let file = raw(dir.invoke('nextObject'))
    let testPath = path.invoke('stringByAppendingPathComponent:', file)
    let _string = $objc("NSString").invoke('stringWithContentsOfFile:encoding:error:', testPath, rtm('').invoke('NSUTF8StringEncoding'), null);
    console.log([file, raw(_string)])
}