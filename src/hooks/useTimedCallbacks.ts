import { useCallback, useEffect, useRef } from "react";

type TimeoutKey = string;

type TimeoutCallback = () => void;

const useTimedCallbacks = () => {
  const timeoutHandles = useRef<Map<TimeoutKey, number>>(new Map());

  const scheduleTimeout = useCallback((key: TimeoutKey, callback: TimeoutCallback, delay: number) => {
    const existing = timeoutHandles.current.get(key);
    if (existing) {
      window.clearTimeout(existing);
    }
    const id = window.setTimeout(() => {
      timeoutHandles.current.delete(key);
      callback();
    }, delay);
    timeoutHandles.current.set(key, id);
  }, []);

  useEffect(() => {
    return () => {
      timeoutHandles.current.forEach((id) => window.clearTimeout(id));
      timeoutHandles.current.clear();
    };
  }, []);

  return { scheduleTimeout };
};

export default useTimedCallbacks;
