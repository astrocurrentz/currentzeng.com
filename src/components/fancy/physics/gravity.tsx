"use client";

/*
 * Adapted from Fancy Components' Gravity component:
 * https://github.com/danielpetho/fancy/blob/main/src/fancy/components/physics/gravity.tsx
 * Distributed under the MIT license included beside this file.
 */

import { debounce } from "lodash";
import Matter, {
  Bodies,
  Common,
  Engine,
  Events,
  Mouse,
  MouseConstraint,
  Query,
  Render,
  Runner,
  World,
} from "matter-js";
import decomp from "poly-decomp";
import {
  createContext,
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useContext,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { calculatePosition } from "@/lib/calculate-position";
import { cx } from "@/lib/class-names";
import { parsePathToVertices } from "@/lib/svg-path-to-vertices";

type MatterBodyOptions = Matter.IBodyDefinition;

export type MatterBodyProps = {
  children: ReactNode;
  collisionTargetSelector?: string;
  matterBodyOptions?: MatterBodyOptions;
  isDraggable?: boolean;
  bodyType?: "rectangle" | "circle" | "svg";
  sampleLength?: number;
  x?: number | string;
  y?: number | string;
  angle?: number;
  className?: string;
  style?: CSSProperties;
};

export type GravityProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children: ReactNode;
  debug?: boolean;
  gravity?: { x: number; y: number };
  resetOnResize?: boolean;
  grabCursor?: boolean;
  addTopWall?: boolean;
  autoStart?: boolean;
};

export type GravityRef = {
  start: () => void;
  stop: () => void;
  reset: () => void;
};

type RegisteredElement = {
  element: HTMLElement;
  props: MatterBodyProps;
  body: Matter.Body | null;
};

type GravityContextValue = {
  registerElement: (
    id: string,
    element: HTMLElement,
    props: MatterBodyProps,
  ) => void;
  unregisterElement: (id: string) => void;
};

const defaultBodyOptions: MatterBodyOptions = {
  density: 0.001,
  friction: 0.1,
  isStatic: false,
  restitution: 0.1,
};

const GravityContext = createContext<GravityContextValue | null>(null);

export function MatterBody({
  children,
  className,
  collisionTargetSelector,
  matterBodyOptions = defaultBodyOptions,
  bodyType = "rectangle",
  isDraggable = true,
  sampleLength = 15,
  x = 0,
  y = 0,
  angle = 0,
  style,
}: MatterBodyProps) {
  const context = useContext(GravityContext);
  const elementRef = useRef<HTMLDivElement>(null);
  const id = useId();

  useLayoutEffect(() => {
    const element = elementRef.current;

    if (element === null || context === null) {
      return;
    }

    context.registerElement(id, element, {
      angle,
      bodyType,
      children,
      className,
      collisionTargetSelector,
      isDraggable,
      matterBodyOptions,
      sampleLength,
      style,
      x,
      y,
    });

    return () => context.unregisterElement(id);
  }, [
    angle,
    bodyType,
    className,
    collisionTargetSelector,
    children,
    context,
    id,
    isDraggable,
    matterBodyOptions,
    sampleLength,
    style,
    x,
    y,
  ]);

  return (
    <div
      className={className}
      data-gravity-body=""
      ref={elementRef}
      style={{
        ...style,
        pointerEvents: isDraggable ? "none" : undefined,
        position: "absolute",
      }}
    >
      {children}
    </div>
  );
}

function getBodyRender(debug: boolean) {
  return {
    fillStyle: debug ? "#888888" : "#00000000",
    lineWidth: debug ? 3 : 0,
    strokeStyle: debug ? "#333333" : "#00000000",
  };
}

