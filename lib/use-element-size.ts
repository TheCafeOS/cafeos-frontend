"use client";

import {
  useCallback,
  useLayoutEffect,
  useState,
} from "react";

export function useElementSize<T extends HTMLElement>() {
  const [node, setNode] = useState<T | null>(null);

  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });

  const ref = useCallback((element: T | null) => {
    setNode(element);
  }, []);

  useLayoutEffect(() => {
    if (!node) return;

    const measure = () => {
      const rect = node.getBoundingClientRect();

      setSize((prev) => {
        if (
          prev.width === rect.width &&
          prev.height === rect.height
        ) {
          return prev;
        }

        return {
          width: rect.width,
          height: rect.height,
        };
      });
    };

    measure();

    const observer = new ResizeObserver(measure);

    observer.observe(node);

    return () => observer.disconnect();
  }, [node]);

  return {
    ref,
    size,
    node,
} as const;

}