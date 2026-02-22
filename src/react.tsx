import {
  useEffect,
  useRef,
  type RefObject,
  type CSSProperties,
} from "react";
import {
  ParticleNetwork,
  type ParticleNetworkConfig,
} from "./index";

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
}

export function ParticleNetworkBg({
  config,
  style,
  className,
}: ParticleNetworkBgProps) {
  const canvasRef = useParticleNetwork(config);
  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", ...style }}
      className={className}
    />
  );
}
