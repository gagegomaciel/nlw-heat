import { useEffect, useState } from "react";
import io from "socket.io-client";
import { api } from "../../services/api";

interface IUser {
  avatar_url: string;
  name: string;
}

interface IMessages {
  id: string;
  text: string;
  user: IUser;
}

import logoImg from "../../assets/logo.svg";

import styles from "./styles.module.scss";

const messagesQueue: IMessages[] = [];

const socket = io("http://localhost:3333");

socket.on("new_message", (newMessage: IMessages) => {
  messagesQueue.push(newMessage);
});

export function MessageList() {
  const [messages, setMessages] = useState<IMessages[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (messagesQueue.length > 0) {
        setMessages((prevState) =>
          [messagesQueue[0], prevState[0], prevState[1]].filter(Boolean)
        );

        messagesQueue.shift();
      }
    }, 3000);
  }, []);

  useEffect(() => {
    async function getMessages() {
      try {
        const response = await api.get<IMessages[]>("/messages/last");
        setMessages(response.data);
      } catch (error) {
        console.log(error);
      }
    }
    getMessages();
  }, []);

  return (
    <div className={styles.messageListWrapper}>
      <img src={logoImg} alt="Dowhile 2021" />

      <ul className={styles.messageList}>
        {messages.map((message) => {
          return (
            <li className={styles.message} key={message.id}>
              <p className={styles.messageContent}>{message.text}</p>
              <div className={styles.messageUser}>
                <div className={styles.userImage}>
                  <img src={message.user.avatar_url} alt={message.user.name} />
                </div>
                <span>{message.user.name}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
