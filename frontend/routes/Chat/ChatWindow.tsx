import { useEffect, useRef, useState } from "react";
import styles from "./ChatWindow.module.css";
import { ResponseForm } from "./ResponseForm";
import { v4 as uuidv4 } from "uuid";
import { ChatItem } from "./ChatItem";
import { LoaderFunctionArgs, useLoaderData, useParams } from "react-router-dom";
import { authProvider } from "../../providers/auth-provider";

export async function loader({ params }: LoaderFunctionArgs) {
  const chatId = params.chatId;
  if (typeof chatId === "undefined") {
    return [];
  }
  const response = await fetch("/conversation/chat/" + chatId);
  if (response.ok) {
    const data = await response.json();
    return data as ChatObject[];
  }
  return [] as ChatObject[];
}

export function ChatWindow() {
  const chatHistory = useLoaderData() as ChatObject[];
  const { chatId } = useParams() as { chatId: string };
  const [chat, setChat] = useState<ChatObject[]>(chatHistory);
  const [partialResponse, setPartialResponse] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatId === "0") {
      setChat([]);
    }
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [partialResponse, chat, containerRef]);

  return (
    <div className={styles.container} ref={containerRef}>
      {chatHistory.map((item) => (
        <ChatItem key={uuidv4()} role={item.role} content={item.content} />
      ))}
      {partialResponse && (
        <ChatItem key={uuidv4()} role="system" content={partialResponse} />
      )}
      {!partialResponse && authProvider.user!.credit_balance > 0 && (
        <ResponseForm
          chat={chatHistory}
          setPartialResponse={setPartialResponse}
        />
      )}
      {authProvider.user!.credit_balance <= 0 && (
        <p style={{ color: "red" }}>You have run out of credits!</p>
      )}
    </div>
  );
}
