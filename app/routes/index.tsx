import { useEffect, useState } from "react";

import { useSocket } from "~/context";

interface IData {
  cardId: string;
  timestamp: string;
}
export default function Index() {
  const socket = useSocket();
  const [data, setData] = useState<IData | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on("event", (data) => {
      console.log(data);
    });
    socket.on("test", (data: IData) => {
      if (data.cardId && data.timestamp) {
        setData(data);
      }
    });
  }, [socket]);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      {data && (
        <>
          <p>{`cardId: ${data.cardId}`}</p>
          <p>{`timestamp: ${data.timestamp}`}</p>
        </>
      )}
    </div>
  );
}
