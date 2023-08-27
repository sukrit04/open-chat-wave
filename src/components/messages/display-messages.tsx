"use client";
import { useEffect, useState } from "react";
import { format, isSameDay, subDays } from "date-fns";

import { cn } from "@/lib/utils";
import { Session } from "next-auth";
import UserAvatar from "@/components/user-avatar";
import { useSocket } from "@/components/providers/socket-provider";
import { ExtendedMessage, SocketMessageType } from "@/types";

export const DisplayMessages = ({
  initialData,
  session,
}: {
  initialData: ExtendedMessage[];
  session: Session | null;
}) => {
  const { isConnected, socket } = useSocket();
  const [data, setData] = useState(initialData);

  useEffect(() => {
    if (!socket) return;

    socket.on("global-chat-channel", (socketData: SocketMessageType) => {
      const content = {
        ...socketData,
        message: {
          ...socketData.message,
          createdAt: new Date(socketData.message.createdAt),
        },
      };

      setData((prevData) => [content, ...prevData]);
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  if (data.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">No messages.</p>
    );
  }

  return (
    <div className="flex flex-col-reverse overflow-y-auto no-scrollbar flex-1 gap-y-4 px-4 py-8 border rounded-xl">
      {data.map((eachData, index) => {
        return (
          <MessageCard
            key={eachData.message.id}
            extendedMessage={eachData}
            sessionId={session?.user.id}
          />
        );
      })}
    </div>
  );
};

const MessageCard = ({
  extendedMessage,
  sessionId,
}: {
  extendedMessage: ExtendedMessage;
  sessionId: string | undefined;
}) => {
  const isCurrentUserMessage = extendedMessage.user.id === sessionId;

  const formattedTimeForMessage = (providedDate: Date) => {
    const currentDate = new Date();

    const hourDifference = Math.abs(
      currentDate.getHours() - providedDate.getHours()
    );

    if (hourDifference < 1) return format(providedDate, "h:mm a");

    if (isSameDay(providedDate, currentDate)) {
      return format(providedDate, "'Today at' h:mm a");
    }

    const yesterday = subDays(currentDate, 1);
    if (isSameDay(providedDate, yesterday)) {
      return format(providedDate, "'Yesterday at' HH:mm");
    }

    return format(providedDate, "MM/dd/yyyy h:mm a");
  };

  return (
    <div
      className={cn("flex w-full mt-5", {
        "order-1 justify-end": isCurrentUserMessage,
        "order-2 justify-start": !isCurrentUserMessage,
      })}
    >
      <div
        className={cn("flex gap-x-3 tracking-tight max-w-md", {
          "flex-row-reverse": isCurrentUserMessage,
        })}
      >
        <UserAvatar
          user={extendedMessage.user}
          className="rounded-md h-8 w-8 ring-2 ring-offset-2 ring-primary"
        />

        <div className="flex flex-col gap-y-1">
          <div
            className={cn("text-muted-foreground text-xs flex gap-x-2", {
              "flex-row-reverse": isCurrentUserMessage,
            })}
          >
            <span className="font-bold">
              {extendedMessage.user.name?.split(" ")[0]}
            </span>
            {extendedMessage.message.createdAt && (
              <span className="text-[9px] font-semibold">
                {formattedTimeForMessage(extendedMessage.message.createdAt)}
              </span>
            )}
          </div>
          <div
            className={cn("flex", {
              "justify-end": isCurrentUserMessage,
            })}
          >
            <div
              className={cn(
                "border py-2 px-3 text-sm rounded-xl w-fit break-words flex",
                {
                  "rounded-tr-sm": isCurrentUserMessage,
                  "rounded-tl-sm": !isCurrentUserMessage,
                }
              )}
            >
              <span>{extendedMessage.message.text}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
