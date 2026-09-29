import { useLayoutEffect, useRef, type RefObject } from "react";

export function useReorderAnimation(
  containerRef: RefObject<HTMLElement | null>,
  orderKey: string,
) {
  const previousPositions = useRef<Map<string, DOMRect>>(new Map());

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const nodes = Array.from(
      container.querySelectorAll<HTMLElement>("[data-reorder-key]"),
    );

    const previous = previousPositions.current;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (previous.size && !reducedMotion) {
      for (const node of nodes) {
        const key = node.dataset.reorderKey;
        const before = key ? previous.get(key) : undefined;
        if (!before) continue;
        const after = node.getBoundingClientRect();
        const x = before.left - after.left;
        const y = before.top - after.top;
        if (Math.abs(x) < 1 && Math.abs(y) < 1) continue;

        for (const animation of node.getAnimations()) {
          if (animation.id === "issue-column-reorder") animation.cancel();
        }
        node.animate(
          [
            { transform: `translate(${x}px, ${y}px)` },
            { transform: "translate(0, 0)" },
          ],
          {
            id: "issue-column-reorder",
            duration: Math.min(260, 160 + Math.max(Math.abs(x), Math.abs(y)) * 0.12),
            easing: "cubic-bezier(0.2, 0.75, 0.25, 1)",
          },
        );
      }
    }

    previousPositions.current = new Map(
      nodes.flatMap((node) => node.dataset.reorderKey
        ? [[node.dataset.reorderKey, node.getBoundingClientRect()] as const]
        : []),
    );
  }, [containerRef, orderKey]);
}
