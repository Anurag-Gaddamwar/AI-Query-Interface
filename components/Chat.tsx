// components/Chat.tsx
'use client';
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { FiSend, FiMessageSquare } from 'react-icons/fi';
import { AiOutlineUser, AiOutlineRobot } from 'react-icons/ai';

const Chat: React.FC = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<{ user: string, text: string, timestamp: Date }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [sessionId] = useState(Math.random().toString(36).substring(7));

    const handleSend = async () => {
        if (input.trim()) {
            const newMessages = [...messages, { user: 'User', text: input, timestamp: new Date() }];
            setMessages(newMessages);
            setInput('');
            setIsLoading(true);

            try {
                const response = await axios.post('http://localhost:5000/api/query', { message: input, sessionId });
                setMessages([...newMessages, { user: 'AI', text: response.data.response, timestamp: new Date() }]);
            } catch (error) {
                console.error('Error sending message:', error);
                setMessages([...newMessages, { user: 'AI', text: 'Sorry, there was an error processing your request.', timestamp: new Date() }]);
            } finally {
                setIsLoading(false);
                scrollToBottom();
            }
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    return (
        <div className="flex flex-col min-h-screen w-full px-4 sm:px-6 lg:px-40 py-4 sm:text-sm text-xs bg-white">
            <div className="flex items-center justify-between mb-4">
                <div className="fixed top-0 z-40 bg-white w-screen pt-6 p-3">
                <h1 className="text-xl font-semibold cursor-pointer text-gray-700 flex items-center">
                    <FiMessageSquare className="mr-2" /> AI Query Interface
                </h1>
                </div>
            </div>
            <div className="flex-grow mb-14 mt-5 overflow-y-auto">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex items-start p-2 my-2 ${msg.user === 'User' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.user === 'AI' && <AiOutlineRobot className="mr-2 text-2xl text-gray-400" />}
                        <div>
                            <span className={`inline-block p-2 rounded-lg ${msg.user === 'User' ? 'bg-blue-500 text-white' : 'bg-gray-200'} transition-transform transform-gpu duration-300 ease-in-out`}>
                                {msg.text}
                            </span>
                            <div className="text-xs text-gray-400 mt-1">{format(msg.timestamp, 'hh:mm a')}</div>
                        </div>
                        {msg.user === 'User' && <AiOutlineUser className="ml-2 text-2xl text-blue-500" />}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start p-2 my-2 justify-start">
                        <AiOutlineRobot className="mr-2 text-2xl text-gray-400" />
                        <span className="inline-block p-2 bg-gray-200 rounded-lg">Loading...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="fixed bottom-0 left-0 w-full px-4 sm:px-6 lg:px-40 py-4 bg-white z-10 shadow-xl">
            <div className="flex items-center">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-grow py-[0.84rem] p-2 text-black border shadow-xl rounded-l-lg focus:outline-none focus:ring-[0.5px] focus:ring-blue-500"
                    placeholder="Type your message..."
                    onFocus={(e) => e.target.placeholder = ''}
                    onBlur={(e) => e.target.placeholder = 'Type your message...'}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') handleSend();
                    }}
                />
                <button
                    onClick={handleSend}
                    className="p-2 bg-blue-500 text-xl text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
                    style={{ height: '3rem' }}
                >
                    <FiSend />
                </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;
