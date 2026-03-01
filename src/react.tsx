import {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
  type ReactNode,
  type RefObject,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import {
  ParticleNetwork,
  type ParticleNetworkConfig,
  type ChildParticleConfig,
  type ChildParticlePosition,
} from "./index";

const ParticleNetworkContext = createContext<ParticleNetwork | null>(null);

export function useParticleNetwork(
  config?: Partial<ParticleNetworkConfig>
): RefObject<HTMLCanvasElement | null> {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instanceRef = useRef<ParticleNetwork | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const instance = new ParticleNetwork(canvas, config);
    instanceRef.current = instance;
    instance.start();

    return () => {
      instance.cleanup();
      instanceRef.current = null;
    };
  }, [config]);

  return canvasRef;
}

export interface ParticleNetworkBgProps {
  config?: Partial<ParticleNetworkConfig>;
  style?: CSSProperties;
  className?: string;
  children?: ReactNode;
}

export function ParticleNetworkBg({
  config,
  style,
  className,
  children,
}: ParticleNetworkBgProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [instance, setInstance] = useState<ParticleNetwork | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const inst = new ParticleNetwork(canvas, config);
    inst.start();
    setInstance(inst);

    return () => {
      inst.cleanup();
      setInstance(null);
    };
  }, [config]);

  return (
    <ParticleNetworkContext.Provider value={instance}>
      <canvas
        ref={canvasRef}
        style={{ display: "block", ...style }}
        className={className}
      />
      {children}
    </ParticleNetworkContext.Provider>
  );
}

export interface ChildParticleProps {
  id: string;
  x: number;
  y: number;
  radius: number;
  /** Spring force pulling back to anchor (0-1). Default 0.05. */
  anchorForce?: number;
  /** Mouse influence multiplier (0-1). Default 0.1. */
  mouseInfluence?: number;
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export function ChildParticle(props: ChildParticleProps) {
  return <BaseChildParticle {...props} liquidGlass={false} />;
}

export interface GlassChildParticleProps {
  id: string;
  x: number;
  y: number;
  radius: number;
  /** Spring force pulling back to anchor (0-1). Default 0.05. */
  anchorForce?: number;
  /** Mouse influence multiplier (0-1). Default 0.1. */
  mouseInfluence?: number;
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export function GlassChildParticle(props: GlassChildParticleProps) {
  return <BaseChildParticle {...props} liquidGlass={true} />;
}

interface BaseChildParticleProps extends ChildParticleConfig {
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
}

function BaseChildParticle({
  id,
  x,
  y,
  radius,
  anchorForce,
  mouseInfluence,
  liquidGlass,
  children,
  style,
  className,
}: BaseChildParticleProps) {
  const instance = useContext(ParticleNetworkContext);
  const [overlayEl, setOverlayEl] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!instance) return;
    instance.addChildParticle({ id, x, y, radius, anchorForce, mouseInfluence, liquidGlass });
    setOverlayEl(instance.getChildOverlayElement(id));
    return () => {
      instance.removeChildParticle(id);
      setOverlayEl(null);
    };
  }, [instance, id]);

  useEffect(() => {
    if (!instance || !overlayEl) return;
    instance.updateChildParticle(id, { x, y, radius, anchorForce, mouseInfluence, liquidGlass });
  }, [instance, id, x, y, radius, anchorForce, mouseInfluence, liquidGlass]);

  if (!overlayEl) return null;

  return createPortal(
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderRadius: "50%",
        ...style,
      }}
    >
      {children}
    </div>,
    overlayEl
  );
}
