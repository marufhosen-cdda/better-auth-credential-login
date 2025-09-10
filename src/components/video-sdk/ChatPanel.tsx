// ChatPanel.tsx - Real-time chat component
"use client"

import type React from "react"
import { type JSX, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useMeeting, usePubSub } from "@videosdk.live/react-sdk"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { MessageCircle, Send, Users } from "lucide-react"
import { toast } from "sonner"
import type { ChatMessage } from "./types"
import { cn } from "@/lib/utils"

export function ChatPanel(): JSX.Element {
    const [inputMessage, setInputMessage] = useState<string>("")
    const [isTyping, setIsTyping] = useState<boolean>(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const { localParticipant } = useMeeting()

    const { publish: publishChat, messages: chatMessages } = usePubSub("CHAT", {
        onMessageReceived: (data: any) => {
            const message: ChatMessage = {
                id: data.id || Date.now().toString(),
                senderId: data.senderId,
                senderName: data.senderName,
                message: data.message,
                timestamp: data.timestamp || Date.now(),
            }

            // Show notification for messages from other participants
            if (data.senderId !== localParticipant?.id) {
                toast.info(`${data.senderName}: ${data.message}`, {
                    duration: 3000,
                })
            }
        },
        onOldMessagesReceived: (messages: any[]) => {
            console.log("📨 Loaded chat history:", messages.length, "messages")
        },
    })

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [chatMessages])

    const handleSendMessage = useCallback((): void => {
        if (!inputMessage.trim()) return

        const messageData = {
            id: Date.now().toString(),
            senderId: localParticipant?.id,
            senderName: localParticipant?.displayName || "Unknown",
            message: inputMessage.trim(),
            timestamp: Date.now(),
        }

        publishChat(JSON.stringify(messageData), { persist: true })
        setInputMessage("")
        setIsTyping(false)
    }, [inputMessage, publishChat, localParticipant])

    const handleKeyPress = useCallback(
        (e: React.KeyboardEvent): void => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
            }
        },
        [handleSendMessage],
    )

    const formatTime = (timestamp: number): string => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const parsedMessages = useMemo(() => {
        return chatMessages
            .map((msg: any) => {
                try {
                    return JSON.parse(msg.message)
                } catch {
                    return {
                        id: msg.id || Date.now().toString(),
                        senderId: msg.senderId,
                        senderName: msg.senderName,
                        message: msg.message,
                        timestamp: msg.timestamp || Date.now(),
                    }
                }
            })
            .sort((a: ChatMessage, b: ChatMessage) => a.timestamp - b.timestamp)
    }, [chatMessages])

    return (
        <Card className="flex flex-col h-[600px] w-full max-w-md mx-auto shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <MessageCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-foreground">Meeting Chat & Features</h3>
                        <p className="text-sm text-muted-foreground">Chat with participants and manage hand raises</p>
                    </div>
                </div>
                <Badge variant="outline" className="text-sm font-medium">
                    <Users className="mr-1 h-4 w-4" />
                    {parsedMessages.length}
                </Badge>
            </CardHeader>

            <CardContent className="flex flex-col flex-1 p-0">
                <ScrollArea className="flex-1 px-4">
                    <div className="space-y-3 py-4" ref={scrollRef}>
                        {parsedMessages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
                                    <MessageCircle className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h4 className="mt-6 text-base font-medium text-foreground">No messages yet</h4>
                                <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                                    Start the conversation by sending a message below
                                </p>
                            </div>
                        ) : (
                            parsedMessages.map((message: ChatMessage) => {
                                const isOwnMessage = message.senderId === localParticipant?.id
                                return (
                                    <div key={message.id} className={cn("flex w-full", isOwnMessage ? "justify-end" : "justify-start")}>
                                        <div className="flex flex-col max-w-[80%]">
                                            {!isOwnMessage && (
                                                <p className="mb-1 text-xs font-medium text-muted-foreground px-1">{message.senderName}</p>
                                            )}
                                            <div
                                                className={cn(
                                                    "rounded-2xl px-4 py-3 text-sm shadow-sm",
                                                    isOwnMessage
                                                        ? "bg-primary text-primary-foreground rounded-br-md"
                                                        : "bg-muted text-foreground rounded-bl-md",
                                                )}
                                            >
                                                <p className="break-words leading-relaxed">{message.message}</p>
                                                <p
                                                    className={cn(
                                                        "mt-2 text-xs opacity-70",
                                                        isOwnMessage ? "text-right text-primary-foreground/70" : "text-left text-muted-foreground",
                                                    )}
                                                >
                                                    {formatTime(message.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </ScrollArea>

                <div className="border-t bg-background p-4">
                    <div className="flex gap-3">
                        <Input
                            placeholder="Type your message..."
                            value={inputMessage}
                            onChange={(e) => {
                                setInputMessage(e.target.value)
                                setIsTyping(e.target.value.length > 0)
                            }}
                            onKeyPress={handleKeyPress}
                            className="flex-1 bg-background border-input focus:ring-2 focus:ring-primary/20"
                            maxLength={500}
                        />
                        <Button
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim()}
                            size="icon"
                            className="shrink-0 h-10 w-10"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                    {isTyping && (
                        <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                                    <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-100" />
                                    <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-200" />
                                </div>
                                <span className="text-xs text-muted-foreground font-medium">Typing...</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{inputMessage.length}/500</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
