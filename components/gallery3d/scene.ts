import * as THREE from "three";

// Masse aus der Vorgabe: zwei feste Rahmenformate (Hoch 1.36 x 1.813, Quer 1.813 x 1.36)
const FRAME_SHORT = 1.36;
const FRAME_LONG = 1.813;
const FRAME_Y = 1.95; // Rahmenmitte
const BORDER = 0.035; // schwarze Leiste rund um das Passepartout
const MAT = 0.07; // Breite des Passepartouts
const MAT_COLOR = 0x161514;
const CAM_Y = 1.92;
const WALK_YAW = 0.3; // positiv = nach innen gedreht
const WALK_PITCH = -0.12;
const STEP = (2 * Math.PI) / 36;
const WHEEL_K = 0.0016;
const DRAG_K = 0.0022;
const DRAG_K_TOUCH = 0.0042;
const TAU = 0.36;
const GLIDE_MS = 950;
const RETURN_MS = 650;
// Begrenzter Gang: Stirnwand bei WALL_ANGLE, Start direkt davor, Ende eine Runde weiter
const WALL_ANGLE = 0.4;
const START_ARC = 1.2; // Meter (Bogen) zwischen Stirnwand und Startposition
// Meter zwischen Endposition und Stirnwand, damit die letzten Bilder im Blick bleiben
// (Hochformat hat ein schmaleres Blickfeld und braucht mehr Abstand)
const END_ARC = 7.5;
const END_ARC_PORTRAIT = 13;
const END_MARGIN = 0.9; // Meter Wand zwischen Stirnwand und dem Bereich mit Rahmen
const EDGE_EPS = 0.004;
const EDGE_DELAY = 350; // ms Ruhe am Rand, bevor weitere Eingaben die Seite bewegen
const DRAG_EXIT_PX = 60;

export type RingConfig = {
  outer: number;
  inner: number;
  height: number;
  camRadius: number;
  fogNear: number;
  fogFar: number;
  /** angestrebte Lücke zwischen zwei Rahmen (Meter); daraus ergibt sich die Rahmenzahl */
  targetGap: number;
};

export type SceneImage = { tex: string; w: number; h: number };

export const RINGS: Record<"work" | "world", RingConfig> = {
  work: { outer: 18, inner: 12.2, height: 6.2, camRadius: 15.6, fogNear: 10, fogFar: 46, targetGap: 2 },
  // Kleinerer Ring für 12 Bilder: alles mit 0.75 skaliert, damit die Innenwand
  // im gleichen Verhältnis im Blickfeld bleibt wie bei Work.
  world: {
    outer: 13.5,
    inner: 9.15,
    height: 6.2,
    camRadius: 11.7,
    fogNear: 10,
    fogFar: 46,
    // grössere Lücke: jedes Bild hängt zweimal, der Gang wirkt luftig statt repetitiv
    targetGap: 3.6,
  },
};

export type SceneCallbacks = {
  onFocusChange: (imageIndex: number | null) => void;
  onOpen: (imageIndex: number) => void;
  onFirstTexture?: () => void;
  /** Kamera steht am Anfang / Ende des Gangs */
  onEdge?: (s: { atStart: boolean; atEnd: boolean }) => void;
  /** Weitere Eingabe am Ende: Seite zum nächsten Abschnitt scrollen */
  onExit?: () => void;
};

type Pose = { theta: number; r: number; yaw: number; pitch: number };
type Slot = {
  angle: number;
  wall: "outer" | "inner";
  image: number;
  /** Aussenmass inkl. Leiste */
  fw: number;
  fh: number;
};
type Mode = "walk" | "glide" | "focus" | "return";

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const wrapPi = (a: number) => {
  a = (a + Math.PI) % (2 * Math.PI);
  if (a < 0) a += 2 * Math.PI;
  return a - Math.PI;
};

