import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, ArrowLeft } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'customer' | 'merchant';
  timestamp: string;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  productName: string;
  userType: 'customer' | 'merchant';
}

const ChatDrawer = ({ isOpen, onClose, customerName, productName, userType }: ChatDrawerProps) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hi, I'm interested in ${productName}. Can you provide more details about pricing and availability?`,
      sender: 'customer',
      timestamp: '10:30 AM',
    },
    {
      id: '2',
      text: 'Hello! Thank you for your interest. This product is currently available with competitive pricing. What quantity are you looking for?',
      sender: 'merchant',
      timestamp: '10:32 AM',
    },
    {
      id: '3',
      text: 'I need about 500kg. What would be the best price you can offer?',
      sender: 'customer',
      timestamp: '10:35 AM',
    },
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message,
        sender: userType,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[500px] p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <SheetTitle className="text-left">
                Chat with {userType === 'merchant' ? customerName : 'Merchant'}
              </SheetTitle>
              <p className="text-sm text-muted-foreground">{productName}</p>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === userType ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender !== userType && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>{msg.sender === 'customer' ? 'C' : 'M'}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[70%] rounded-lg px-3 py-2 ${
                    msg.sender === userType
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                </div>
                {msg.sender === userType && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>{userType === 'customer' ? 'C' : 'M'}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button onClick={handleSendMessage} size="sm">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Note: For real-time chat functionality, connect to Supabase backend
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ChatDrawer;