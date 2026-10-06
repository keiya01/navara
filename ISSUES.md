# 未解決の問題

`feat/polygon-polyline-mesh-desc` の作業中（2026-10-02）に見つかり、まだ対応していない問題の一覧。

## 1. raster-dem hillshade の法線の南北が反転している

- **場所:** `shaders/glsl/chunks/hillshade_pars_fragment.glsl` の `computeNormalFromDEM`
- **内容:** グリッドの `uv + texelSize.y` 側（a, b, c）を北とみなして `dY = (g+2h+i) − (a+2b+c)` を計算している。DEM テクスチャは上から下に並ぶ（`hillshadeNormalMapGenerator.ts` が `uv.y = 1.0 - uv.y` でそう扱っている）ので、+v は南になる。そのため法線の北成分が逆になる。東西成分は正しい。
- **影響:**
  - hillshade を使う地形の陰影が、太陽の南北位置に対して逆になる（南から日が当たっても南斜面が暗い）。
  - 地形の法線を使う drape（Box/Cylinder/Polygon）と ground polyline（`useGroundNormals`）も同じく逆向きになる。
- **確認方法:** quantized-mesh（`requestVertexNormals`）の頂点法線と、法線の符号を東・北・カメラ向きの 0/1 で比較した。東西は一致し、南北だけが逆だった。`dY` の符号を反転すると、quantized-mesh と同じ滑らかで正しい陰影になった。
- **修正案:** `dY = (a+2b+c) − (g+2h+i)` にし、グリッドのコメントを「+v は南」に直す。hillshade を使う全ての地形の見た目が変わるので、見た目の確認が必要。

## 2. hillshade の勾配が実際の 2 倍になっている

- **場所:** 1 と同じ `computeNormalFromDEM`
- **内容:** Sobel の重み合計は 4、差分は 2 テクセル幅なので、勾配は `dX / (8·metersPerTexel)` になるはずだが、`/4` で割っている。`exaggeration: 1`（ドキュメント上は等倍）でも斜面が 2 倍急に見える。
- **修正案:** 除数を `/8` にする。hillshade の陰影が今より柔らかくなるので、見た目として許容できるかの判断が必要。

## 3. drape した水面ポリゴンの波の模様が地表に沿わない

- **場所:** `polygonWaterEnhancer/shader.ts` の `computeWaterSpecular`
- **内容:** 波の法線マップの座標に `vPosition`（ボリュームの面の位置）を使っているので、drape 中は模様が地表の位置と一致しない。

## 4. drape と ground polyline で、point/spot ライトの影と envMap がボリュームの位置を使う

- **場所:** `web/navara_three/src/mesh/DrapedMesh.ts`、`shaders/glsl/chunks/ground_shadow_coord_fragment.glsl`
- **内容:** 地表点に差し替えているのは、方向光（CSM）の影座標と `vViewPosition` だけ。point/spot の影座標（`vPointShadowCoord`、`vSpotLightCoord`）と envMap（`vWorldPosition`）はボリュームの面の位置のままなので、重なった面ごとに結果が変わる。方向光と同じように、フラグメントで `pointShadowMatrix` / `spotLightMatrix` を参照して地表点から計算すれば直せる。

## 5. 地形が法線を書かない構成での drape の陰影

- **内容:** 法線のフォールバックは廃止した。地形が法線を書かない構成（hillshade なしの raster-dem など）では、法線バッファの未書き込みのピクセルが (0,0) なので、カメラ向きの法線 (0,0,1) として読まれ、drape はカメラから照らしたような陰影になる。そうした構成では法線を使う機能を有効にしない前提。必要なら、地形が法線を書いているかで drape の法線差し替え自体を切り替える仕組みを検討する。

## 6. pick 用のレンダーターゲットが画面と同じサイズで確保されている

- **場所:** `web/navara_three/src/pick/pickHelper.ts`
- **内容:** `pickRenderTarget` は描画バッファと同じサイズで確保され、実際に使うのは pick 窓（scissor）の数十ピクセルだけ。stencil を有効にしたこととは無関係だが、モバイルのメモリを詰めるなら窓サイズのターゲットにできる。
- **縮小するときの注意:** drape の pick で globe depth を書き込むシェーダ（`createGlobeDepthScene`）と、ground polyline の深度の読み出しは、`gl_FragCoord` をそのまま globe depth のテクスチャ座標に使っている。ターゲットを窓サイズにするなら、窓のオフセットを足してテクスチャ座標を出す必要がある。
