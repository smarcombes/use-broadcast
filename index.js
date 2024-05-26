import { useCallback, useEffect, useReducer, useRef } from "react";

function reducer(state, action) {
  switch (action.type) {
    case "set":
      return action.value;
    default:
      throw new Error();
  }
}

export function useBroadcast(name, initialState) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const channelRef = useRef(null); 
  
    useEffect(() => {
      const channel = new BroadcastChannel(name);
      channelRef.current = channel;
  
      const listener = (event) => {
        let { data: value } = event;
        dispatch({ type: "set", value });
      };
  
      channel.addEventListener("message", listener);
  
      return () => {
        channelRef.current = null;
        channel.removeEventListener("message", listener);
        channel.close();
      };
    }, [name]);
  
    const setState = useCallback((value) => {
      if (channelRef.current) {
        try {
          channelRef.current.postMessage(value);
          dispatch({ type: "set", value });
        } catch (err) {
          console.error(err);
        }
      }
    }, []);
  
    return [state, setState];
  }