export class GalleryScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private raycaster = new THREE.Raycaster();
  private slots: Slot[] = [];
  private materials: THREE.MeshBasicMaterial[] = [];
  private textures: (THREE.Texture | null)[] = [];
  private disposables: { dispose: () => void }[] = [];
  private ro: ResizeObserver;

  private pose: Pose;
  private target: number;
  private mode: Mode = "walk";
  private glideFrom: Pose | null = null;
  private glideTo: Pose | null = null;
  private glideDelta = 0;
  private glideStart = 0;
  private glideMs = 0;
  private focusedSlot: Slot | null = null;

  private thetaStart: number;
  private thetaEnd: number;
  private edge: { atStart: boolean; atEnd: boolean } | null = null;
  private edgeSince = 0;
  private exitLock = 0;

  private active = false;
  private raf = 0;
  private last = 0;
  private dirty = true;
  private texturesRequested = false;
  private disposed = false;

  private pointer: {
    id: number;
    x: number;
    y: number;
    sx: number;
    sy: number;
    type: string;
    dragging: boolean;
    overflow: number;
  } | null = null;

  constructor(
    private container: HTMLElement,
    private images: SceneImage[],
    private ring: RingConfig,
    private cb: SceneCallbacks,
    private reducedMotion: boolean,
  ) {
    this.renderer = new THREE.WebGLRenderer({
      antialias: window.devicePixelRatio < 2,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(0x0a0a0a, 1);
    const canvas = this.renderer.domElement;
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.touchAction = "pan-y";
    canvas.setAttribute("aria-hidden", "true");
    container.appendChild(canvas);

    this.camera = new THREE.PerspectiveCamera(56, 1, 0.05, 120);
    this.scene.fog = new THREE.Fog(0x0a0a0a, ring.fogNear, ring.fogFar);
    this.scene.background = new THREE.Color(0x0a0a0a);

    this.thetaStart = WALL_ANGLE - START_ARC / ring.camRadius;
    this.thetaEnd = WALL_ANGLE - 2 * Math.PI + END_ARC / ring.camRadius;
    this.pose = { theta: this.thetaStart, r: ring.camRadius, yaw: WALK_YAW, pitch: WALK_PITCH };
    this.target = this.thetaStart;

    this.buildRoom();
    this.buildFrames();

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(container);
    this.resize();

    canvas.addEventListener("wheel", this.onWheel, { passive: false });
    canvas.addEventListener("pointerdown", this.onPointerDown);
    canvas.addEventListener("pointermove", this.onPointerMove);
    canvas.addEventListener("pointerup", this.onPointerUp);
    canvas.addEventListener("pointercancel", this.onPointerCancel);
    canvas.addEventListener("pointerleave", this.onPointerLeave);
  }

  // ---------- Aufbau ----------

  private buildRoom() {
    const { outer, inner, height } = this.ring;
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x1a1918, roughness: 0.95 });
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x0e0e0e, roughness: 0.55 });
    const ceilMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 1 });

    const outerGeo = new THREE.CylinderGeometry(outer, outer, height, 160, 1, true);
    const outerWall = new THREE.Mesh(outerGeo, wallMat.clone());
    (outerWall.material as THREE.Material).side = THREE.BackSide;
    outerWall.position.y = height / 2;

    const innerGeo = new THREE.CylinderGeometry(inner, inner, height, 120, 1, true);
    const innerWall = new THREE.Mesh(innerGeo, wallMat);
    innerWall.position.y = height / 2;

    const floorGeo = new THREE.RingGeometry(inner, outer, 160, 1);
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;

    const ceil = new THREE.Mesh(floorGeo, ceilMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = height;

    // Stirnwand: Anfang und Ende des Gangs
    const endGeo = new THREE.PlaneGeometry(outer - inner + 0.02, height);
    const endMat = wallMat.clone();
    endMat.side = THREE.DoubleSide;
    const endWall = new THREE.Mesh(endGeo, endMat);
    const mid = (outer + inner) / 2;
    endWall.position.set(mid * Math.cos(WALL_ANGLE), height / 2, mid * Math.sin(WALL_ANGLE));
    endWall.rotation.y = -WALL_ANGLE;
    this.disposables.push(endGeo, endMat);

    this.scene.add(outerWall, innerWall, floor, ceil, endWall);
    this.scene.add(new THREE.HemisphereLight(0xf5f0e8, 0x0a0a0a, 0.9));

    const lamp = new THREE.PointLight(0xf5f0e8, 14, 18, 1.5);
    lamp.position.set(0, 1.4, 0);
    this.camera.add(lamp);
    this.scene.add(this.camera);

    this.disposables.push(
      outerGeo,
      innerGeo,
      floorGeo,
      wallMat,
      outerWall.material as THREE.Material,
      floorMat,
      ceilMat,
    );
  }

  /** Passepartout-Format aus den echten Bildmassen: Breite > Höhe = quer, sonst hoch. */
  private frameSize(i: number) {
    const { w, h } = this.images[i];
    return w > h ? { mw: FRAME_LONG, mh: FRAME_SHORT } : { mw: FRAME_SHORT, mh: FRAME_LONG };
  }

  /** Bilder auf Aussen- und Innenwand verteilen (abwechselnd, in Laufrichtung). */
  private assignWalls(Lo: number, Li: number) {
    const n = this.images.length;
    let avg = 0;
    for (let i = 0; i < n; i++) avg += this.frameSize(i).mw + 2 * BORDER;
    avg /= n;
    const pitch = avg + this.ring.targetGap;
    // Gesamtzahl als Vielfaches der Bildanzahl, damit jedes Bild gleich oft hängt
    const reps = Math.max(1, Math.round((Lo + Li) / pitch / n));
    const total = reps * n;
    const no = Math.round((total * Lo) / (Lo + Li));
    const ni = total - no;
    const outerSeq: number[] = [];
    const innerSeq: number[] = [];
    for (let k = 0; k < total; k++) {
      const img = k % n;
      if (ni === 0 || (no > 0 && outerSeq.length / no <= innerSeq.length / ni)) outerSeq.push(img);
      else innerSeq.push(img);
    }
    return { outerSeq, innerSeq };
  }

  private buildFrames() {
    const { outer, inner } = this.ring;

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.6 });
    const matMat = new THREE.MeshBasicMaterial({ color: MAT_COLOR });
    this.disposables.push(frameMat, matMat);

    // Geometrien nach Grösse wiederverwenden
    const geoCache = new Map<string, THREE.BufferGeometry>();
    const geo = (kind: "box" | "plane", w: number, h: number) => {
      const key = `${kind}:${w.toFixed(4)}:${h.toFixed(4)}`;
      let g = geoCache.get(key);
      if (!g) {
        g = kind === "box" ? new THREE.BoxGeometry(w, h, 0.05) : new THREE.PlaneGeometry(w, h);
        geoCache.set(key, g);
        this.disposables.push(g);
      }
      return g;
    };

    this.materials = this.images.map(() => {
      const m = new THREE.MeshBasicMaterial({ color: 0x1c1c1c });
      this.disposables.push(m);
      return m;
    });
    this.textures = this.images.map(() => null);

    // Bild vollständig (contain) innerhalb des Passepartouts
    const imageSize = (i: number) => {
      const { mw, mh } = this.frameSize(i);
      const aw = mw - 2 * MAT;
      const ah = mh - 2 * MAT;
      const a = this.images[i].w / this.images[i].h;
      return a > aw / ah ? { iw: aw, ih: aw / a } : { iw: ah * a, ih: ah };
    };

    const usable = (R: number) => 2 * Math.PI * R - 2 * END_MARGIN;
    const { outerSeq, innerSeq } = this.assignWalls(usable(outer), usable(inner));

    // Innenwand um einen halben Schritt versetzt: aussen endet der Bereich früher, innen beginnt er später
    const half = Math.PI / Math.max(1, outerSeq.length + 0.5);

    const layout = (seq: number[], R: number, wall: "outer" | "inner") => {
      const shift = half * R;
      const L = usable(R) - shift;
      const widths = seq.map((i) => this.frameSize(i).mw + 2 * BORDER);
      const sum = widths.reduce((a, b) => a + b, 0);
      // gleichmässige Lücke: jeder Rahmen bekommt seine Breite plus eine Lücke (halb davor, halb danach)
      const gap = Math.max(0.3, (L - sum) / Math.max(1, seq.length));
      let pos = END_MARGIN + (wall === "inner" ? shift : 0) + gap / 2;
      seq.forEach((image, k) => {
        const fw = widths[k];
        const center = pos + fw / 2;
        pos += fw + gap;
        const angle = WALL_ANGLE - center / R;
        this.addFrame(image, angle, wall, R, fw, geo, frameMat, matMat, imageSize(image));
      });
    };
    layout(outerSeq, outer, "outer");
    layout(innerSeq, inner, "inner");
  }

  private addFrame(
    image: number,
    angle: number,
    wall: "outer" | "inner",
    R: number,
    fw: number,
    geo: (kind: "box" | "plane", w: number, h: number) => THREE.BufferGeometry,
    frameMat: THREE.Material,
    matMat: THREE.Material,
    size: { iw: number; ih: number },
  ) {
    const { mw, mh } = this.frameSize(image);
    const fh = mh + 2 * BORDER;
    // an der konkaven Aussenwand so weit abrücken, dass die Ecken nicht in die Wand ragen
    const inset = 0.045 + (wall === "outer" ? (fw / 2) ** 2 / (2 * R) : 0);
    const radius = wall === "outer" ? R - inset : R + inset;
    const group = new THREE.Group();
    group.position.set(radius * Math.cos(angle), FRAME_Y, radius * Math.sin(angle));
    if (wall === "outer") group.lookAt(0, FRAME_Y, 0);
    else group.lookAt(group.position.x * 2, FRAME_Y, group.position.z * 2);

    const frame = new THREE.Mesh(geo("box", fw, fh), frameMat);
    const mat = new THREE.Mesh(geo("plane", mw, mh), matMat);
    mat.position.z = 0.026;
    const pic = new THREE.Mesh(geo("plane", size.iw, size.ih), this.materials[image]);
    pic.position.z = 0.03;
    group.add(frame, mat, pic);
    this.scene.add(group);

    const slot: Slot = { angle, wall, image, fw, fh };
    frame.userData.slot = slot;
    mat.userData.slot = slot;
    pic.userData.slot = slot;
    this.slots.push(slot);
  }

  // ---------- Texturen ----------

  loadTextures() {
    if (this.texturesRequested) return;
    this.texturesRequested = true;
    const loader = new THREE.TextureLoader();
    const maxAniso = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());

    // Bilder in der Nähe der Kamera zuerst
    const order = this.images
      .map((_, i) => {
        let best = Infinity;
        for (const s of this.slots) {
          if (s.image !== i) continue;
          best = Math.min(best, Math.abs(wrapPi(s.angle - (this.pose.theta - 0.5))));
        }
        return { i, best };
      })
      .sort((a, b) => a.best - b.best)
      .map((o) => o.i);

    let next = 0;
    let first = true;
    const worker = async () => {
      while (next < order.length && !this.disposed) {
        const i = order[next++];
        try {
          const tex = await loader.loadAsync(this.images[i].tex);
          if (this.disposed) {
            tex.dispose();
            return;
          }
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = maxAniso;
          // Bildfläche hat schon das Seitenverhältnis des Bildes: kein Zuschnitt
          this.textures[i] = tex;
          const m = this.materials[i];
          m.map = tex;
          m.color.set(0xffffff);
          m.needsUpdate = true;
          this.dirty = true;
          if (first) {
            first = false;
            this.cb.onFirstTexture?.();
          }
        } catch {
          // Bild fehlt: Rahmen bleibt dunkel
        }
      }
    };
    for (let w = 0; w < 4; w++) void worker();
  }

  // ---------- Kamera ----------

  private applyPose() {
    const { theta, r, yaw, pitch } = this.pose;
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    // Laufrichtung = abnehmender Winkel
    const tx = s;
    const tz = -c;
    const ix = -c;
    const iz = -s;
    const hx = tx * Math.cos(yaw) + ix * Math.sin(yaw);
    const hz = tz * Math.cos(yaw) + iz * Math.sin(yaw);
    const px = r * c;
    const pz = r * s;
    this.camera.position.set(px, CAM_Y, pz);
    this.camera.lookAt(
      px + hx * Math.cos(pitch),
      CAM_Y + Math.sin(pitch),
      pz + hz * Math.cos(pitch),
    );
  }

  private focusPose(slot: Slot): Pose {
    const { outer, inner } = this.ring;
    const vfov = THREE.MathUtils.degToRad(this.camera.fov);
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * this.camera.aspect);
    // tatsächliche Rahmengrösse (Hoch- oder Querformat) mit etwas Luft ins Bild holen
    let d = Math.max(
      (slot.fh * 1.18) / 2 / Math.tan(vfov / 2),
      (slot.fw * 1.12) / 2 / Math.tan(hfov / 2),
    );
    d = THREE.MathUtils.clamp(d, 1.3, outer - inner - 0.5);
    const r = slot.wall === "outer" ? outer - d : inner + d;
    const pitch = Math.atan2(FRAME_Y - CAM_Y, d);
    return {
      theta: slot.angle,
      r,
      yaw: slot.wall === "outer" ? -Math.PI / 2 : Math.PI / 2,
      pitch,
    };
  }

  private startGlide(to: Pose, ms: number, mode: Mode) {
    this.glideFrom = { ...this.pose };
    this.glideTo = to;
    // kürzester Winkelweg
    this.glideDelta = wrapPi(to.theta - this.pose.theta);
    this.glideStart = performance.now();
    this.glideMs = this.reducedMotion ? 0 : ms;
    this.mode = mode;
    this.dirty = true;
  }

  private glideToSlot(slot: Slot) {
    this.focusedSlot = slot;
    this.startGlide(this.focusPose(slot), GLIDE_MS, "glide");
    this.cb.onFocusChange(slot.image);
  }

  /** Zurück in den Gang (Laufposition am aktuellen Winkel). */
  back() {
    if (this.mode === "walk" || this.mode === "return") return;
    this.focusedSlot = null;
    this.target = this.clamp(this.pose.theta);
    this.startGlide(
      { theta: this.pose.theta, r: this.ring.camRadius, yaw: WALK_YAW, pitch: WALK_PITCH },
      RETURN_MS,
      "return",
    );
    this.cb.onFocusChange(null);
  }

  step(dir: 1 | -1) {
    if (dir === 1 && this.isAt("end")) {
      if (this.isAt("end", true)) this.exit();
      return;
    }
    this.back();
    this.target = this.clamp(this.target - dir * STEP);
    this.dirty = true;
  }

  private clamp(t: number) {
    return Math.min(this.thetaStart, Math.max(this.thetaEnd, t));
  }

  /** Kamera steht ruhig am Rand (und das schon lange genug). */
  private isAt(which: "start" | "end", settled = false) {
    if (this.mode !== "walk") return false;
    const limit = which === "start" ? this.thetaStart : this.thetaEnd;
    const at = Math.abs(this.pose.theta - limit) < EDGE_EPS && Math.abs(this.target - limit) < EDGE_EPS;
    return at && (!settled || performance.now() - this.edgeSince > EDGE_DELAY);
  }

  private exit() {
    const now = performance.now();
    if (now < this.exitLock) return;
    this.exitLock = now + 1200;
    this.cb.onExit?.();
  }

  /** Nach der grossen Ansicht: zum nächstgelegenen Rahmen mit diesem Bild gleiten. */
  focusImage(image: number) {
    if (this.focusedSlot?.image === image) return;
    let best: Slot | null = null;
    let bd = Infinity;
    for (const s of this.slots) {
      if (s.image !== image) continue;
      const d = Math.abs(wrapPi(s.angle - this.pose.theta));
      if (d < bd) {
        bd = d;
        best = s;
      }
    }
    if (best) this.glideToSlot(best);
  }

  openFocused() {
    if (this.focusedSlot && this.mode === "focus") this.cb.onOpen(this.focusedSlot.image);
  }

  // ---------- Eingabe ----------

  private onWheel = (e: WheelEvent) => {
    const scale = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
    const dy = e.deltaY * scale;
    if (Math.abs(dy) < Math.abs(e.deltaX * scale) || dy === 0) return;
    // Anfang + Rad nach oben: Seite scrollt normal zurück
    if (dy < 0 && this.isAt("start", true)) return;
    e.preventDefault();
    // Ende + Rad nach unten: weiter zum nächsten Abschnitt
    if (dy > 0 && this.isAt("end")) {
      if (this.isAt("end", true)) this.exit();
      return;
    }
    this.back();
    this.target = this.clamp(this.target - dy * WHEEL_K);
    this.dirty = true;
  };

  private onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    this.pointer = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      sx: e.clientX,
      sy: e.clientY,
      type: e.pointerType,
      dragging: false,
      overflow: 0,
    };
  };

  private onPointerMove = (e: PointerEvent) => {
    const p = this.pointer;
    if (!p || p.id !== e.pointerId) {
      if (e.pointerType === "mouse") this.updateHover(e);
      return;
    }
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    if (!p.dragging && Math.hypot(e.clientX - p.sx, e.clientY - p.sy) > 5) {
      p.dragging = true;
      try {
        this.renderer.domElement.setPointerCapture(e.pointerId);
      } catch {
        // Pointer schon weg (z. B. vom Browser abgebrochen): ohne Capture weiter
      }
      this.renderer.domElement.style.cursor = "grabbing";
      this.back();
    }
    if (p.dragging) {
      const touch = p.type !== "mouse";
      // Touch: nur horizontal, damit die Seite vertikal scrollbar bleibt
      const d = touch ? dx : Math.abs(dx) >= Math.abs(dy) ? dx : dy;
      // am Ende weiter nach vorn ziehen/wischen: nächster Abschnitt
      if (d < 0 && this.isAt("end", true)) {
        p.overflow -= d;
        if (p.overflow > DRAG_EXIT_PX) this.exit();
      } else {
        p.overflow = 0;
      }
      this.target = this.clamp(this.target + d * (touch ? DRAG_K_TOUCH : DRAG_K));
      this.dirty = true;
    }
    p.x = e.clientX;
    p.y = e.clientY;
  };

  private onPointerUp = (e: PointerEvent) => {
    const p = this.pointer;
    if (!p || p.id !== e.pointerId) return;
    this.pointer = null;
    this.renderer.domElement.style.cursor = "";
    if (p.dragging) return;
    const slot = this.pick(e);
    if (!slot) {
      this.back();
      return;
    }
    if (this.focusedSlot === slot && (this.mode === "focus" || this.mode === "glide")) {
      this.cb.onOpen(slot.image);
    } else {
      this.glideToSlot(slot);
    }
  };

  private onPointerCancel = () => {
    this.pointer = null;
    this.renderer.domElement.style.cursor = "";
  };

  private onPointerLeave = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && !this.pointer) this.renderer.domElement.style.cursor = "";
  };

  private pick(e: { clientX: number; clientY: number }): Slot | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.raycaster.setFromCamera(ndc, this.camera);
    // erster Treffer zählt, Wände verdecken dahinterliegende Rahmen
    const hit = this.raycaster.intersectObjects(this.scene.children, true)[0];
    if (!hit || hit.distance > this.ring.fogFar * 0.8) return null;
    return (hit.object.userData.slot as Slot | undefined) ?? null;
  }

  private updateHover(e: PointerEvent) {
    const slot = this.pick(e);
    this.renderer.domElement.style.cursor = slot ? "pointer" : "grab";
  }

  // ---------- Loop ----------

  setActive(on: boolean) {
    if (on === this.active || this.disposed) return;
    this.active = on;
    if (on) {
      this.last = performance.now();
      this.dirty = true;
      this.raf = requestAnimationFrame(this.tick);
    } else {
      cancelAnimationFrame(this.raf);
    }
  }

  private tick = (now: number) => {
    if (!this.active) return;
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;

    if (this.mode === "walk") {
      const diff = this.target - this.pose.theta;
      if (Math.abs(diff) > 1e-5) {
        const k = this.reducedMotion ? 1 : 1 - Math.exp(-dt / TAU);
        this.pose.theta += diff * k;
        this.dirty = true;
      } else if (diff !== 0) {
        this.pose.theta = this.target;
        this.dirty = true;
      }
    } else if ((this.mode === "glide" || this.mode === "return") && this.glideFrom && this.glideTo) {
      const t = this.glideMs <= 0 ? 1 : Math.min(1, (now - this.glideStart) / this.glideMs);
      const a = this.glideFrom;
      const b = this.glideTo;
      const ec = easeOutCubic(t);
      this.pose = {
        theta: a.theta + this.glideDelta * easeOutQuart(t),
        yaw: a.yaw + (b.yaw - a.yaw) * easeOutQuad(t),
        r: a.r + (b.r - a.r) * ec,
        pitch: a.pitch + (b.pitch - a.pitch) * ec,
      };
      this.dirty = true;
      if (t >= 1) {
        if (this.mode === "glide") {
          this.mode = "focus";
        } else {
          // während des Rückwegs aufgelaufene Eingaben übernehmen
          const pending = this.target - a.theta;
          this.mode = "walk";
          this.target = this.pose.theta + pending;
        }
      }
    }

    this.updateEdge(now);

    if (this.dirty) {
      this.dirty = false;
      this.applyPose();
      this.renderer.render(this.scene, this.camera);
    }
    this.raf = requestAnimationFrame(this.tick);
  };

  private updateEdge(now: number) {
    const atStart = this.isAt("start");
    const atEnd = this.isAt("end");
    if (!this.edge || this.edge.atStart !== atStart || this.edge.atEnd !== atEnd) {
      // beim ersten Bericht gilt der Start als "schon lange erreicht"
      this.edgeSince = this.edge ? now : 0;
      this.edge = { atStart, atEnd };
      this.cb.onEdge?.(this.edge);
    }
  }

  private resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.fov = h > w ? 70 : 56;
    this.camera.updateProjectionMatrix();
    const endArc = h > w ? END_ARC_PORTRAIT : END_ARC;
    this.thetaEnd = WALL_ANGLE - 2 * Math.PI + endArc / this.ring.camRadius;
    this.target = this.clamp(this.target);
    if (this.focusedSlot && this.mode === "focus") this.pose = this.focusPose(this.focusedSlot);
    this.dirty = true;
    // sofort zeichnen, damit beim Resize kein leeres Bild erscheint
    if (this.active) {
      this.applyPose();
      this.renderer.render(this.scene, this.camera);
    }
  }

  dispose() {
    this.disposed = true;
    this.setActive(false);
    this.ro.disconnect();
    const c = this.renderer.domElement;
    c.removeEventListener("wheel", this.onWheel);
    c.removeEventListener("pointerdown", this.onPointerDown);
    c.removeEventListener("pointermove", this.onPointerMove);
    c.removeEventListener("pointerup", this.onPointerUp);
    c.removeEventListener("pointercancel", this.onPointerCancel);
    c.removeEventListener("pointerleave", this.onPointerLeave);
    this.textures.forEach((t) => t?.dispose());
    this.disposables.forEach((d) => d.dispose());
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    c.remove();
  }
}
