import type { ExampleMeta } from "../../sections";

export default {
  section: "interaction",
  order: 7,
  title: { en: "Draw polygons", ja: "ポリゴンの作図" },
  description: {
    en: "Click to draw a polygon with PolygonMesh and PolylineMesh, then raise it with the mouse.",
    ja: "クリックで PolygonMesh と PolylineMesh のポリゴンを描き、マウスで高さを付ける。",
  },
  docs: "three_default_descs/mesh-desc/polygon-mesh-desc",
} satisfies ExampleMeta;