const Gravity = forwardRef<GravityRef, GravityProps>(function Gravity(
  {
    children,
    debug = false,
    gravity = { x: 0, y: 1 },
    grabCursor = true,
    resetOnResize = true,
    addTopWall = true,
    autoStart = true,
    className,
    style,
    ...props
  },
  ref,
) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const mouseConstraintRef = useRef<Matter.MouseConstraint | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);
  const elementsRef = useRef(new Map<string, RegisteredElement>());
  const gravityX = gravity.x;
  const gravityY = gravity.y;

  const syncElementPositions = useCallback(() => {
    elementsRef.current.forEach(({ body, element }) => {
      if (body === null) {
        return;
      }

      const rotation = body.angle * (180 / Math.PI);
      element.style.transform = `translate(${
        body.position.x - element.offsetWidth / 2
      }px, ${
        body.position.y - element.offsetHeight / 2
      }px) rotate(${rotation}deg)`;
    });
  }, []);

  const runElementSync = useCallback(function syncFrame() {
    syncElementPositions();
    frameIdRef.current = window.requestAnimationFrame(syncFrame);
  }, [syncElementPositions]);

  const stopEngine = useCallback(() => {
    if (frameIdRef.current !== null) {
      window.cancelAnimationFrame(frameIdRef.current);
      frameIdRef.current = null;
    }

    if (runnerRef.current !== null) {
      Runner.stop(runnerRef.current);
    }

    if (renderRef.current !== null) {
      Render.stop(renderRef.current);
    }

    isRunningRef.current = false;
  }, []);

  const startEngine = useCallback(() => {
    const engine = engineRef.current;
    const render = renderRef.current;
    const runner = runnerRef.current;

    if (
      engine === null ||
      render === null ||
      runner === null ||
      isRunningRef.current
    ) {
      return;
    }

    Render.run(render);
    Runner.run(runner, engine);
    frameIdRef.current = window.requestAnimationFrame(runElementSync);
    isRunningRef.current = true;
  }, [runElementSync]);

  const clearRenderer = useCallback(() => {
    stopEngine();

    const engine = engineRef.current;
    const render = renderRef.current;

    if (engine !== null) {
      Events.off(engine, "beforeUpdate");
    }

    if (render !== null) {
      Mouse.clearSourceEvents(render.mouse);
      render.canvas.remove();
      render.textures = {};
    }

    if (engine !== null) {
      World.clear(engine.world, false);
      Engine.clear(engine);
    }

    elementsRef.current.forEach((entry) => {
      entry.body = null;
    });

    engineRef.current = null;
    renderRef.current = null;
    runnerRef.current = null;
    mouseConstraintRef.current = null;
  }, [stopEngine]);

  const createBody = useCallback(
    (entry: RegisteredElement, engine: Matter.Engine) => {
      const canvas = canvasRef.current;

      if (canvas === null) {
        return null;
      }

      const collisionTarget =
        entry.props.collisionTargetSelector === undefined
          ? null
          : canvas.ownerDocument.querySelector(
              entry.props.collisionTargetSelector,
            );
      const collisionTargetRect =
        collisionTarget?.getBoundingClientRect() ?? null;
      const width = collisionTargetRect?.width ?? entry.element.offsetWidth;
      const height = collisionTargetRect?.height ?? entry.element.offsetHeight;

      if (width === 0 || height === 0) {
        return null;
      }

      const canvasRect = canvas.getBoundingClientRect();
      const x =
        collisionTargetRect === null
          ? calculatePosition(entry.props.x, canvasRect.width, width)
          : collisionTargetRect.left - canvasRect.left + width / 2;
      const y =
        collisionTargetRect === null
          ? calculatePosition(entry.props.y, canvasRect.height, height)
          : collisionTargetRect.top - canvasRect.top + height / 2;
      const angle = (entry.props.angle ?? 0) * (Math.PI / 180);
      const options = {
        ...entry.props.matterBodyOptions,
        angle,
        render: getBodyRender(debug),
      } as Matter.IChamferableBodyDefinition;
      let body: Matter.Body;

      if (entry.props.bodyType === "circle") {
        body = Bodies.circle(x, y, Math.max(width, height) / 2, options);
      } else if (entry.props.bodyType === "svg") {
        const vertexSets: Matter.Vector[][] = [];

        entry.element.querySelectorAll("path").forEach((path) => {
          const pathData = path.getAttribute("d");

          if (pathData !== null) {
            vertexSets.push(
              parsePathToVertices(pathData, entry.props.sampleLength),
            );
          }
        });

        body =
          vertexSets.length > 0
            ? Bodies.fromVertices(x, y, vertexSets, options)
            : Bodies.rectangle(x, y, width, height, options);
      } else {
        body = Bodies.rectangle(x, y, width, height, options);
      }

      World.add(engine.world, body);
      entry.body = body;

      return body;
    },
    [debug],
  );

  const registerElement = useCallback(
    (
      id: string,
      element: HTMLElement,
      matterBodyProps: MatterBodyProps,
    ) => {
      const existing = elementsRef.current.get(id);
      const engine = engineRef.current;

      if (existing?.body !== null && existing?.body !== undefined && engine) {
        World.remove(engine.world, existing.body);
      }

      const entry: RegisteredElement = {
        body: null,
        element,
        props: matterBodyProps,
      };

      elementsRef.current.set(id, entry);

      if (engine !== null) {
        createBody(entry, engine);
        syncElementPositions();
      }
    },
    [createBody, syncElementPositions],
  );

  const unregisterElement = useCallback((id: string) => {
    const entry = elementsRef.current.get(id);
    const engine = engineRef.current;

    if (entry?.body !== null && entry?.body !== undefined && engine !== null) {
      World.remove(engine.world, entry.body);
    }

    elementsRef.current.delete(id);
  }, []);

  const initializeRenderer = useCallback(() => {
    const canvas = canvasRef.current;

    if (canvas === null || canvas.offsetWidth === 0 || canvas.offsetHeight === 0) {
      return;
    }

    clearRenderer();
    Common.setDecomp(decomp);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const engine = Engine.create();
    engine.gravity.x = gravityX;
    engine.gravity.y = gravityY;

    const render = Render.create({
      element: canvas,
      engine,
      options: {
        background: "#00000000",
        height,
        width,
        wireframes: false,
      },
    });

    Object.assign(render.canvas.style, {
      height: "100%",
      inset: "0",
      position: "absolute",
      touchAction: "none",
      width: "100%",
    });

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        render: { visible: debug },
        stiffness: 0.2,
      },
    });
    const wallRender = { visible: debug };
    const walls = [
      Bodies.rectangle(width / 2, height + 10, width, 20, {
        friction: 1,
        isStatic: true,
        render: wallRender,
      }),
      Bodies.rectangle(width + 10, height / 2, 20, height, {
        friction: 1,
        isStatic: true,
        render: wallRender,
      }),
      Bodies.rectangle(-10, height / 2, 20, height, {
        friction: 1,
        isStatic: true,
        render: wallRender,
      }),
    ];

    if (addTopWall) {
      walls.push(
        Bodies.rectangle(width / 2, -10, width, 20, {
          friction: 1,
          isStatic: true,
          render: wallRender,
        }),
      );
    }

    World.add(engine.world, [mouseConstraint, ...walls]);

    if (grabCursor) {
      Events.on(engine, "beforeUpdate", () => {
        const hoveredBody = Query.point(
          engine.world.bodies.filter((body) => !body.isStatic),
          mouse.position,
        ).length;

        canvas.style.cursor =
          hoveredBody === 0 ? "default" : mouse.button === 0 ? "grabbing" : "grab";
      });
    }

    engineRef.current = engine;
    renderRef.current = render;
    runnerRef.current = Runner.create();
    mouseConstraintRef.current = mouseConstraint;
    render.mouse = mouse;

    elementsRef.current.forEach((entry) => createBody(entry, engine));
    syncElementPositions();

    if (autoStart) {
      startEngine();
    }
  }, [
    addTopWall,
    autoStart,
    clearRenderer,
    createBody,
    debug,
    grabCursor,
    gravityX,
    gravityY,
    startEngine,
    syncElementPositions,
  ]);

  const contextValue = useMemo(
    () => ({ registerElement, unregisterElement }),
    [registerElement, unregisterElement],
  );

  useImperativeHandle(
    ref,
    () => ({
      reset: initializeRenderer,
      start: startEngine,
      stop: stopEngine,
    }),
    [initializeRenderer, startEngine, stopEngine],
  );

  useLayoutEffect(() => {
    initializeRenderer();

    return clearRenderer;
  }, [clearRenderer, initializeRenderer]);

  useLayoutEffect(() => {
    if (!resetOnResize) {
      return;
    }

    const handleResize = debounce(initializeRenderer, 250);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      handleResize.cancel();
    };
  }, [initializeRenderer, resetOnResize]);

  return (
    <GravityContext.Provider value={contextValue}>
      <div
        {...props}
        className={cx(className)}
        data-gravity-stage=""
        ref={canvasRef}
        style={{
          ...style,
          height: "100%",
          inset: 0,
          position: "absolute",
          width: "100%",
        }}
      >
        {children}
      </div>
    </GravityContext.Provider>
  );
});

Gravity.displayName = "Gravity";

export default Gravity;
