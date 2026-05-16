/**
 * Re-applies the R3F guard to @emergentbase/visual-edits after npm install.
 * Prevents x-file-name attrs on Three.js primitives (breaks R3F applyProps).
 */
const fs = require("fs");
const path = require("path");

const target = path.join(
  __dirname,
  "../node_modules/@emergentbase/visual-edits/dist/babel-plugin/index.js"
);

if (!fs.existsSync(target)) {
  process.exit(0);
}

let src = fs.readFileSync(target, "utf8");

if (src.includes("function isR3FThreePrimitive")) {
  process.exit(0);
}

const helper = `function isInsideR3FCanvas(jsxPath, t) {
  return !!jsxPath.findParent((p) => {
    if (!p.isJSXElement()) return false;
    const n = p.node.openingElement?.name;
    if (t.isJSXIdentifier(n)) return n.name === "Canvas";
    if (t.isJSXMemberExpression(n)) return n.property?.name === "Canvas";
    return false;
  });
}
var THREE_JS_PRIMITIVES = /* @__PURE__ */ new Set(["primitive"]);
try {
  const THREE = require("three");
  Object.keys(THREE).forEach((key) => {
    if (/^[A-Z]/.test(key) && typeof THREE[key] === "function") {
      THREE_JS_PRIMITIVES.add(key.charAt(0).toLowerCase() + key.slice(1));
    }
  });
} catch (_err) {
  [
    "mesh",
    "group",
    "points",
    "line",
    "lineSegments",
    "sprite",
    "ambientLight",
    "directionalLight",
    "pointLight",
    "spotLight",
    "hemisphereLight",
    "icosahedronGeometry",
    "boxGeometry",
    "sphereGeometry",
    "meshStandardMaterial",
    "pointsMaterial"
  ].forEach((n) => THREE_JS_PRIMITIVES.add(n));
}
function isR3FThreePrimitive(name) {
  return !!name && THREE_JS_PRIMITIVES.has(name);
}
`;

src = src.replace(
  /function isPortalishName\(name\) \{[\s\S]*?return RADIX_ROOTS\.has\(name\) \|\| PORTAL_SUFFIX_RE\.test\(name\);\n\}/,
  (m) => m + "\n" + helper
);

src = src.replace(
  `    if (!/^[A-Z]/.test(elementName)) {
      if (hasProp(openingElement, ATTRS.EXCLUDED)) {`,
  `    if (!/^[A-Z]/.test(elementName)) {
      if (isR3FThreePrimitive(elementName) || isInsideR3FCanvas(jsxPath, t)) return;
      if (hasProp(openingElement, ATTRS.EXCLUDED)) {`
);

src = src.replace(
  `    if (elementName === "Fragment") {
      return;
    }
    if (/^[A-Z]/.test(elementName)) {`,
  `    if (elementName === "Fragment") {
      return;
    }
    if (isR3FThreePrimitive(elementName) || isInsideR3FCanvas(jsxPath, t)) {
      return;
    }
    if (/^[A-Z]/.test(elementName)) {`
);

fs.writeFileSync(target, src);
console.log("[patch-visual-edits-r3f] R3F Three.js primitive guard applied.");
