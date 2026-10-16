import AppKit
import Foundation

// Renders SF Symbols to 3x PNG masks. Args: name:size:weight ...  -> JSON on stdout
let weights: [String: NSFont.Weight] = ["ultralight": .ultraLight, "thin": .thin, "light": .light, "regular": .regular, "medium": .medium, "semibold": .semibold, "bold": .bold, "heavy": .heavy, "black": .black]
var out: [String: [String: Any]] = [:]
for arg in CommandLine.arguments.dropFirst() {
  let parts = arg.split(separator: ":").map(String.init)
  guard parts.count >= 3, let size = Double(parts[1]), let w = weights[parts[2]] else { continue }
  let scaleName = parts.count > 3 ? parts[3] : "medium"
  let scale: NSImage.SymbolScale = scaleName == "small" ? .small : scaleName == "large" ? .large : .medium
  let cfg = NSImage.SymbolConfiguration(pointSize: size, weight: w, scale: scale)
  guard let base = NSImage(systemSymbolName: parts[0], accessibilityDescription: nil), let img = base.withSymbolConfiguration(cfg) else {
    FileHandle.standardError.write("missing \(parts[0])\n".data(using: .utf8)!); continue
  }
  let sz = img.size
  let k: CGFloat = 3
  let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: Int(ceil(sz.width * k)), pixelsHigh: Int(ceil(sz.height * k)), bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
  rep.size = sz
  NSGraphicsContext.saveGraphicsState()
  NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
  img.draw(in: NSRect(origin: .zero, size: sz))
  NSGraphicsContext.restoreGraphicsState()
  let png = rep.representation(using: .png, properties: [:])!
  // ink bounds (alpha > 50%) in points
  var minX = Int.max, minY = Int.max, maxX = -1, maxY = -1
  for y in 0 ..< rep.pixelsHigh {
    for x in 0 ..< rep.pixelsWide {
      if let c = rep.colorAt(x: x, y: y), c.alphaComponent > 0.5 {
        minX = min(minX, x); maxX = max(maxX, x); minY = min(minY, y); maxY = max(maxY, y)
      }
    }
  }
  let ink: [Double] = maxX < 0 ? [0, 0, 0, 0] : [Double(minX) / 3, Double(minY) / 3, Double(maxX - minX + 1) / 3, Double(maxY - minY + 1) / 3]
  out[arg] = ["w": Double(sz.width), "h": Double(sz.height), "ink": ink, "png": png.base64EncodedString()]
}

let data = try! JSONSerialization.data(withJSONObject: out, options: [.sortedKeys])
FileHandle.standardOutput.write(data)
